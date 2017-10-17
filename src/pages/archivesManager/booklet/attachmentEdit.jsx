import React from 'react';
import $ from 'jquery'
import moment from 'moment'
import {Form, Input, DatePicker} from 'antd';
import CustomSelect from '../../../components/CustomSelect';
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import '../../../less/common.less';
import '../../../less/archivesManager/attachmentCollect.less';
import ValidatePopover from '../../../components/validatePopover';
import CustomModal from '../../../components/customModal/CustomModal';
import {errorNotice} from '../../../components/Common';
import {Validator}  from '../../../utils/base/validator';
import {secretLevel, srcType} from '../../../utils/common/commonOptions'
let InputGroup = Input.Group;
let FormItem = Form.Item;

class AttachmentCollect extends React.Component {
  state = {
    modalKey: Math.random(),
    submitBtn: {
      loading: false
    }
  };
  validateErrors = [];
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
        this.validateErrors = validateErrors
      } else {
        let thiz = this;
        let successHandler = function (response) {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            thiz.props.onUpdateOk(response.datas)
          } else {
            errorNotice(response.msg)
          }
        }
        let errorHandler = function (error) {
          errorNotice(error)
        }
        let completeHandler = function () {
          thiz.setState({
            submitBtn:{
              loading: false
            }
          })
        }
        fields.docDate = fields.docDate.format('YYYY-MM-DD');
        let postBody = fields;
        postBody.id = this.props.attachmentRecord.id;
        let url = cKit.makeUrl('/file/update?current_org_id=' + this.props.fileBaseData.current_org_id);
        let action = new netKit.CorsPostAction(null, url, fields, successHandler, errorHandler, completeHandler);
        thiz.setState({
          submitBtn:{
            loading: true
          }
        })
        action.submit();
      }
    });
  }

  afterClose = () => {
    this.validateErrors = [];
    this.setState({
      modalKey: Math.random()
    });
    let fn = this.props.afterClose;
    fn && fn();
  }

  handleCancel = () => this.setState({previewVisible: false})

  localFilesAdd = (e) => {
    e.stopPropagation();
    $('.attachment-upload').find('input').trigger('click');
  }

  cameraAdd = (e) => {
    e.stopPropagation();
    //$('.attachment-upload').find('input').trigger('click');
    console.log('camera')
  }

  checkWord_chinese = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
    callback(mes);
  }
  checkEmail = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.EMAIL(value) || (mes = '输入邮箱格式不正确') );
    callback(mes);
  }
  checkMobile = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.PHONE_NUMBER(value) || (mes = '输入电话格式不正确') );


    callback(mes);
  }
  checkLetterNumber = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.ALLLETTERNUMBER(value) || (mes = '请输入字母或数字') );

    callback(mes);
  }
  checkNumber = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.POSITIVE_INTEGER_NONZERO(value) || (mes = '请输入正整数') );

    callback(mes);
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const record = this.props.attachmentRecord;
    return (
      <CustomModal
        title={'附件采集'}
        key={this.state.modalKey}
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        onOk={this.addSubmit}
        width={800}
        footer={null}
        maskClosable={false}
        onOkLoading={this.state.submitBtn.loading}
      >
        <div>
          <Form className="collection-form">
            <div className="form-left">
              <ValidatePopover validatePoppoverId="categoryId"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">目录</label>
                  <FormItem className="form-item">
                    <Input value={record.categoryName} disabled/>
                  </FormItem>
                </InputGroup>
              </ValidatePopover>

              <ValidatePopover validatePoppoverId="title"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">题名</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('title', {
                      initialValue: record.title,
                      rules: [{
                        required: true, message: '请输入题名',
                      }, {
                        max: 20, message: '不得超过20字符!'
                      }],
                    })(
                      <Input autoComplete="off" placeholder="请输入附件题名"/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>

              <ValidatePopover validatePoppoverId="docDate"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">所属日期</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('docDate', {
                      initialValue: moment(record.docDate, 'YYYY-MM-DD'),
                      rules: [
                        {
                          required: true, message: '请选择日期'
                        }
                      ],
                    })(
                      <DatePicker
                        onChange={() => {
                        }}
                        placeholder="请选择附件所属日期"
                        disabledDate={
                          (currentDate) => {
                            return currentDate > moment(Date.now())
                          }
                        }
                        format='YYYY-MM-DD'
                      />
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>

              <ValidatePopover validatePoppoverId="secretLevel"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label
                    className="common-head-label collection-head-label required-item">密级</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('secretLevel', {
                      initialValue: record.secretLevel  + '',
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        },
                        {
                          required: true, message: '请选择密级',
                        },
                        {
                          validator: this.checkPhone
                        }],
                    })(
                      <CustomSelect placeholder="请选择密级" dataSource={secretLevel}/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>

              <ValidatePopover validatePoppoverId="pages" validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">页数</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('pages', {
                      initialValue: (record.pages || '') + '',
                      rules: [
                        {
                          max: 3, message: '页数过大'
                        },
                        {
                          validator: this.checkNumber
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入附件页数" disabled={record.storeType === 1}/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
            </div>
            <div className="form-right">
              <ValidatePopover validatePoppoverId="fileNo"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">文号</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('fileNo', {
                      initialValue: record.fileNo,
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入文号"/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="keywords"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">关键词</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('keywords', {
                      initialValue: record.keywords,
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入关键词"/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="abstracts"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">摘要</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('abstracts', {
                      initialValue: record.abstracts,
                      rules: [
                        {
                          max: 60, message: '不得超过60字符!'
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入附件摘要"/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="owner"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">责任人</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('owner', {
                      initialValue: record.owner,
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        },
                        {
                          validator: this.checkWord_chinese
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入企业联系人"/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="srcType"
                               validateErrors={this.validateErrors}>
                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">来源</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('srcType', {
                      initialValue: record.srcType + '',
                      rules: [
                        {
                          validator: this.checkWord_chinese
                        }
                      ],
                    })(
                      <CustomSelect placeholder="" dataSource={srcType} disabled={true}/>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
            </div>
          </Form>
        </div>

      </CustomModal>
    );
  }
}

AttachmentCollect = Form.create({})(AttachmentCollect);
export default AttachmentCollect;