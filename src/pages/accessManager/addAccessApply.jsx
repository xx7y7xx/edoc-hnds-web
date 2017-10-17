import React from 'react';
import { Form, Input, Icon, Upload, DatePicker, Button } from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';

import '../../less/common.less';
import '../../less/accessManager.less';

import ValidatePopover from '../../components/validatePopover';
import CustomModal from '../../components/customModal/CustomModal';
import CustomTree from '../../components/customTree/CustomTree';
import CustomSelect from '../../components/CustomSelect';
import CustomRangePicker from '../../components/CustomRangePicker';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';

const { MonthPicker } = DatePicker;

let InputGroup = Input.Group;
let FormItem = Form.Item;

class AddAccessApply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOrg: '',

      recordStartTime: null,
      recordEndTime: null,

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
              consultOrgId,
              consultDate,
              consultReason,
              categoryIdList,
            } = {...fields};
            let {fileList, recordStartTime, recordEndTime} = this.state;

            let [consultBeginDate, consultEndDate] = consultDate;

            recordStartTime = cKit.date2json(recordStartTime);
            recordEndTime = cKit.date2json(recordEndTime);

            let formData = new FormData();
            formData.append('consultOrgId', consultOrgId);
            formData.append('beginAccountYear', recordStartTime.sYear);
            formData.append('beginAccountMonth', recordStartTime.sMonth);
            formData.append('endAccountYear', recordEndTime.sYear);
            formData.append('endAccountMonth', recordEndTime.sMonth);

            formData.append('consultBeginDate', consultBeginDate.format('YYYY-MM-DD'));
            formData.append('consultEndDate', consultEndDate.format('YYYY-MM-DD'));
            formData.append('consultReason', consultReason);

            categoryIdList.forEach((item) => {
              formData.append('categoryId', item);
            });
            fileList.forEach((item) => {
              formData.append('attaches', item.originFileObj);
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

  afterClose = () => {
    this.isAfterVisible = false;
    this.validateErrors = {};

    this.setState({
      selectedOrg: '',
      recordStartTime: null,
      recordEndTime: null,
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

    let url = '/consult/add';
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

    let url = '/org/established/noperm/dropdown';
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
        title="查阅申请"
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
            <ValidatePopover validatePoppoverId="consultOrgId"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">查阅单位</label>
                <FormItem>
                  {getFieldDecorator('consultOrgId', {
                    initialValue: this.state.selectedOrg,
                    rules: [{
                      required: true,
                      message: '请输入查阅单位',
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
            <ValidatePopover validatePoppoverId="consultDate"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">查阅时间</label>
                <FormItem>
                  {getFieldDecorator('consultDate', {
                    rules: [{
                      required: true,
                      message: '请输入查阅时间',
                    }],
                  })(
                    <CustomRangePicker
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
                    className="form-element-readonly upload-attachment"
                    listType="picture-card"
                    fileList={this.state.fileList}
                    onPreview={(file) => {
                      this.setState({
                        previewImage: file.url || file.thumbUrl,
                        previewVisible: true,
                      });
                    }}
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
            <ValidatePopover validatePoppoverId="categoryIdList"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label  required-item vt">查阅目录</label>
                <FormItem>
                  {getFieldDecorator('categoryIdList', {
                    rules: [{
                      required: true,
                      message: '请输入查阅目录',
                    }],
                  })(
                    <CustomTree
                      checkable
                      checkedKeys={this.state.checkedKeys}
                      titleMark="object.categoryName"
                      onCheck={(checkedKeys) => {
                        this.setState({checkedKeys});
                        setFieldsValue({
                          categoryIdList: checkedKeys
                        })
                      }}
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
                  {getFieldDecorator('accountDate', {
                    initialValue:
                      this.state.recordStartTime &&
                      this.state.recordEndTime
                    ,
                    rules: [{
                      required: true,
                      message: '请输入档案期间',
                    }],
                  })(
                    <content>
                      <MonthPicker
                        getCalendarContainer={(trigger) => this.refs.accessApplyForm}
                        value={this.state.recordStartTime}
                        style={{
                          width: 156
                        }}
                        disabledDate={(currentDate) => {
                          return currentDate.isAfter(this.state.recordEndTime);
                        }}
                        onChange={(recordStartTime) => {
                          this.setState({recordStartTime});
                          if(this.state.recordEndTime){
                            setFieldsValue({
                              accountDate: recordStartTime
                            })
                          }
                        }}
                      />
                      ~
                      <MonthPicker
                        getCalendarContainer={(trigger) => this.refs.accessApplyForm}
                        value={this.state.recordEndTime}
                        style={{
                          width: 157
                        }}
                        disabledDate={(currentDate) => {
                          return currentDate.isBefore(this.state.recordStartTime);
                        }}
                        onChange={(recordEndTime) => {
                          this.setState({recordEndTime});
                          if(this.state.recordStartTime){
                            setFieldsValue({
                              accountDate: recordEndTime
                            })
                          }
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