import React from 'react'
import $ from 'jquery'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import browserHistory from '../../../libs/browserHistory'
import Topbar from '../../../components/topBar/Topbar'
import {Title} from '../../../components/Title'
import {Card, Col, Row, Icon} from 'antd'
import {errorNotice} from '../../../components/Common';
import '../../../less/archivesManager/arrange.less'
import citySvg from '../../../images/cityscape.jpeg'

export default class Arrange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      page: 1,
      size: 15,
      recordList: [],
      loading: false,
      finish: false,
      total: 0,
      establishArchivesVisible: false
    }
  }

  componentWillMount = () => {
  }

  componentDidMount = () => {
    this.refreshRecords()
  }

  componentDidUpdate = () => {
    $('.card-item')
      .bind('mouseenter', (function (e) {
        $(this).find('.content-card').removeClass('content-card-down').addClass('content-card-up')
      }))
      .bind('mouseleave', (function (e) {
        $(this).find('.content-card').removeClass('content-card-up').addClass('content-card-down')
      }))
  }

  //高级搜索
  advanceSearch = (keyword) => {
    this.getEstablishList({
      keyword,
      page: 1,
    });
  }

  getEstablishList = ({
    keyword = this.state.keyword,
    page = this.state.page,
    size = this.state.size
  }) => {
    const thiz = this;
    let postBody = {
      keyword: keyword || '',
      "condition": [
        {
          "status": 15
        },
        {
          "status": 20
        },
        {
          "status": 30
        }
      ]
    };
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.setState({
          recordList: response.datas.pageList,
          total: response.datas.total,
          loading: false
        })
      } else {
        errorNotice(response.msg);
      }
    };
    let errorHandler = function (error) {
      errorNotice("", "未知错误");
    };
    let url = cKit.makeUrl('/establish/list?page=' + page + '&size=' + size);
    //验证登录信息
    let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    loginAction.submit();
  }

  refreshRecords = () => {
    this.getEstablishList({
      page: this.state.page,
    })
  }

  archiveOpen = (event, orgId) => {
    event.stopPropagation();
    $(event.currentTarget).animateCss('pulse');

    console.log('archive open!' + orgId)
    let interval = setInterval(function () {
      browserHistory.push('/archive/beforeArchive/' + orgId)
      window.clearInterval(interval);
    }, 750);

  }

  appendEstablishList = () => {
    const contentDom = this.contentDom;
    const scorllTop = contentDom.scrollTop;
    const scorllHeight = contentDom.scrollHeight;
    const clientHeight = contentDom.clientHeight;
    if (clientHeight + scorllTop == scorllHeight) {
      let currentSize = this.state.size;
      let total = this.state.total;
      if (currentSize >= total) {
        this.setState({
          finish: true
        })
      } else {
        this.setState({
          size: currentSize + 8,
          loading: true
        })
        this.getEstablishList({
          size: currentSize + 8
        });
      }
    }
  }

  render() {
    const loop = data => data.map((item, index) => {
      return (
        <Col className='card-item-col' span="6" key={index}>
          <Card className="card-item"
                style={{backgroundImage: 'url(' + (item.orgImage !== "" ? item.orgImage : citySvg) + ')'}}
                bodyStyle={{padding: 0}}
                onClick={ (e) => this.archiveOpen(e, item.orgId) }
          >
            <div className="background-card">
              <div className="custom-card content-card">
                <div className="card-title">
                  <h3>{item.orgName}</h3>
                </div>
                <div className="archive-detail first-item">
                  <label>全宗号&nbsp;:&nbsp;</label><span>{item.fondsNo}</span>
                </div>
                <div className="archive-detail">
                  <label>起始年份&nbsp;:&nbsp;</label><span>{item.startYear}年{item.startMonth}月</span>
                </div>
                <div className="archive-detail">
                  <label>归档状态&nbsp;:&nbsp;</label>
                  <span>
                    {item.status == 20 && '待归档'}
                    {item.status == 30 && '已归档'}
                    {item.status == 15 && '已归档'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      )
    });
    const main_content_H = document.documentElement.clientHeight - 76;

    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入单位名称、全宗号"}/>
        <div className="main-content main-content-animate"
             style={{height: main_content_H, overflowY: 'auto'}}
             onScroll={this.appendEstablishList}
             ref={(node) => this.contentDom = node}
        >
          {Title()}
          <div>
            <Row>
              {
                this.state.recordList
                && this.state.recordList.length <= 0
                && loop(this.state.recordList)
              }
              { this.state.recordList && this.state.recordList.length > 0 && loop(this.state.recordList) }
              {
                this.state.loading === true
                &&
                <Col className='card-item-col bottom-line' span="24" key='loading'>
                  <p><Icon type="loading"/>&nbsp;&nbsp;正在加载数据</p>
                </Col>
              }
              {
                this.state.finish === true
                &&
                <Col className='card-item-col bottom-line' span="24" key='finish'>
                  <p>数据已全部加载</p>
                </Col>
              }
            </Row>
          </div>
        </div>
      </div>
    )
  }
}