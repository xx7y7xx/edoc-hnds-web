import React from 'react'
import browserHistory from '../../libs/browserHistory'
import {Input, Button, Icon, Steps, Form, Cascader} from 'antd'
import menuStore from '../../stores/menuStore'
import {errorNotice} from '../../components/Common';

import {Validator} from '../../utils/base/validator';
import ValidatePopover from '../../components/validatePopover';
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit'
import { provincesOptions } from '../../utils/common/provinces_citys'
import '../../less/login/companyAdminRegister.less'
import '../../less/common.less'

const Step = Steps.Step;
const InputGroup = Input.Group;
const FormItem = Form.Item;

const steps = [{
  title: '管理员信息'
}, {
  title: '企业信息'
}, {
  title: '完成注册'
}];


class CompanyAdminRegister extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      user: {},
      org: {},
      valicode: '',
      uniqueId: '',
      checkImg: '',
      valicodeBtn: {
        disabled: false,
        loading: false,
        content: '获取验证码',
        countdown: 0
      }
    };
    this.validateErrors = {}
  }

  componentWillMount() {
    //this.getValicode();
    menuStore.setCurrentMenu('/register')
  }

  componentDidUpdate(prevProps, prevState) {
  }

  backToLogin = () => {
    browserHistory.push('/login');
  }

  next() {
    const currentStep = this.state.current + 1;
    this.setState({current: currentStep});
  }

  prev() {
    const currentStep = this.state.current - 1;
    this.setState({current: currentStep});
    this.props.form.validateFields((err, orgForm) => {
      this.state.org = orgForm;
    });
  }

  step1FromSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, userForm) => {
      if (!err) {
        this.state.user = userForm;
        this.state.valicode = userForm.valicode;
        console.log('step1 form submit!!');
        this.validateErrors = {};
        this.checkAdminAction();
      } else {
        let validateErrors = {};
        for (let i in err) {
          validateErrors[err[i].errors[0].field] = {
            visible: true,
            message: err[i].errors[0].message,
            className: 'validator-popover-error'
          };
        }
        this.validateErrors = validateErrors
      }
    });
  }

  step2FromSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, orgForm) => {
      if (!err) {
        this.validateErrors = {};
        this.state.org = orgForm;
        console.log('step2 form submit!!');
        this.submitAction();
      } else {
        console.log('err:' + err)
        let validateErrors = {};
        for (let i in err) {
          validateErrors[err[i].errors[0].field] = {
            visible: true,
            message: err[i].errors[0].message,
            className: 'validator-popover-error'
          };
        }
        this.validateErrors = validateErrors
      }
    });
  }

  checkAdminAction = () => {
    const thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.next();
      } else {
        errorNotice(response.msg)
      }
    };
    let errorHandler = function (error) {
      errorNotice(error)
    };
    let postBody = {
      "userName": this.state.user.userName,
      "valiCode": this.state.valicode
    }
    let mobileOrEmail = this.state.user.mobileOrEmail;
    if (Validator.MOBILE(mobileOrEmail)) {
      postBody.mobile = mobileOrEmail;
      postBody.uniqueId = mobileOrEmail;
    } else if (Validator.EMAIL(mobileOrEmail)) {
      postBody.email = mobileOrEmail;
      postBody.uniqueId = mobileOrEmail;
    }
    let url = cKit.makeUrl('/register/check/admin');
    //验证个人信息
    let submitAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    submitAction.submit();
  }

  submitAction = () => {
    const thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.next();
      } else {
        errorNotice(response.msg)
      }
    };
    let errorHandler = function (error) {
      errorNotice(error)
    };
    let url = cKit.makeUrl('/register/orgadmin');
    let postBody = {
      "user": {
        "userName": this.state.user.userName,
        "realName": this.state.user.realName,
        "password": this.state.user.password,
      },
      "org": {
        "orgCode": this.state.org.orgCode,
        "orgName": this.state.org.orgName,
        "address": this.state.org.address,
        "contacter": this.state.org.contacter,
        "phone": this.state.org.phone,
        "zipcode": this.state.org.zipcode,
        "instCode": this.state.org.instCode,
        "busiLicence": this.state.org.busiLicence,
        "taxNo": this.state.org.taxNo,
        "province" : this.state.org.province[0],
        "city" : this.state.org.province[1]
      },
      "valicode": this.state.valicode
    };
    let mobileOrEmail = this.state.user.mobileOrEmail
    if (Validator.MOBILE(mobileOrEmail)) {
      postBody.user.mobile = mobileOrEmail;
      postBody.uniqueId = mobileOrEmail;
    } else if (Validator.EMAIL(mobileOrEmail)) {
      postBody.user.email = mobileOrEmail;
      postBody.uniqueId = mobileOrEmail;
    }

    //验证登录信息
    let submitAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    submitAction.submit();
  }

  getValiImg = () => {
    const thiz = this;
    let url = cKit.makeUrl('/valicode/graph');
    let action = new netKit.CorsGetAction(null, url, function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let url = 'data:image/png' + ';base64,' + response.datas.base64image;
        thiz.setState({
          checkImg: url
        })
      } else {
        errorNotice(response.msg)
      }

    }, function (error) {
      errorNotice(error)
    });
    action.submit();
  }

  sendValicode = () => {
    const thiz = this;
    const {getFieldValue} = this.props.form;
    let mobileOrEmail = getFieldValue('mobileOrEmail');
    let url = '';
    let postBody = {};
    if (Validator.MOBILE(mobileOrEmail)) {
      url = cKit.makeUrl('/valicode/mobile')
      postBody = {
        mobile: mobileOrEmail
      }
      thiz.valicodeSubmit(url, postBody);
    } else if (Validator.EMAIL(mobileOrEmail)) {
      url = cKit.makeUrl('/valicode/email')
      postBody = {
        email: mobileOrEmail
      }
      thiz.valicodeSubmit(url, postBody);
    } else {
      errorNotice('手机或邮箱格式不正确！')
    }
  }

  valicodeSubmit = (url, postBody) => {
    let thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.btnCountDown();
      } else {
        errorNotice(response.msg)
      }
    }
    let errorHandler = function (error) {
      errorNotice(error)
    }
    let action = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    action.submit();
  }

  btnCountDown = () => {
    let thiz = this;
    let countdown = 60;
    let setTime = function () {
      if (countdown == 0) {
        thiz.setState({
          valicodeBtn: {
            disabled: false,
            loading: false,
            content: '获取验证码'
          }
        })
        window.clearInterval(interval);
        countdown = 60;
      } else {
        thiz.setState({
          valicodeBtn: {
            disabled: true,
            loading: true,
            content: "重新发送(" + countdown + ")"
          }
        });
        countdown--;
      }
    }
    setTime();
    let interval = setInterval(function () {
      setTime()
    }, 1000);
  }

  checkMobileOrEmail = (rule, value, callback) => {
    if (!Validator.NONEMPTY(value)) {
      callback('请输入手机或邮箱');
    } else if (Validator.MOBILE(value) || (Validator.EMAIL(value))) {
      callback();
    } else {
      callback('请输入正确手机/邮箱');
    }
  }

  passwordValidator = (rule, value, callback) => {
    let mes;
    value && ( Validator.SPECIAL_CHARACTER(value) || (mes = '输入6-16位字母、数字、特殊字符') );
    callback(mes);
  }

  checkPassword = (rule, value, callback) => {
    const {getFieldValue} = this.props.form;
    if (value !== getFieldValue('password')) {
      callback('两次密码不一致');
    } else {
      callback();
    }
  }

  checkPhone = (rule, value, callback) => {
    let mes;
    value && ( Validator.PHONE_NUMBER(value) || (mes = '输入电话格式不正确') );
    callback(mes);
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
  checkZipCode = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.ALLNUMBER(value) || (mes = '输入6位邮编') );
    callback(mes);
  }

  provinceChange = (value, selectedOptions) => {
    console.log(value)
    console.log(selectedOptions)
  }

  render() {
    const {getFieldDecorator} = this.props.form

    return (
      <div id="login-page-wrap">
        <div className="register-wrap" id="login-wrap">
          <div className="register-steps">
            <Steps current={this.state.current}>
              {steps.map(item => <Step key={item.title} title={item.title}/>)}
            </Steps>
          </div>

          <div className="register-content">
            {
              this.state.current == 0
              &&
              (
                <div>
                  <Form className="register-content-form step1-form">
                    <ValidatePopover validatePoppoverId="mobileOrEmail"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label required-item">手机号/邮箱</label>
                        <FormItem className="register-form-input long-input">
                          {getFieldDecorator('mobileOrEmail', {
                            initialValue: this.state.user.mobileOrEmail,
                            rules: [
                              {
                                max: 40, message: '不得超过40字符!'
                              }, {
                                validator: this.checkMobileOrEmail
                              }],
                          })(
                            <Input placeholder="请输入手机/邮箱"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="valicode"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label required-item">输入验证码</label>
                        <FormItem className="register-form-input">
                          {getFieldDecorator('valicode', {
                            initialValue: this.state.valicode,
                            rules: [{
                              max: 6,
                              message: '验证码不符合规则',
                            }, {
                              required: true, message: '请输入验证码',
                            }],
                          })(
                            <Input placeholder="请输入验证码"/>
                          )}
                        </FormItem>
                        <Button className="foot-input-btn"
                                disabled={this.state.valicodeBtn.disabled}
                                loading={this.state.valicodeBtn.loading}
                                onClick={ this.sendValicode }>
                          <span
                            style={ this.state.valicodeBtn.disabled ? {} : {color: '#12bce7'} }>{this.state.valicodeBtn.content}</span>
                        </Button>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="userName"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label required-item">管理员账号</label>
                        <FormItem className="register-form-input long-input">
                          {getFieldDecorator('userName', {
                            initialValue: this.state.user.userName,
                            rules: [{
                              max: 20,
                              message: '输入长度最大为20',
                            }, {
                              required: true, message: '请输入管理员账号',
                            }, {
                              validator: this.checkLetterNumber
                            }],
                          })(
                            <Input placeholder="请输入管理员账号"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="realName"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label required-item">管理员姓名</label>
                        <FormItem className="register-form-input long-input">
                          {getFieldDecorator('realName', {
                            initialValue: this.state.user.realName,
                            rules: [
                              {
                                max: 20, message: '不得超过20字符!'
                              },
                              {validator: this.checkWord_chinese},
                              {
                                required: true, message: '请输入管理员姓名!',
                              }],
                          })(
                            <Input placeholder="请输入管理员姓名"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="password"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label required-item">管理员密码</label>
                        <FormItem className="register-form-input long-input">
                          {getFieldDecorator('password', {
                            initialValue: this.state.user.password,
                            rules: [{
                              required: true, message: '请输入管理员密码!',
                            }, {
                              min: 6, message: '密码必须大于6位!',
                            }, {
                              max: 16, message: '密码必须小于16位!',
                            }, {
                              validator: this.passwordValidator
                            }],
                          })(
                            <Input type='password' placeholder="请输入6-16位管理员密码"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="checkPassword"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label required-item">确认密码</label>
                        <FormItem className="register-form-input long-input">
                          {getFieldDecorator('checkPassword', {
                            initialValue: this.state.user.checkPassword,
                            rules: [{
                              required: true, message: '请再次输入密码!',
                            }, {
                              validator: this.checkPassword
                            }],
                          })(
                            <Input type="password" placeholder="请再次输入密码"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>
                  </Form>
                  <div className="steps-action">
                    <Button className="back-btn" onClick={() => this.backToLogin()}>
                      <Icon type="left" />
                      返回
                    </Button>
                    <Button className="next-step-btn" type="primary" onClick={this.step1FromSubmit}>
                      下一步<Icon type="right" />
                    </Button>
                  </div>
                </div>
              )
            }
            {
              this.state.current == 1
              &&
              (<div>
                <Form className="register-content-form">
                  <div className="step2-form-left">
                    <p>基本信息</p>
                    <ValidatePopover validatePoppoverId="orgCode"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label required-item">企业编码</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('orgCode', {
                            initialValue: this.state.org.orgCode,
                            rules: [{
                              max: 20, message: '不得超过20字符!'
                            }, {
                              required: true, message: '请输入企业编码',
                            }, {
                              validator: this.checkLetterNumber
                            }],
                          })(
                            <Input placeholder="请输入企业编码"/>
                          )}
                        </FormItem>
                      </InputGroup>

                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="orgName"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label required-item">企业名称</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('orgName', {
                            initialValue: this.state.org.orgName,
                            rules: [{
                              required: true, message: '请输入企业名称!',
                            }, {
                              max: 60, message: '不得超过60字符!'
                            }, {
                              validator: this.checkWord_chinese
                            }],
                          })(
                            <Input placeholder="请输入企业名称"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="contacter"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label">联系人</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('contacter', {
                            initialValue: this.state.org.contacter,
                            rules: [
                              {
                                max: 20, message: '不得超过20字符!'
                              },
                              {
                                validator: this.checkWord_chinese
                              }
                            ],
                          })(
                            <Input placeholder="请输入企业联系人"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="zipcode"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label">邮编</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('zipcode', {
                            initialValue: this.state.org.zipcode,
                            rules: [
                              {
                                len: 6, message: '请输入6位邮编'
                              },
                              {
                                validator: this.checkZipCode
                              }
                            ],
                          })(
                            <Input placeholder="请输入邮编"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="phone"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label required-item">联系方式</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('phone', {
                            initialValue: this.state.org.phone,
                            rules: [
                              {
                                max: 20, message: '不得超过20字符!'
                              },
                              {
                                required: true, message: '请输入手机或固话',
                              },
                              {
                                validator: this.checkPhone
                              }],
                          })(
                            <Input placeholder="请输入联系人手机号"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="address" validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label">企业地址</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('address', {
                            initialValue: this.state.org.address,
                            rules: [
                              {
                                max: 60, message: '不得超过60字符!'
                              },
                              {
                                validator: this.checkWord_chinese
                              }
                            ],
                          })(
                            <Input placeholder="请输入企业地址"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="province" validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label required-item">所属地区</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('province', {
                            initialValue: '',
                            rules: [
                              {
                                required: true, message: '请选择所属地区'
                              }
                            ],
                          })(
                            <Cascader options={provincesOptions} onChange={this.provinceChange} placeholder="请选择所属地区" />
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>
                  </div>
                  <div className="step2-form-right">
                    <p>认证信息</p>

                    <ValidatePopover validatePoppoverId="busiLicence"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label">营业执照号</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('busiLicence', {
                            initialValue: this.state.org.busiLicence,
                            rules: [
                              {
                                max: 60, message: '不得超过60字符!'
                              },
                              {
                                validator: this.checkWord_chinese
                              }
                            ],
                          })(
                            <Input placeholder="营业执照号码"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="instCode"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label">组织机构代码</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('instCode', {
                            initialValue: this.state.org.instCode,
                            rules: [
                              {
                                max: 60, message: '不得超过60字符!'
                              },
                              {
                                validator: this.checkWord_chinese
                              }
                            ],
                          })(
                            <Input placeholder="请输入组织机构代码证件号"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>

                    <ValidatePopover validatePoppoverId="taxNo"
                                     validateErrors={this.validateErrors}>
                      <InputGroup compact>
                        <label className="common-head-label com-register-head-label">税务登记证号</label>
                        <FormItem className="register-form-input com-register-form-input">
                          {getFieldDecorator('taxNo', {
                            initialValue: this.state.org.taxNo,
                            rules: [
                              {
                                max: 60, message: '不得超过60字符!'
                              },
                              {
                                validator: this.checkWord_chinese
                              }
                            ],
                          })(
                            <Input placeholder="请输入企业税务登记证号"/>
                          )}
                        </FormItem>
                      </InputGroup>
                    </ValidatePopover>
                  </div>
                </Form>
                <div className="steps-action">
                  <Button className="back-btn" onClick={() => this.prev()}>
                    <Icon type="left"/>返回
                  </Button>
                  <Button className="next-step-btn" type="primary" onClick={this.step2FromSubmit}>
                    下一步<Icon type="right"/>
                  </Button>
                </div>
              </div>)
            }
            {
              this.state.current == 2
              &&
              (<div>
                <p className="register-success-icon"><Icon type="check-circle-o" /></p>
                <p className="register-success-content">恭喜您注册成功!</p>
                <div className="steps-action">
                  <Button className="next-step-btn" type="primary" onClick={()=>{
                    browserHistory.push('/login/' + this.state.user.userName);
                  }}>
                    完成
                  </Button>
                </div>
              </div>)
            }
          </div>
        </div>
      </div>
    );
  }
}
let CompanyAdminRegisterPage = Form.create({
  mapPropsToFields(props) {
    console.log(props)
    return props;
  }
})(CompanyAdminRegister);
export default CompanyAdminRegisterPage;