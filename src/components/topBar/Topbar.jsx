import React from 'react';
import {observer} from 'mobx-react'
import browserHistory from '../../libs/browserHistory'
import userStore from "../../stores/userStore"
import menuStore from "../../stores/menuStore"
import {Menu, Dropdown, Icon, Input} from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import UserState from '../userState/UserState';
import ModifyPassword from '../userState/ModifyPassword'
import 'animate.css'
import $ from 'jquery'
import userAvatar from '../../images/default-head-img.png';
import home_logo from '../../images/1024-LOGO-Blue.png';
import {errorNotice} from '../Common';
import './topBar.less'

const SubMenu = Menu.SubMenu;

const logout = function () {
    //登出
    let successHandler = function (response) {
        if(response.code == cKit.ResponseCode.SUCCESS_CODE){
            userStore.logoutClear();
            console.log('登出！');
            browserHistory.push('/login');
        }else {

        }
    };
    let errorHandler = function (error) {
        console.log(error);
    };
    //验证登录信息
    let url = cKit.makeUrl('/logout');
    let logoutAction = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    logoutAction.submit();
};

@observer
export default class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: '',
            currentMenu: '',
            menuList: '',
            headImage: '',
            userDetailVisible: false,
            modifyPasswordVisible: false,
            userDetail: {},
            userCorpRolesList: [],

            //定时器
            timer: null,
            //延时时长
            delay: 500,
        }
    }

    handleClick = (e) => {
        if(!e.key){
            return;
        }else if(e.key == 'searchBtn'){
            this.searchOpen();
        }else if(e.key == 'passwordModify'){
            this.modifyPasswordOpen();
        }else if(e.key == 'userDetail'){
            this.userDetailOpen()
        }else if(e.key == 'logout'){
            logout();
        }else {
            browserHistory.push('/' + e.key);
        }
    }

    shake = () => {
        $('.ant-menu-item-selected,.ant-menu-submenu-selected').addClass('animated swing');
        //$('.ant-menu-submenu-selected').addClass('animated swing');
    }

    componentWillMount = () => {
        this.setState({
            currentUser: userStore.getUser(),
            currentMenu: menuStore.getCurrentMenu().replace('/',''),
            menuList: menuStore.getMenuList()
        })

        //animalCss
        $.fn.extend({
            animateCss: function (animationName, endCallBack) {
                let tartClass = 'animated ' + animationName;
                let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
                this.addClass(tartClass).one(animationEnd, function(e) {
                    $(this).removeClass(tartClass);
                    endCallBack && endCallBack.call(this, e);
                });
            }
        });
    }

    componentDidMount = () => {
        //this.shake()
    }

    topBarSearch = () => {
        let search = this.props.currentSearch
        cKit.isFunction(search) ? search(this.keyword) : console.log('No search function!');
    }

    searchClose = () => {
        let menus = $('#menus');
        menus.animateCss('fadeInLeft');
        //menus.attr('style', 'display: inline-block');
        menus.css('display', 'inline-block');
        //$('.top-bar-search-input').attr('style', 'display: none');
        $('.top-bar-search-input').hide();

        let close = this.props.searchClose;
        cKit.isFunction(close) && close(this.keyword);
    }

    searchOpen = () => {
        let searchIpt = $('.top-bar-search-input');
        searchIpt.animateCss('fadeInLeft');
        //searchIpt.attr('style','display: inline-block');
        searchIpt.css('display', 'inline-block');
        //$('#menus').attr('style', 'display: none');
        $('#menus').hide();

        let open = this.props.searchOpen;
        cKit.isFunction(open) && open(this.keyword);
    }

    modifyPasswordOpen = () => {
        this.setState({
            modifyPasswordVisible: true
        });
    }

    modifyPasswordCancel = () => {
        this.setState({
            modifyPasswordVisible: false
        });
    }

    onKeyDown = (e) => {
      if(e.keyCode == 13){//点击回车
        this.topBarSearch();
      }
    }

    userDetailCancel = () => {
        this.setState({
            userDetailVisible: false,
            currentUser: userStore.getUser(),
        });
    }

    userDetailOpen = () => {
        this.getUserDetail();
        this.getUserCorpRolesList();
        this.setState({
            userDetailVisible: true
        });
    }

    getUserDetail = () => {
        let successHandler = (response) => {
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                let {msg, datas} = response;
                this.setState({
                    userDetail: datas
                });
            } else {
                errorNotice(response.msg);
            }
        };
        let errorHandler = (error) => {
            errorNotice('未知错误');
        };

        let url = cKit.makeUrl('/user/query?id=' + userStore.getUser().id);
        //验证登录信息
        let ajax = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
        ajax.submit();
    }

    getUserCorpRolesList = () => {
        let successHandler = (response) => {
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                let {msg, datas} = response;
                this.setState({
                    userCorpRolesList: datas
                });
            } else {
                errorNotice(response.msg);
            }
        };
        let errorHandler = (error) => {
            errorNotice('未知错误');
        };

        let url = cKit.makeUrl('/role/authuserlist?userId=' + userStore.getUser().id);
        //验证登录信息
        let ajax = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
        ajax.submit();
    }

    render() {
        const subLoop = (data) => data.map((subItem, index) => {
            if(subItem.object.isshow == 'Y') {
                return (
                    <Menu.Item key={ subItem.object.href || index } disabled={ subItem.select != true}>
                        {subItem.name}
                    </Menu.Item>
                )
            }
        })
        const loop = data => data.map((item) => {
            return (
                <SubMenu key={item.id} title={<span>{item.name}</span>} className="menu-item">
                    {subLoop(item.children)}
                </SubMenu>
            );
        });

        return (
            <div className="top-bar">
                <div className="top-bar-items">
                    <Menu
                        className="top-bar-home-menu"
                        onClick={this.handleClick}
                        selectedKeys={[this.state.currentMenu]}
                        mode="horizontal"
                        theme="dark"
                    >
                        <Menu.Item key="home" className="menu-item">
                            <img src={home_logo} className="home-logo"/>
                        </Menu.Item>
                    </Menu>
                    <div style={{float: 'left'}} id="menus">
                        <Menu
                            className="top-bar-menu"
                            onClick={this.handleClick}
                            selectedKeys={[this.state.currentMenu]}
                            mode="horizontal"
                            theme="dark"
                        >
                            { loop(this.state.menuList) }
                            <Menu.Item key="searchBtn" className="menu-item top-bar-search" disabled={!(cKit.isFunction(this.props.currentSearch) || cKit.isFunction(this.props.keywordChange))}>
                                &nbsp;&nbsp;<Icon type="search" style={{fontSize: 16,marginRight: 0}}/>
                            </Menu.Item>
                        </Menu>
                    </div>
                    <div className="top-bar-search-input">
                        <Input
                            suffix={<Icon type="close" onClick={this.searchClose}/>}
                            prefix={<Icon type="search" onClick={this.topBarSearch}/>}
                            onKeyDown={this.onKeyDown}
                            placeholder={this.props.placeholder || "请输入查询条件"}
                            onChange={(e) => {
                                this.keyword = e.target.value;

                                clearTimeout(this.state.timer);
                                let delay = this.props.delay;
                                if(!cKit.isNumber(delay) || delay < 0){
                                    delay = this.state.delay;
                                }

                                let change = this.props.keywordChange;
                                if(cKit.isFunction(change) ){
                                    this.state.timer = setTimeout(() => change(this.keyword), delay);
                                }
                            }}
                        />
                    </div>
                    {/*个人导航*/}
                    <div className="user-profile-menu">
                        <Dropdown
                            trigger={['click']}
                            placement='bottomCenter'
                            overlay={
                            <Menu className="user-profile-menu-items" theme="dark" onClick={this.handleClick}>
                                <Menu.Item key="userCollection" style={{paddingTop: 11}}>
                                    我的收藏
                                </Menu.Item>
                                <Menu.Item key="userDetail">
                                    我的状态
                                </Menu.Item>
                                <Menu.Item key="passwordModify">
                                    修改密码
                                </Menu.Item>
                                <Menu.Item key="logout" style={{paddingBottom: 11}}>
                                    退出登录
                                </Menu.Item>
                            </Menu>
                        } >
                            <div className="user-profile-item">
                                <img className="user-profile" src={this.state.currentUser ? (this.state.currentUser.headImage || userAvatar) : userAvatar}/>
                                <Icon type="down" className="user-profile-down"/>
                            </div>
                        </Dropdown>
                    </div>
                </div>
                <UserState visible={this.state.userDetailVisible} userDetail={this.state.userDetail} userCorpRolesList={this.state.userCorpRolesList} onCancel={this.userDetailCancel}/>
                <ModifyPassword visible={this.state.modifyPasswordVisible} onCancel={this.modifyPasswordCancel}/>
            </div>
        );
    }
}

