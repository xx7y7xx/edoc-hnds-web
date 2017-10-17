import React from 'react';
import {Button} from 'antd'
import browserHistory from '../libs/browserHistory'
import Topbar from '../components/topBar/Topbar'


export default class NoPermission extends React.Component {
  render() {
    const main_content_H = document.documentElement.clientHeight - 46;

    return <div style={{
      width: '100%',
      height: main_content_H
    }}>
      <Topbar />
      <div className="archive-page-wrap">
        <div className="home-main-content main-content-animate">
          <p className="no-data">暂无权限</p>
          <p className="no-data-content">请联系管理员开通权限</p>
          <div style={{marginTop:15}}>
            <Button
              type="primary"
              className="home-back"
              onClick={() => {
                browserHistory.push('/home')
              }}
            >返回首页</Button>
          </div>
        </div>
      </div>
    </div>
  }
}