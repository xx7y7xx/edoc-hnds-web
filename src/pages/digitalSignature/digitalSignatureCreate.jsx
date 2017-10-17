import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import {Form, Input, Cascader, Button} from 'antd';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';
import CustomModal from '../../components/customModal/CustomModal';
import CustomSelect from '../../components/CustomSelect';
import ValidatePopover from '../../components/validatePopover';
import {provincesOptions} from '../../utils/common/provinces_citys'
import '../../less/digitalSignature/digitalSignature.less'
let InputGroup = Input.Group;
let FormItem = Form.Item;

class DigitalSignatureCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitBtn: {
        loading: false
      }
    };
  }

  //默认记录应为null，不能为{}
  record = null
  //表单验证错误信息
  validateErrors = {}

  componentDidMount() {
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
        let reqParam = {...fields};
        reqParam.province = fields.provinceCity[0];
        reqParam.city = fields.provinceCity[1];
        delete reqParam.provinceCity;
        reqParam.isEnable = 'Y';
        this.addRecordFetch({
          reqParam,
          success: (datas) => {
            let fn = this.props.success;
            fn && fn(datas);
          }
        });
      }
    });
  }

  checkLetterNumber = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.ALLLETTERNUMBER(value) || (mes = '请输入字母或数字') );

    callback(mes);
  }

  checkWord_chinese = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
    callback(mes);
  }

  provinceChange = (value, selectedOptions) => {
  }

  afterClose = () => {
    this.validateErrors = {};
    let fn = this.props.afterClose;
    fn && fn();
  }

  addRecordFetch = ({reqParam, success}) => {
    let thiz = this;
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };
    let completeHandler = function () {
      thiz.setState({
        submitBtn:{
          loading: false
        }
      })
    }
    let url = '/configsign/record/opened';
    thiz.setState({
      submitBtn:{
        loading: true
      }
    })
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler,
      complete: completeHandler
    });
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  };

  render() {
    let {getFieldDecorator} = this.props.form;
    let record = this.props.signRecord;
    return (
      <CustomModal
        title="开通数字签名"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
        width={450}
        operate={
          <Button type="primary" key="ok" onClick={() => this.addSubmit()} loading={this.state.submitBtn.loading}>
            免费开通
          </Button>
        }
      >
          <Form className="digitalSignature-form">
            <ValidatePopover
              validatePoppoverId="userName"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">企业账号</label>
                <FormItem className="common-input-item">
                  {getFieldDecorator('userName', {
                    initialValue: record.userName,
                    rules: [{
                      max: 20,
                      message: '输入长度最大为20',
                    }, {
                      required: true, message: '请输入管理员账号',
                    }, {
                      validator: this.checkLetterNumber
                    }],
                  })(
                    <Input
                      placeholder="请输入单位编码"
                      disabled={true}
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover
              validatePoppoverId="corpName"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">企业名称</label>
                <FormItem className="common-input-item">
                  {getFieldDecorator('corpName', {
                    initialValue: record.corpName,
                    rules: [{
                      required: true, message: '请输入企业名称!',
                    }, {
                      max: 60, message: '不得超过60字符!'
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input
                      placeholder="请输入单位名称"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>

            <ValidatePopover validatePoppoverId="provinceCity" validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">所属地区</label>
                <FormItem className="common-input-item">
                  {getFieldDecorator('provinceCity', {
                    initialValue: [record.province, record.city],
                    rules: [
                      {
                        required: true, message: '请选择所属地区'
                      }
                    ],
                  })(
                    <Cascader options={provincesOptions} onChange={this.provinceChange} placeholder="请选择所属地区"/>
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="validateTime" validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">保管期限</label>
                <FormItem className="common-input-item">
                  {getFieldDecorator('validateTime', {
                    initialValue: "3",
                    rules: [
                      {
                        required: true, message: '请选择保管期限',
                      }],
                  })(
                    <CustomSelect placeholder="请选择密级" dataSource={[{label: '3年', value: "3"}]} disabled/>
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
          </Form>
      </CustomModal>
    )
  }
}

export default Form.create({})(DigitalSignatureCreate);