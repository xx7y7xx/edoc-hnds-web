import React from 'react';
import { Form, Input, Icon, Upload, DatePicker, Button } from 'antd';
import moment from 'moment';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import userStore from '../../stores/userStore';

import '../../less/common.less';
import '../../less/accessManager.less';

import ValidatePopover from '../../components/validatePopover';
import CustomRangePicker from '../../components/CustomRangePicker';
import CustomModal from '../../components/customModal/CustomModal';
import CustomTree from '../../components/customTree/CustomTree';
import CustomSelect from '../../components/CustomSelect';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';

const { MonthPicker } = DatePicker;

let InputGroup = Input.Group;
let FormItem = Form.Item;

class AddAccessApply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],
      targetRecord: {},
      previewVisible: false,
      previewImage: '',
      submitBtn: {
        loading: false
      }
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

  getRecordDetailFetch = (id) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let fileList = this.convertFile(datas.attaches || []);
        this.setState({
          targetRecord: datas,
          fileList,
        });
        this.getCategoryTreeFetch({
          orgId: datas.consultOrgId
        });
      } else {
        errorNotice(msg);
      }
    };

    let url = '/consult/detail';
    netKit.getFetch({
      url,
      data: {
        rec_consult_id: id
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  convertFile = (fileList) => {
    return fileList.map((item) => {
      let name = item.fileName;
      let file = cKit.checkFileType({name});
      let isImg = file.isImg;
      let thumbUrl = isImg ? 'data:image/jpg;base64,' +  item.base64Code : file.img;
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
              id,
              beginAccountYear,
              beginAccountMonth,
              endAccountYear,
              endAccountMonth,
            } = this.state.targetRecord;
            let {
              consultDate,
              consultReason,
            } = {...fields};
            let [consultBeginDate, consultEndDate] = consultDate;

            consultBeginDate = consultBeginDate.format('YYYY-MM-DD');
            consultEndDate = consultEndDate.format('YYYY-MM-DD');
            this.setState({
              submitBtn:{
                loading: true
              }
            })
            this.editRecordFetch({
              reqParam: {
                id,
                consultReason,
                beginAccountYear,
                beginAccountMonth,
                endAccountYear,
                endAccountMonth,
                consultBeginDate,
                consultEndDate,
                recConsultCategoryList: this.state.checkedKeys.map((item) => {
                  return {categoryId: item};
                })
              },
              success: (datas) => {
                let fn = this.props.success;
                fn && fn(datas);
                this.setState({
                  submitBtn:{
                    loading: false
                  }
                })
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
    let attaches = new FormData();

    fileList.forEach((item) => {
      if(item.status != 'done'){
        attaches.append('attaches', item.originFileObj);
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
            id:file.id
          }], () => {
            this.setState({fileList});
          });
        }
      });
    } else if(!removeList.length) { //新增 或 删除文件并且完毕
      this.addAttach({
        attaches,
        consultId: this.state.targetRecord.id,
      }, (datas) => {
        let newList = this.convertFile(datas.attaches);
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

    let {consultId, attaches} = reqParam;

    let url = '/consult/attach/save';
    netKit.postFetch({
      url,
      data: attaches,
      param: {
        consult_id: consultId
      },
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

    let url = '/consult/attach/del';
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

  afterClose = () => {
    this.isAfterVisible = false;
    this.validateErrors = {};
    //初始化
    this.setState({
      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],
      targetRecord: {},
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

    let url = '/consult/update';
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
          checkedKeys: this.state.targetRecord.categoryIdList,
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
      let url = '/consult/attach/download';
      netKit.getFetch({
        url,
        data: {id},
        dataType: 'stream',
        success: successHandler,
        error: this.errorHandler
      });
    } else {
      let url = cKit.makeUrl('/consult/attach/download', {
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
        title="查阅申请"
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        width={520}
        operate={
          !this.props.isView &&
          <Button type="primary" onClick={this.editSubmit} loading={this.state.submitBtn.loading}>
            提交
          </Button>
        }
      >
        <div className="access-apply-form" ref="accessApplyForm">
          <Form>
            <ValidatePopover validatePoppoverId="consultOrgId"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">查阅单位</label>
                <FormItem>
                  {getFieldDecorator('consultOrgId', {
                    initialValue: String(this.state.targetRecord.consultOrgId || ''),
                    rules: [{
                      required: true,
                      message: '请输入查阅单位',
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
            <ValidatePopover validatePoppoverId="consultDate"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">查阅时间</label>
                <FormItem>
                  {getFieldDecorator('consultDate', {
                    initialValue: [
                      moment(
                        this.state.targetRecord.consultBeginDate,
                        'YYYY-MM-DD'
                      ),
                      moment(
                        this.state.targetRecord.consultEndDate,
                        'YYYY-MM-DD'
                      )
                    ]
                  })(
                    <CustomRangePicker
                      allowClear={false}
                      disabled={this.props.isView}
                      getCalendarContainer={(trigger) => this.refs.accessApplyForm}
                      style={{
                        width: 322
                      }}
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="consultReason"
                             validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">查阅原因</label>
                <FormItem>
                    {getFieldDecorator('consultReason', {
                      initialValue: this.state.targetRecord.consultReason,
                      rules: [{
                        required: true,
                        message: '请输入查阅原因',
                      }, {
                        max: 50,
                        message: '输入长度最大为50',
                      }, {
                        validator: this.checkWord_chinese
                      }],
                    })(
                      <Input
                        className="form-element"
                        placeholder="请输入查阅原因"
                        autoComplete="off"
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
            <ValidatePopover validatePoppoverId="categoryIdList"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label vt">查阅目录</label>
                <FormItem>
                  {getFieldDecorator('categoryIdList', {
                    initialValue: this.state.checkedKeys,
                    rules: [{
                      required: true,
                      message: '请输入查阅目录',
                    }],
                  })(
                    <CustomTree
                      disabled={this.props.isView}
                      checkable
                      titleMark="object.categoryName"
                      onCheck={(checkedKeys) => {
                        this.setState({checkedKeys});
                        setFieldsValue({
                          categoryIdList: checkedKeys
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
            <ValidatePopover validatePoppoverId="accountDate"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">档案期间</label>
                <FormItem>
                  {getFieldDecorator('accountDate', {})(
                    <content>
                      <MonthPicker
                        allowClear={false}
                        disabled={this.props.isView}
                        getCalendarContainer={(trigger) => this.refs.accessApplyForm}
                        value={
                          moment(
                            this.state.targetRecord.beginAccountYear + '-' +
                            this.state.targetRecord.beginAccountMonth,
                            'YYYY-MM'
                          )
                        }
                        style={{
                          width: 156
                        }}
                        disabledDate={(currentDate) => {
                          return currentDate.isAfter(
                            moment(
                              this.state.targetRecord.endAccountYear + '-' +
                              this.state.targetRecord.endAccountMonth,
                              'YYYY-MM'
                            )
                          );
                        }}
                        onChange={(recordStartTime, str) => {
                          let arr = str.split('-');
                          this.setRecord('beginAccountYear', arr[0]);
                          this.setRecord('beginAccountMonth', arr[1]);
                        }}
                      />
                      ~
                      <MonthPicker
                        allowClear={false}
                        disabled={this.props.isView}
                        getCalendarContainer={(trigger) => this.refs.accessApplyForm}
                        value={
                          moment(
                            this.state.targetRecord.endAccountYear + '-' +
                            this.state.targetRecord.endAccountMonth,
                            'YYYY-MM'
                          )
                        }
                        style={{
                          width: 157
                        }}
                        disabledDate={(currentDate) => {
                          return currentDate.isBefore(
                            moment(
                              this.state.targetRecord.beginAccountYear + '-' +
                              this.state.targetRecord.beginAccountMonth,
                              'YYYY-MM'
                            )
                          );
                        }}
                        onChange={(recordEndTime, str) => {
                          let arr = str.split('-');
                          this.setRecord('endAccountYear', arr[0]);
                          this.setRecord('endAccountMonth', arr[1]);
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

AddAccessApply = Form.create({})(AddAccessApply);
export default AddAccessApply;