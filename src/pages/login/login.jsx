import React from 'react'
import {Form, Input, Button, Icon, notification, Checkbox, Col} from 'antd'
import browserHistory from '../../libs/browserHistory'
import {notice, errorNotice} from '../../components/Common';
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit'
import userStore from "../../stores/userStore"
import menuStore from "../../stores/menuStore"

import '../../less/login/login.less'

const FormItem = Form.Item;
const InputGroup = Input.Group;
class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      passwordType: 'password',
      rememberMe: Boolean(cKit.getRememberUsername()),
      graphUniqueId: '',
      checkImg: '',
      graphValicodeVisible: sessionStorage.getItem('graphValicodeVisible') == 'Y',
      currentPage: 'login'
    };
  }

  componentWillMount() {
    console.log('判断用户会话');
    userStore.hasUserSession();
    this.getValiImg();
  }

  loginSubmit = (e) => {
    /*if (1) {
     // 表单的路由处理
     userStore.setUser({
     "realName": "檀大军",
     "orgName": "用友电子发票事业部"
     });
     browserHistory.push('/');

     } else {
     this.openNotificationWithIcon('warning');
     }*/

    let thiz = this;
    e.preventDefault();
    notification.destroy()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postBody = {
          username: values.username,
          password: values.password,
          graphUniqueId: thiz.state.graphUniqueId,
          graphValicode: values.graphValicode
        };
        let successHandler = function (response) {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            userStore.setUser({
              "realName": response.datas.user.realName,
              "id": response.datas.user.id,
              "headImage": response.datas.user.headImage,
              'corp': response.datas.corp
            });
            sessionStorage.setItem('graphValicodeVisible', 'N');
            thiz.getMenuList();
            thiz.getPermission();
            if (thiz.state.rememberMe) {
              cKit.rememberMe(values.username)
            } else {
              cKit.rememberMe()
            }
          } else if (response.code == '4007') {
            thiz.setState({
              userName: values.username,
              currentPage: 'inactive'
            })
          } else {
            sessionStorage.setItem('graphValicodeVisible', 'Y');
            thiz.setState({
              graphValicodeVisible: sessionStorage.getItem('graphValicodeVisible') == 'Y'
            })
            thiz.getValiImg();
            errorNotice(response.msg)
          }

        };
        let errorHandler = function (error) {
          thiz.getValiImg();
          errorNotice(error)
        };
        let url = thiz.state.rememberMe ? cKit.makeUrl('/login?rememberMe=true') : cKit.makeUrl('/login');
        //验证登录信息
        let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        loginAction.submit();
      } else {
        for (let i in err) {
          thiz.getValiImg();
          errorNotice(err[i].errors[0].message);
        }
      }
    });
  }

  loginInactiveSubmit = (e) => {
    let thiz = this;
    e.preventDefault();
    notification.destroy()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postBody = {
          username: values.inactiveUsername,
          password: values.inactivePassword,
          newPassword: values.newPassword
        };
        let successHandler = function (response) {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            userStore.setUser({
              "realName": response.datas.user.realName,
              "id": response.datas.user.id,
              "headImage": response.datas.user.headImage,
              'corp': response.datas.corp
            });
            thiz.getMenuList();
          } else {
            thiz.setState({
              graphValicodeVisible: true
            })
            thiz.getValiImg();
            errorNotice(response.msg)
          }

        };
        let errorHandler = function (error) {
          thiz.getValiImg();
          thiz.openNotificationWithIcon('error', "", "未知错误");
        };
        let url = cKit.makeUrl('/loginInactive');
        //验证登录信息
        let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        loginAction.submit();
      } else {
        for (let i in err) {
          this.openNotificationWithIcon('error', '参数错误', err[i].errors[0].message);
        }
      }
    });
  }

  getMenuList = () => {
    const thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        menuStore.setMenuList(response.datas);
        console.log('菜单获取完成');
        browserHistory.push('/');
      } else {
        errorNotice(response.msg)
      }

    };
    let errorHandler = function (error) {
      thiz.openNotificationWithIcon('error', "", "未知错误");
    };
    let url = cKit.makeUrl('/menu/userlist');
    //验证登录信息
    let loginAction = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    loginAction.submit();
  }

  getPermission = () => {
    const thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        userStore.setPermission(response.datas);
        console.log('权限获取完成');
      } else {
        errorNotice(response.msg)
      }
    };
    let errorHandler = function (error) {
      thiz.openNotificationWithIcon('error', "", "未知错误");
    };
    let url = cKit.makeUrl('/permission/userpermissions');
    //验证登录信息
    let loginAction = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    loginAction.submit();
  }

  rememberMeCheckbox = (e) => {
    this.setState({
      rememberMe: e.target.checked
    });
  }

  forgetPassword = () => {
    browserHistory.push('/forgetPassword')
  }

  getValiImg = () => {
    const thiz = this;
    let url = cKit.makeUrl('/valicode/graph');
    let action = new netKit.CorsGetAction(null, url, function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let url = 'data:image/png' + ';base64,' + response.datas.base64image;
        thiz.setState({
          graphUniqueId: response.datas.uniqueId,
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

  componentDidMount() {
  }

  register = () => {
    browserHistory.push('/register')
  }

  render() {
    const {setFieldsValue, getFieldValue, getFieldDecorator} = this.props.form
    const userName = getFieldValue('username')
    let passwordType = this.state.passwordType
    let emitEmpty = () => {
      this.userNameInput.focus();
      setFieldsValue({
        'username': ''
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
    let suffix = userName ? <Icon type="close" onClick={emitEmpty}/> : null
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
            this.state.currentPage === 'login'
            &&
            (<div className="login-right">
              <h1 className="login-title">登录</h1>
              <Form className="login-form" layout="horizontal" onSubmit={(e) => this.loginSubmit(e)}>
                <FormItem className="form-username">
                  {getFieldDecorator('username', {
                    initialValue: this.props.params.username || cKit.getRememberUsername(),
                    rules: [{required: true, message: '请输入用户名!'}],
                  })(
                    <Input
                      className="login-username"
                      placeholder="用户名"
                      prefix={<Icon type="user"/>}
                      suffix={suffix}
                      ref={node => this.userNameInput = node}
                    />
                  )}
                </FormItem>
                <FormItem className="form-password">
                  {getFieldDecorator('password', {
                    rules: [{required: true, message: '请输入密码!'}],
                  })(
                    <Input
                      className="login-password"
                      type={passwordType} placeholder="密码"
                      prefix={<Icon type="lock"/>}
                      suffix={eye}
                    />
                  )}
                </FormItem>
                <Checkbox className="remember-username" defaultChecked={Boolean(cKit.getRememberUsername())} onChange={this.rememberMeCheckbox}>记住账号</Checkbox>
                <a className="forget-password" onClick={this.forgetPassword}>忘记密码?</a>
                {
                  this.state.graphValicodeVisible
                  &&
                  (<InputGroup size="default" className="verification-code-group">
                    <Col span="16" style={{paddingRight: 0}}>
                      <FormItem className="verification-code">
                        {getFieldDecorator('graphValicode', {
                          rules: [
                            {required: true, message: '请输入验证码!'}
                          ],
                        })(
                          <Input placeholder="请输入验证码"/>
                        )}
                      </FormItem>
                    </Col>
                    <Col span="8" className="verification-img">
                      <img src={this.state.checkImg} onClick={this.getValiImg}/>
                    </Col>
                  </InputGroup>)
                }
                <Button className="login-submit-btn" type="primary" htmlType="submit"
                        id="loginBtn">登录</Button>
                <div className="login-footer">
                  <a className="login-submit-btn" onClick={this.register}>没有账号？<b>注册</b></a>
                </div>
              </Form>
            </div>)
          }
          {
            this.state.currentPage === 'inactive'
            &&
            (
              <div className="login-right animated bounceInRight">
                <h1 className="login-title">账号激活</h1>
                <Form className="login-form inactive-form" layout="horizontal" onSubmit={this.loginInactiveSubmit}>
                  <FormItem >
                    {getFieldDecorator('inactiveUsername', {
                      initialValue: this.state.userName,
                      rules: [{required: true, message: '无激活账号!'}],
                    })(
                      <Input
                        placeholder="用户名"
                        prefix={<Icon type="user"/>}
                        suffix={suffix}
                        readOnly={true}
                      />
                    )}
                  </FormItem>
                  <FormItem className="form-password">
                    {getFieldDecorator('inactivePassword', {
                      rules: [{
                        required: true,
                        message: '请输入密码!'
                      }],
                    })(
                      <Input
                        type='password' placeholder="密码"
                        prefix={<Icon type="lock"/>}
                      />
                    )}
                  </FormItem>
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
                  <Button className="login-submit-btn" type="primary" htmlType="submit" id="loginBtn">激活并登录</Button>
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

