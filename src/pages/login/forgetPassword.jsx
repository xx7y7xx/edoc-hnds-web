import React from 'react'
import {Form, Input, Button, Icon, notification} from 'antd'
import browserHistory from '../../libs/browserHistory'
import {notice, errorNotice} from '../../components/Common';
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit'
import {Validator} from "../../utils/base/validator"

import '../../less/login/login.less'

const FormItem = Form.Item;
const InputGroup = Input.Group;
class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordType: 'password',
      currentPage: 'forgetPassword',
      valicodeBtn: {
        disabled: false,
        loading: false,
        content: '获取验证码',
        countdown: 0
      },
      forgetPasswordToken: ''
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  forgetPasswordSubmit = (e) => {
    let thiz = this;
    e.preventDefault();
    notification.destroy()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postBody = {
          valiCode: values.valicode,
          uniqueId: values.mobileOrEmail
        };
        let successHandler = function (response) {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            thiz.setState({
              forgetPasswordToken: response.datas,
              currentPage: 'modifyPassword'
            })
          } else {
            errorNotice(response.msg)
          }
        };
        let errorHandler = function (error) {
          thiz.openNotificationWithIcon('error', "", "未知错误");
        };
        let url = cKit.makeUrl('/forgetpwd/submit/valicode');
        let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        loginAction.submit();
      } else {
        for (let i in err) {
          this.openNotificationWithIcon('error', '参数错误', err[i].errors[0].message);
        }
      }
    });
  }
  modifyPasswordSubmit = (e) => {
    let thiz = this;
    e.preventDefault();
    notification.destroy()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postBody = {
          token: this.state.forgetPasswordToken,
          password: values.newPassword
        };
        let successHandler = function (response) {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            notice('密码修改成功')
            browserHistory.push('/login')
          } else {
            errorNotice(response.msg)
          }

        };
        let errorHandler = function (error) {
          thiz.openNotificationWithIcon('error', "", "未知错误");
        };
        let url = cKit.makeUrl('/forgetpwd/submit/newpwd');
        let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        loginAction.submit();
      } else {
        for (let i in err) {
          this.openNotificationWithIcon('error', '参数错误', err[i].errors[0].message);
        }
      }
    });
  }


  checkNewPassword = (rule, value, callback) => {
    const {getFieldValue} = this.props.form;
    if (value !== getFieldValue('newPassword')) {
      callback('两次密码不一致');
    } else {
      callback();
    }
  }

  // 返回一个弹框对象，提示用户名和密码
  openNotificationWithIcon = (type, message, description) => {
    if (message) {
      return notification[type]({
        message: message,
        description: description,
        duration: 6,
        key: message
      })
    }
  }

  sendValicode = () => {
    const thiz = this;
    const {getFieldValue} = this.props.form;
    let mobileOrEmail = getFieldValue('mobileOrEmail');
    let url = cKit.makeUrl('/forgetpwd/send/valicode')
    let postBody = {};
    if (Validator.MOBILE(mobileOrEmail)) {
      postBody = {
        mobile: mobileOrEmail
      }
      thiz.valicodeSubmit(url, postBody);
    } else if (Validator.EMAIL(mobileOrEmail)) {
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

  render() {
    const {setFieldsValue, getFieldValue, getFieldDecorator} = this.props.form
    const mobileOrEmail = getFieldValue('mobileOrEmail');
    let passwordType = this.state.passwordType
    let emitEmpty = () => {
      this.mobileOrEmailInput.focus();
      setFieldsValue({
        'mobileOrEmail': ''
      })
    }
    let switchEye = (e) => {
      console.log('switch')
      if (this.state.passwordType === 'password') {
        this.setState({
          passwordType: 'input'
        })
      } else {
        this.setState({
          passwordType: 'password'
        })
      }
    }
    let suffix = mobileOrEmail ? <Icon type="close" onClick={emitEmpty}/> : null
    let eye = passwordType === 'password' ? <Icon type="eye-o" onClick={switchEye}/> :
      <Icon style={{color: '#12bce7'}} type="eye-o" onClick={switchEye}/>
    return (
      <div id="login-page-wrap">
        <div id="login-wrap">
          <div className="login-slogan">
            <p className="slogan-name">电子会计档案</p>
            <p className="slogan-description">让会计档案管理更轻盈</p>
            <div className="slogan-line"/>
            <div className="slogan-save slogan-icon">
              <Icon type="retweet"/>&nbsp;&nbsp;<span>规范化、自动化归档</span>
            </div>
            <div className="slogan-cloud slogan-icon">
              <Icon type="book"/>&nbsp;&nbsp;<span>凭证关联、便捷查阅</span>
            </div>
            <div className="slogan-printer slogan-icon">
              <Icon type="safety"/>&nbsp;&nbsp;<span>安全可靠、长期存储</span>
            </div>
          </div>
          {
            this.state.currentPage === 'forgetPassword'
            &&
            (
              <div className="login-right zoom-enter zoom-enter-active">
                <h1 className="login-title">忘记密码</h1>
                <Form className="login-form forget-password-form" layout="horizontal"
                      onSubmit={this.forgetPasswordSubmit}>
                  <FormItem className="mobile-email-input">
                    {getFieldDecorator('mobileOrEmail', {
                      initialValue: '',
                      rules: [{required: true, message: '请填写手机或邮箱!'}],
                    })(
                      <Input
                        placeholder="请填写手机或邮箱"
                        prefix={<Icon type="user"/>}
                        suffix={suffix}
                        ref={node => this.mobileOrEmailInput = node}
                      />
                    )}
                  </FormItem>
                  <InputGroup compact>
                    <FormItem className="forget-password-valicode">
                      {getFieldDecorator('valicode', {
                        initialValue: '',
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
                    <Button className="forget-password-send"
                            disabled={this.state.valicodeBtn.disabled}
                            onClick={ this.sendValicode }>
                      <span
                        style={ this.state.valicodeBtn.disabled ? {} : {color: '#12bce7'} }>{this.state.valicodeBtn.content}</span>
                    </Button>
                  </InputGroup>
                  <Button className="login-submit-btn" type="primary" htmlType="submit" id="loginBtn">提交</Button>
                </Form>
              </div>
            )
          }
          {
            this.state.currentPage === 'modifyPassword'
            &&
            (
              <div className="login-right zoom-enter zoom-enter-active">
                <h1 className="login-title">忘记密码</h1>
                <Form className="login-form modify-password-form" layout="horizontal"
                      onSubmit={this.modifyPasswordSubmit}>
                  <FormItem className="form-password">
                    {getFieldDecorator('newPassword', {
                      rules: [{
                        required: true,
                        message: '请确认新密码!'
                      }, {
                        min: 6,
                        message: '请输入6-16位密码！'
                      }, {
                        max: 16,
                        message: '请输入6-16位密码！'
                      }]
                    })(
                      <Input
                        type='password' placeholder="请输入新密码"
                        prefix={<Icon type="lock"/>}
                      />
                    )}
                  </FormItem>
                  <FormItem className="form-password">
                    {getFieldDecorator('checkNewPassword', {
                      rules: [{
                        required: true,
                        message: '请再次确认新密码!'
                      },
                        {
                          validator: this.checkNewPassword
                        }]
                    })(
                      <Input
                        type='password' placeholder="请确认新密码"
                        prefix={<Icon type="lock"/>}
                      />
                    )}
                  </FormItem>
                  <Button className="login-submit-btn" type="primary" htmlType="submit" id="loginBtn">完成</Button>
                </Form>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

let Login = Form.create()(LoginPage);
export default Login;

