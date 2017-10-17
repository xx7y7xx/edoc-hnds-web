/**
 * Created by APP on 2017/4/25.
 */
import {observable, action} from 'mobx';
import browserHistory  from '../libs/browserHistory'

class UserStore {

    @observable user;

    constructor() {
        this.user = {
            realName: "",
            orgName: "",
            headImage: "",
            id: "",
            corp: {}
        };
        this.jsessionid = "";
        this.permissionList = [];
    }

    @action setUser = (user) => {
        if(user === null){
            sessionStorage.removeItem('user')
        }else {
            if(typeof user === 'object'){
                let currentUser = JSON.parse(sessionStorage.getItem('user')) ? JSON.parse(sessionStorage.getItem('user')) : {};
                for(let i in user){
                    currentUser[i] = user[i];
                }
                sessionStorage.setItem('user', JSON.stringify(currentUser));
            }else if( typeof user === 'string'){
                sessionStorage.setItem('user', user);
            }else {
                sessionStorage.setItem('user', null);
            }
        }
    }

    @action removeUser = () => {
        sessionStorage.removeItem('user')
    }

    @action logoutClear = () => {
        sessionStorage.clear();
    }

    @action getUser = () => {
        let user = sessionStorage.getItem('user');
        if(user != null && user != 'null' && user != 'undefined') {
            return JSON.parse(sessionStorage.getItem('user'));
        }
        console.log('getUser:用户已登出');
        browserHistory.push('/login');
    }

    @action hasUserSession = () => {
        let user = sessionStorage.getItem('user')
        if(user != null && user != 'null' && user != 'undefined'){
            browserHistory.push('/');
            return true;
        }else {
            //browserHistory.push('/login');
            return false;
        }
    }

    @action setSessionId = (sessionid) => {
        sessionStorage.setItem('jsessionid', sessionid);
    }

    @action getSessionId = () => {
        return sessionStorage.getItem('jsessionid')
    }

    @action removeSessionId = () => {
        sessionStorage.removeItem('jsessionid')
    }

    @action setPermission = (permissionList) => {
        sessionStorage.setItem('KJDA_PERMISSION', JSON.stringify(permissionList));
    }

    @action getPermission = () => {
        return JSON.parse(sessionStorage.getItem('KJDA_PERMISSION'));
    }
}

const userStore = new UserStore();

export default userStore;
export {UserStore};