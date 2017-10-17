import React from 'react';
import { Form, Input, Icon, Upload, Button } from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import userStore from '../../stores/userStore';

import '../../less/common.less';
import '../../less/accessManager.less';

import ValidatePopover from '../../components/validatePopover';
import CustomModal from '../../components/customModal/CustomModal';
import CustomTree from '../../components/customTree/CustomTree';
import CustomSelect from '../../components/CustomSelect';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';

let InputGroup = Input.Group;
let FormItem = Form.Item;

class EditTransferApply extends React.Component {
  constructor(props) {
    super(props);

    let arr = this.getInitYears();

    this.state = {
      yearFrom: null,
      yearTo: null,
      yearFromDataSource: arr,
      yearToDataSource: cKit.copyJson(arr),

      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],
      targetRecord: {},
      previewVisible: false,
      previewImage: '',
    };

    this.isAfterVisible = this.props.visible;
  }

  componentDidUpdate() {
    if(this.props.visible && !this.isAfterVisible){ // 当本组件显示的时候执行
      this.isAfterVisible = true;

      this.getDropdownOptionsFetch();
      this.getRecordDetailFetch(this.props.record.id);
    }
  }

  getInitYears = () => {
    let arr = [];
    let year = cKit.date2json().year;
    for (let i = 0; i < 30; i++) {
      let str = String(year - i);
      arr.push({
        label: str,
        value: str
      });
    }
    return arr;
  }

  getRecordDetailFetch = (id) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let fileList = this.convertFile(datas.attaches || []);
        let {yearFrom, yearTo, orgId} = datas;
        this.setState({
          targetRecord: datas,
          fileList,
          yearFrom,
          yearTo,
        });
        this.yearFromChange(yearFrom);
        this.yearToChange(yearTo);
        this.getCategoryTreeFetch({orgId});
      } else {
        errorNotice(msg);
      }
    };

    let url = '/turnover/info';
    netKit.getFetch({
      url,
      urlAppend: [id],
      success: successHandler,
      error: this.errorHandler
    });
  }

  convertFile = (fileList) => {
    return fileList.map((item) => {
      let name = item.fileName;
      let file = cKit.checkFileType({name});
      let isImg = file.isImg;
      let thumbUrl = isImg ? 'data:image/jpg;base64,' +  item.thumbnailDatas : file.img;
      return {
        isImg,
        name,
        thumbUrl,
        originFileObj: null,
        type: '',
        uid: Math.random() * (-1),
        status: 'done',
        id: item.id,
      }
    });
  }

  editSubmit = () => {
    this.props.form.validateFields((err, fields) => {
      //每次表单验证，重置错误信息
      let validateErrors = this.validateErrors = {};
      if (err) {
        for (let i in err) {
          validateErrors[err[i].errors[0].field] = {
            visible: true,
            message: err[i].errors[0].message,
            className: 'validator-popover-error'
          };
        }
      } else {
        CustomModal.confirm({
          title: '温馨提示',
          content: '确认提交吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            let {
              orgId,
              turnoverType,
              receiveDept,
              receiver,
              reason,
              categorys,
            } = {...fields};
            let {
              yearFrom,
              yearTo,
            } = this.state;

            let reqParam ={
              orgId,
              receiveDept,
              receiver,
              reason,
              yearFrom,
              yearTo,
              categorys,
              receiveDept,
              receiveDept,
              turnoverType: Number(turnoverType),
              id: this.state.targetRecord.id,
            };

            this.editRecordFetch({
              reqParam,
              success: (datas) => {
                let fn = this.props.success;
                fn && fn(datas);
              }
            });
          }
        });
      }
    });
  }

  beforeUpload = (file, fileList) => {
    let maxLen = 2;
    if(fileList.length > maxLen){
      errorNotice('最多上传两个附件');
      fileList.length = 2;
    }
    let totalSize = 0;
    for (let i = 0; i < fileList.length; i++) {
      let fileItem = fileList[i];
      totalSize += fileItem.size;
      if(totalSize > 10 * 1024 * 1024){
        errorNotice('上传的附件大小总和不可超过10M');
        return false;
      }
      if(!cKit.checkFileType(fileItem)){
        errorNotice('附件格式不支持');
        return false;
      }
    }
  }

  uploadChange = ({file, fileList}) => {
    let oldList = [];
    let removeList = [];
    let formData = new FormData();

    fileList.forEach((item) => {
      if(item.status != 'done'){
        formData.append('attaches', item.originFileObj);
      } else if(item.status == 'removed'){
        removeList.push(item.id);
      } else {
        oldList.push(item);
      }
    });

    //删除文件
    if(file.status == 'removed'){
      CustomModal.confirm({
        title: '温馨提示',
        content: '删除附件后不可恢复，确认删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.delAttach([{
            id: file.id
          }], () => {
            this.setState({fileList});
          });
        }
      });
    } else if(!removeList.length) { //新增 或 删除文件并且完毕
      formData.append('turnoverId', this.state.targetRecord.id);
      this.addAttach(formData, (datas) => {
        let newList = this.convertFile(datas);
        newList.forEach((item, i) => {
          item.status = 'done';
          item.uid = i * (-1);
        });
        this.setState({
          fileList: oldList.concat(newList)
        });
      });
    }
  }

  uploadRemove = () => {
    //查看时，不能删除
    return !this.props.isView;
  }

  addAttach = (reqParam, success) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/turnover/attach/upload';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  delAttach = (reqParam, success) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/turnover/attach/delete';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  checkWord_chinese = (rule, value, callback) => {
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );

    callback(mes);
  }

  yearFromChange = (yearFrom) => {
    let yearToDataSource = this.state.yearToDataSource;
    yearToDataSource.forEach((item) => {
      item.disabled = item.value < yearFrom;
    });
    this.setState({yearFrom, yearToDataSource});

    let yearTo = this.state.yearTo;
    this.props.form.setFieldsValue({
      yearDate: yearFrom && yearTo
    });
  }

  yearToChange = (yearTo) => {
    let yearFromDataSource = this.state.yearFromDataSource;
    yearFromDataSource.forEach((item) => {
      item.disabled = item.value > yearTo;
    });
    this.setState({yearTo, yearFromDataSource});

    let yearFrom = this.state.yearFrom;
    this.props.form.setFieldsValue({
      yearDate: yearFrom && yearTo
    });
  }

  afterClose = () => {
    this.isAfterVisible = false;
    this.validateErrors = {};

    let arr = this.getInitYears();

    //初始化
    this.setState({
      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],
      targetRecord: {},
      yearFrom: null,
      yearTo: null,
      yearFromDataSource: arr,
      yearToDataSource: cKit.copyJson(arr),
    });

    let fn = this.props.afterClose;
    fn && fn();
  }

  editRecordFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/turnover/update';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  getDropdownOptionsFetch = () => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {datas} = response;
        this.setState({
          orgs: datas,
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/org/established/dropdown';
    netKit.getFetch({
      url,
      data: {},
      success: successHandler,
      error: this.errorHandler
    });
  }

  getCategoryTreeFetch = ({orgId}) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        if(this.props.isView){
          let disabledItem = (arr) => {
            arr.forEach((item) => {
              item.disableCheckbox = true;
              let sons = item.children;
              sons && disabledItem(sons);
            });
          };
          disabledItem(datas);
        }
        this.setState({
          categorySource: datas,
          checkedKeys: this.state.targetRecord.categorys,
        });
      } else {
        errorNotice(msg);
      }
    };

    let url = '/category/tree';
    netKit.getFetch({
      url,
      data: {
        orgId,
        //后端要求，此时传空值
        sysPid: ''
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  fileDownFetch = ({isImg, id}) => {
    if(isImg){
      let successHandler = (blobResponse) => {
        this.setState({
          previewImage: window.URL.createObjectURL(blobResponse),
          previewVisible: true,
        });
      };
      let url = '/turnover/attach/download';
      netKit.getFetch({
        url,
        data: {id},
        dataType: 'stream',
        success: successHandler,
        error: this.errorHandler
      });
    } else {
      let url = cKit.makeUrl('/turnover/attach/download', {
        id,
        'x-auth-token': userStore.getSessionId()
      });
      window.open(url);
    }
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  setRecord = (prop, value) => {
    let record = {...this.state.targetRecord};
    record[prop] = value;
    this.setState({
      targetRecord: record
    });
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form;

    let attachmentReadonly = this.props.isView ? 'attachment-readonly' : '';
    let uploadClass = `form-element-readonly upload-attachment ${attachmentReadonly}`;

    return (
      <CustomModal
        title="移交申请"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
        width={520}
        operate={
          !this.props.isView &&
          <Button type="primary" onClick={this.editSubmit}>
            提交
          </Button>
        }
      >
        <div className="access-apply-form" ref="accessApplyForm">
          <Form>
            <ValidatePopover validatePoppoverId="orgId"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">移交单位</label>
                <FormItem>
                  {getFieldDecorator('orgId', {
                    initialValue: String(this.state.targetRecord.orgId || ''),
                    rules: [{
                      required: true,
                      message: '请输入移交单位',
                    }],
                  })(
                    <CustomSelect
                      className="form-element"
                      disabled={this.props.isView}
                      getPopupContainer={(trigger) => this.refs.accessApplyForm}
                      onChange={(value) => {
                        this.getCategoryTreeFetch({
                          orgId: Number(value)
                        });
                      }}
                      dataSource={this.state.orgs}
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="turnoverType"
                             validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">移交类型</label>
                <FormItem>
                    {getFieldDecorator('turnoverType', {
                      initialValue: String(this.state.targetRecord.turnoverType || ''),
                      rules: [{
                        required: true,
                        message: '请输入移交类型',
                      }],
                    })(
                      <CustomSelect
                        disabled={this.props.isView}
                        getPopupContainer={(trigger) => this.refs.accessApplyForm}
                        className="form-element"
                        dataSource={[{
                          value: '10',
                          label: '对内移交'
                        }, {
                          value: '20',
                          label: '对外移交'
                        }]}
                      />
                    )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="receiveDept"
                             validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">接收部门</label>
                <FormItem>
                  {getFieldDecorator('receiveDept', {
                    initialValue: this.state.targetRecord.receiveDept,
                    rules: [{
                      required: true,
                      message: '请输入接收部门',
                    }, {
                      max: 40,
                      message: '输入长度最大为40',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input
                      autoComplete="off"
                      className="form-element"
                      placeholder="请输入接收部门"
                      disabled={this.props.isView}
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="receiver"
                             validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">接收人</label>
                <FormItem>
                  {getFieldDecorator('receiver', {
                    initialValue: this.state.targetRecord.receiver,
                    rules: [{
                      required: true,
                      message: '请输入接收人',
                    }, {
                      max: 20,
                      message: '输入长度最大为20',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input
                      autoComplete="off"
                      className="form-element"
                      placeholder="请输入接收人"
                      disabled={this.props.isView}
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="reason"
                             validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">移交原因</label>
                <FormItem>
                    {getFieldDecorator('reason', {
                      initialValue: this.state.targetRecord.reason,
                      rules: [{
                        required: true,
                        message: '请输入移交原因',
                      }, {
                        max: 50,
                        message: '输入长度最大为50',
                      }, {
                        validator: this.checkWord_chinese
                      }],
                    })(
                      <Input
                        autoComplete="off"
                        className="form-element"
                        placeholder="请输入移交原因"
                        disabled={this.props.isView}
                      />
                    )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="attaches"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label vt" >添加附件</label>
                <FormItem>
                  <Upload
                    className={uploadClass}
                    listType="picture-card"
                    disabled={this.props.isView}
                    fileList={this.state.fileList}
                    onPreview={(file) => {
                      this.fileDownFetch(file);
                    }}
                    beforeUpload={this.beforeUpload}
                    onChange={this.uploadChange}
                    onRemove={this.uploadRemove}
                    multiple={true}
                    customRequest={() => {}}
                  >
                    {
                      (!this.props.isView && this.state.fileList.length < 2) &&
                      <div>
                        <Icon type="plus" />
                        <div className="upload-text">添加</div>
                      </div>
                    }
                  </Upload>
                  <CustomModal
                    visible={this.state.previewVisible}
                    operate={false}
                    onCancel={() => {
                      this.setState({
                        previewVisible: false
                      });
                    }}
                  >
                    <img alt="example" style={{width:'100%'}} src={this.state.previewImage}/>
                  </CustomModal>
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="categorys"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label vt">移交目录</label>
                <FormItem>
                  {getFieldDecorator('categorys', {
                    initialValue: this.state.checkedKeys,
                    rules: [{
                      required: true,
                      message: '请输入移交目录',
                    }],
                  })(
                    <CustomTree
                      disabled={this.props.isView}
                      checkable
                      titleMark="object.categoryName"
                      onCheck={(checkedKeys) => {
                        this.setState({checkedKeys});
                        setFieldsValue({
                          categorys: checkedKeys
                        })
                      }}
                      checkedKeys={this.state.checkedKeys}
                      className="form-element-readonly category-tree"
                      dataSource={this.state.categorySource}
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="yearDate"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">档案期间</label>
                <FormItem>
                  {getFieldDecorator('yearDate', {
                    rules: [{
                      required: true,
                      message: '请输入档案期间',
                    }],
                  })(
                    <content>
                      <CustomSelect
                        getPopupContainer={(trigger) => this.refs.accessApplyForm}
                        disabled={this.props.isView}
                        value={this.state.yearFrom}
                        placeholder="开始年"
                        className="form-element-half"
                        dataSource={this.state.yearFromDataSource}
                        onChange={(value) => {
                          this.yearFromChange(value);
                        }}
                      />
                      ~
                      <CustomSelect
                        getPopupContainer={(trigger) => this.refs.accessApplyForm}
                        disabled={this.props.isView}
                        value={this.state.yearTo}
                        placeholder="结束年"
                        className="form-element-half"
                        dataSource={this.state.yearToDataSource}
                        onChange={(value) => {
                          this.yearToChange(value);
                        }}
                      />
                    </content>
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
          </Form>
        </div>
      </CustomModal>
    );
  }
}

EditTransferApply = Form.create({})(EditTransferApply);
export default EditTransferApply;