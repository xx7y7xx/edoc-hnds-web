/**
 * Created by APP on 2017/6/7.
 */

import userStore from '../../stores/userStore'
import menuStore from '../../stores/menuStore'


let PERMISSION = {
  // 档案管理
  // 档案利用
  // 后续管理
  // 系统管理
  /*整理*/
  REC_ARRANGE_EDIT: 'rec:arrange:edit',	//编辑
  REC_ARRANGE_SETVOLUME: 'rec:arrange:setvolume',	//装册
  REC_ARRANGE_UNSETVOLUME: 'rec:arrange:unsetvolume',	//拆册
  REC_ARRANGE_ESTABLISH: 'rec:arrange:establish', //立卷
  REC_ARRANGE_CLEANDATA: 'rec:arrange:cleandata', //清除数据
  /*归档*/
  REC_ARCHIVE_ARCHIVE: 'rec:archive:archive',	//归档
  REC_ARCHIVE_REARCHIVE: 'rec:archive:rearchive',	//重新归档

  /*档案查询*/
  //REC_ARCHIVESEARCH_QUERYDOC: 'rec:archiveSearch:querydoc',	//档案查询
  REC_ARCHIVESEARCH_PROVIDEOUTER: 'rec:archiveSearch:provideouter',	//对外提供
  //档案查阅
  //统计展板
  //档案移交
  //档案鉴定
  //档案销毁
  //用户管理
  //单位管理
  //角色管理
  //接口管理
  //日志管理
}
let has = (permissionKey) => {
  let permissionList = userStore.getPermission();
  if (permissionList) {
    return permissionList.indexOf(PERMISSION[permissionKey]) >= 0;
  } else {
    return false
  }

}

let hasRoutePermission = (href) =>{
  let userMenuList = menuStore.getMenuList();

  let permHref = [];
  for(let i in userMenuList){
    for(let j in userMenuList[i].children){
      if(userMenuList[i].children[j].select === true){
        permHref[userMenuList[i].children[j].object.href] = true;
      }
    }
  }
  return Boolean(permHref[href])
}

export default {
  hasPermission: has,
  hasRoutePermission
}