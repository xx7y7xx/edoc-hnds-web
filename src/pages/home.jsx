import React from 'react';
import browserHistory from '../libs/browserHistory'
import Topbar from '../components/topBar/Topbar'
import menuStore from "../stores/menuStore"
import {Col} from 'antd'
import access from '../images/home-img/access.png'
import access_default from '../images/home-img/arrange-default.png'
import accessApproval from '../images/home-img/accessApproval.png'
import accessApproval_default from '../images/home-img/accessApproval-default.png'
import archive from '../images/home-img/archive.png'
import archive_default from '../images/home-img/archive-default.png'
import arrange from '../images/home-img/arrange.png'
import arrange_default from '../images/home-img/arrange-default.png'
import charts from '../images/home-img/charts.png'
import charts_default from '../images/home-img/charts-default.png'
import search from '../images/home-img/search.png'
import search_default from '../images/home-img/search-default.png'
import transferApply from '../images/home-img/transferApply.png'
import transferApply_default from '../images/home-img/transferApply-default.png'
import transferApproval from '../images/home-img/transferApproval.png'
import transferApproval_default from '../images/home-img/transferApproval-default.png'

import '../less/home.less'

const defaultMenus = [{
  name: '整理',
  icon: <img className="menu-item-icon" src={arrange} />,
  defaultIcon : <img className="menu-item-icon" src={arrange_default} />,
  color: '#4ca7d8'
},{
  name: '归档',
  icon: <img className="menu-item-icon" src={archive} />,
  defaultIcon : <img className="menu-item-icon" src={archive_default} />,
  color: '#9676c2'
},{
  name: '档案查询',
  icon: <img className="menu-item-icon" src={search} />,
  defaultIcon : <img className="menu-item-icon" src={search_default} />,
  color: '#f87a6a'
},{
  name: '统计展板',
  icon: <img className="menu-item-icon" src={charts} />,
  defaultIcon : <img className="menu-item-icon" src={charts_default} />,
  color: '#4c9feb'
},{
  name: '档案查阅',
  icon: <img className="menu-item-icon" src={access} />,
  defaultIcon : <img className="menu-item-icon" src={access_default} />,
  color: '#e04c7e'
},{
  name: '查阅审批',
  icon: <img className="menu-item-icon" src={accessApproval} />,
  defaultIcon : <img className="menu-item-icon" src={accessApproval_default} />,
  color: '#4cad4d'
},{
  name: '移交申请',
  icon: <img className="menu-item-icon" src={transferApply} />,
  defaultIcon : <img className="menu-item-icon" src={transferApply_default} />,
  color: '#ff71a2'
},{
  name: '移交审批',
  icon: <img className="menu-item-icon" src={transferApproval} />,
  defaultIcon : <img className="menu-item-icon" src={transferApproval_default} />,
  color: '#12bce7'
}];




export default class Home extends React.Component {

  go = (href) => {
    browserHistory.push('/'+ href)
  }

  render() {
    let menuList = menuStore.getMenuList();
    for(let i in defaultMenus){
      for(let j in menuList){
        for(let k in menuList[j].children){
          if(menuList[j].children[k].name === defaultMenus[i].name){
            defaultMenus[i].href = menuList[j].children[k].object.href
            defaultMenus[i].select = menuList[j].children[k].select
          }
        }
      }
    }

    const loop = data => data.map((item, index) => {
      return (
        <Col className='card-item-col' span="6" key={index}>
          <div className="">
            <div className="filter-card" onClick={item.select ? () => this.go(item.href) : ()=>{return}}>
              { item.select ? item.icon : item.defaultIcon}
              <p className="menu-item-title" style={{color: (item.select ? item.color : '#cccccc')}}>{item.name}</p>
            </div>
          </div>
        </Col>
      )
    });

    const main_content_H = document.documentElement.clientHeight - 46;

    return <div style={{
      width: '100%',
      height: main_content_H
    }}>
      <Topbar />
      <div className="home-page-wrap">
        <div className="home-main-content main-content-animate">
          <div className="home-menu-bars">
            {loop(defaultMenus)}
          </div>
        </div>
        <div className="filter-card"/>
      </div>
    </div>
  }
}