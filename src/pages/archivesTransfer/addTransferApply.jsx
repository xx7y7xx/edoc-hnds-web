import React from 'react';
import { Form, Input, Icon, Upload, Button } from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';

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

class AddTransferApply extends React.Component {
  constructor(props) {
    super(props);
    let arr = this.getInitYears();

    this.state = {
      selectedOrg: '',

      yearFrom: null,
      yearTo: null,
      yearFromDataSource: arr,
      yearToDataSource: cKit.copyJson(arr),


      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],

      submitBtn: {
        loading: false
      },
    };

    this.isAfterVisible = this.props.visible;
  }

  componentDidUpdate() {
    if(this.props.visible && !this.isAfterVisible){ // 当本组件显示的时候执行
      this.isAfterVisible = true;

      this.getDropdownOptionsFetch();
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

  uploadChange = ({fileList}) => {
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

      let fileInfo = cKit.checkFileType(fileItem);
      if(fileInfo){
        fileItem.thumbUrl = fileInfo.img;
        fileItem.status = 'done';
        fileItem.uid = i * (-1);
      } else {
        errorNotice('附件格式不支持');
        return false;
      }
    }

    this.setState({fileList});
  }

  addSubmit = () => {
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
                fileList
              } = this.state;

            let formData = new FormData();
            formData.append('orgId', orgId);
            formData.append('turnoverType', turnoverType);
            formData.append('receiveDept', receiveDept);
            formData.append('receiver', receiver);
            formData.append('reason', reason);
            formData.append('yearFrom', yearFrom);
            formData.append('yearTo', yearTo);

            categorys.forEach((item) => {
              formData.append('categorys', item);
            });
            fileList.forEach((item) => {
              formData.append('files', item.originFileObj);
            });

            this.addRecordFetch({
              reqParam: formData,
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

    this.setState({
      selectedOrg: '',
      yearFrom: null,
      yearTo: null,
      yearFromDataSource: arr,
      yearToDataSource: cKit.copyJson(arr),
      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],
    });

    let fn = this.props.afterClose;
    fn && fn();
  }

  addRecordFetch = ({reqParam, success}) => {
    this.setState({
      submitBtn:{
        loading: true
      }
    });
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/turnover/add';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.setState({
          submitBtn:{
            loading: false
          }
        });
      }
    });
  }

  getDropdownOptionsFetch = () => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {datas} = response;

        let selectedOrg = datas[0] ? datas[0].value : '';
        this.setState({
          selectedOrg,
          orgs: datas,
        });

        selectedOrg && this.getCategoryTreeFetch({
          orgId: Number(selectedOrg)
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
        this.setState({
          categorySource: datas,
          checkedKeys: [],
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

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    return (
      <CustomModal
        title="移交申请"
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        width={520}
        operate={
          <Button
            type="primary"
            loading={this.state.submitBtn.loading}
            onClick={this.addSubmit}
          >
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
                    initialValue: this.state.selectedOrg,
                    rules: [{
                      required: true,
                      message: '请输入移交单位',
                    }],
                  })(
                    <CustomSelect
                      className="form-element"
                      getPopupContainer={(trigger) => this.refs.accessApplyForm}
                      onChange={(value) => {
                        this.getCategoryTreeFetch({
                          orgId: Number(value)
                        })
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
                    initialValue: '10',
                    rules: [{
                      required: true,
                      message: '请输入移交类型',
                    }],
                  })(
                    <CustomSelect
                      className="form-element"
                      getPopupContainer={(trigger) => this.refs.accessApplyForm}
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
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="files"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label vt" >添加附件</label>
                <FormItem>
                  <Upload
                    className="form-element-readonly upload-attachment"
                    listType="picture-card"
                    fileList={this.state.fileList}
                    onPreview={(file) => {
                      this.setState({
                        previewImage: file.url || file.thumbUrl,
                        previewVisible: true,
                      });
                    }}
                    //beforeUpload={this.beforeUpload}
                    onChange={this.uploadChange}
                    multiple={true}
                    customRequest={() => {}}
                  >
                    {
                      this.state.fileList.length < 2 &&
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
                <label className="common-head-label  required-item vt">移交目录</label>
                <FormItem>
                  {getFieldDecorator('categorys', {
                    rules: [{
                      required: true,
                      message: '请输入移交目录',
                    }],
                  })(
                    <CustomTree
                      checkable
                      checkedKeys={this.state.checkedKeys}
                      titleMark="object.categoryName"
                      onCheck={(checkedKeys) => {
                        this.setState({checkedKeys});
                        setFieldsValue({
                          categorys: checkedKeys
                        })
                      }}
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
                        placeholder="开始年"
                        className="form-element-half"
                        getPopupContainer={(trigger) => this.refs.accessApplyForm}
                        dataSource={this.state.yearFromDataSource}
                        onChange={(value) => {
                          this.yearFromChange(value);
                        }}
                      />
                      ~
                      <CustomSelect
                        placeholder="结束年"
                        className="form-element-half"
                        getPopupContainer={(trigger) => this.refs.accessApplyForm}
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

AddTransferApply = Form.create({})(AddTransferApply);
export default AddTransferApply;