import React from 'react'
import $ from 'jquery'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import pKit from '../../../utils/base/permissionKit'
import browserHistory from '../../../libs/browserHistory'
import Topbar from '../../../components/topBar/Topbar'
import {Title} from '../../../components/Title'
import {Card, Col, Row, Icon} from 'antd'
import CustomModal from '../../../components/customModal/CustomModal';
import {errorNotice, warnNotice} from '../../../components/Common';
import '../../../less/archivesManager/arrange.less'
import EstablishArchives from './../establishArchives'
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
    let postBody = {
      keyword,
      "condition": [
        {
          "status": 0
        },
        {
          "status": 10
        },
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
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        this.setState({
          page,
          size,
          keyword,
          recordList: response.datas.pageList,
          total: response.datas.total,
          loading: false
        })
      } else {
        errorNotice(response.msg);
      }
    };
    let errorHandler = (error) => {
      errorNotice("", "未知错误");
    };

    let url = '/establish/list';
    netKit.postFetch({
      url,
      data: postBody,
      param: {
        page,
        size,
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  refreshRecords = () => {
    this.getEstablishList({
      page: this.state.page,
    })
  }

  archiveDelete = (id) => {
    //删除立卷
    const thiz = this;

    let postBody = [{id: id}];
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.refreshRecords();
      } else {
        errorNotice(response.msg);
      }
    };
    let errorHandler = function (error) {
      errorNotice("", "未知错误");
    };
    let url = cKit.makeUrl('/establish/delete');
    //验证登录信息
    let loginAction = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    loginAction.submit();
  }

  deleteCategory = (event, id) => {
    event.stopPropagation();
    CustomModal.confirm({
      title: '温馨提示',
      content: '确认要删除立卷信息吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.archiveDelete(id)
      }
    });
  }

  archiveOpen = (event, orgId) => {
    event.stopPropagation();
    $(event.currentTarget).animateCss('pulse');

    console.log('archive open!' + orgId)
    let interval = setInterval(function () {
      browserHistory.push('/arrange/beforeBooklet/' + orgId)
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
          size: currentSize + 4,
          loading: true
        })
        this.getEstablishList({
          size: currentSize + 4
        });
      }
    }
  }

  archiveAdd = () => {
    const thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {datas, msg} = response;
        if (datas && datas.length > 0) {
          //立卷
          thiz.setState({
            establishArchivesVisible: true
          })
        } else {
          warnNotice('无可立卷单位', '提示')
        }
      } else {
        errorNotice(response.msg);
      }
    };
    let errorHandler = function (error) {
      errorNotice("", "未知错误");
    };
    let url = cKit.makeUrl('/org/unestablish/dropdown');
    //验证登录信息
    let loginAction = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    loginAction.submit();

  }

  cancelEstablish = () => {
    this.setState({
      establishArchivesVisible: false
    })
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
                    {item.status == 0 && '未装册'}
                    {item.status == 10 && '待装册'}
                    {item.status == 15 && '待装册'}
                    {item.status == 20 && '已装册'}
                    {item.status == 30 && '已归档'}
                                    </span>
                  {
                    item.status == 0
                    &&
                    <Icon onClick={(e) => this.deleteCategory(e, item.id)} className="archive-delete-btn"
                          type="delete"/>
                  }
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
                pKit.hasPermission('REC_ARRANGE_ESTABLISH')
                &&
                <Col className='card-item-col' span="6" key='add'>
                  <Card className="card-item-add" onClick={this.archiveAdd}>
                    <Icon type="plus"/>
                    <p>立卷</p>
                  </Card>
                </Col>
              }

              { this.state.recordList && this.state.recordList.length && loop(this.state.recordList) }
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
        <EstablishArchives
          visible={this.state.establishArchivesVisible}
          onCancel={this.cancelEstablish}
          success={this.refreshRecords}
        />
      </div>
    )
  }
}