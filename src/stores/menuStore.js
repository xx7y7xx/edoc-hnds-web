/**
 * Created by APP on 2017/4/25.
 */
import {observable, action} from 'mobx';

class MenuStore {

    @observable menu;
    @observable breadcrumbs;

    constructor() {
        this.menuList = [];
        this.menu = 'home';
        this.breadcrumbs = [];
    }

    @action setMenuList = (menuList) => {
        if(menuList === null){
            sessionStorage.removeItem('menuList')
        }else {
            sessionStorage.setItem('menuList', JSON.stringify(menuList));
        }
    }

    @action getMenuList = () => {
        if(sessionStorage.getItem('menuList')){
            return JSON.parse(sessionStorage.getItem('menuList'));
        }else {
            return [];
        }
    }

    @action setCurrentMenu = (menu) => {
        if(menu === null){
            sessionStorage.removeItem('currentMenu')
        }else {
            sessionStorage.setItem('currentMenu', menu);
        }
    }

    @action getCurrentMenu = () => {
        if(sessionStorage.getItem('currentMenu')){
            return sessionStorage.getItem('currentMenu');
        }else {
            return 'home'
        }
    }

    @action removeMenu = () => {
        sessionStorage.removeItem('currentMenu')
    }

    @action setBreadcrumbs = (breadcrumbs) => {
        if(breadcrumbs === null){
            sessionStorage.removeItem('breadcrumbs')
        }else {
            sessionStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs));
        }
    }

    @action getBreadcrumbs = () => {
        if(sessionStorage.getItem('breadcrumbs')){
            return JSON.parse(sessionStorage.getItem('breadcrumbs'));
        }else {
            return [];
        }
    }

}

const menuStore = new MenuStore();

export default menuStore;
export {MenuStore};