import React from 'react'
import {Form, Input, Button, Icon, notification, Checkbox, Col,Spin } from 'antd'
import browserHistory from '../../libs/browserHistory'
import {notice, errorNotice} from '../../components/Common';
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit'
import userStore from "../../stores/userStore"
import menuStore from "../../stores/menuStore"

import '../../less/login/login.less'

const FormItem = Form.Item;
const InputGroup = Input.Group;
class singleLoginPage extends React.Component {
    constructor(props) {
        console.log(props)
        super(props);
        this.userName=props.params.userName;
        this.ssoTicket=props.params.ssoTicket;
    }

    loginSubmit = () => {
        if(this.userName=="null"||this.ssoTicket=="null"){
            browserHistory.push('/login');
            return;
        }
        let thiz = this;
        let postBody = {
            username: "",
            password: ""
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
            } else if (response.code == '4007') {
                errorNotice("用户未激活")
            } else {
                errorNotice(response.msg)
            }

        };
        let errorHandler = function (error) {;
            errorNotice(error)
        };
        let url = cKit.makeUrl('/singleLogin?userName='+this.userName+"&ssoTicket="+this.ssoTicket);
        //验证登录信息
        let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        loginAction.submit();


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

    componentDidMount() {

    }
    componentWillMount() {
        console.log('判断用户会话');
        if(!userStore.hasUserSession()){
            console.log('单点登陆');
            this.loginSubmit();
        }

    }
    render() {
        return ( <div style={{
      width: '100%',
      height:'100%'
    }}>
                <div className="home-page-wrap" style={{textAlign: "center",lineHeight:"700px"}}>
                 <Spin size="large"/>
                </div>
            </div>
        );
    }
}

let singleLogin = Form.create()(singleLoginPage);
export default singleLogin;

