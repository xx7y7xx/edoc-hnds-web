/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import $ from 'jquery'
import {Icon, Card} from 'antd'
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit';
import VoucherFrontCover from './voucherFrontCover'
import {errorNotice} from '../../components/Common';
import browserHistory from '../../libs/browserHistory'
import '../../less/archivesManager/cardList.less'

export default class CardList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      voucherFrontCoverVisible: false,
      voucherRecord: {}
    }
  }

  onCancel = () => {
    this.setState({
      voucherFrontCoverVisible: false
    })
  }

  componentDidUpdate = () => {
    $('.box-card')
      .bind('mouseenter', (function (e) {
        $(this).find('.box-card-hide-content').removeClass('hide-content-down').addClass('hide-content-up')
      }))
      .bind('mouseleave', (function (e) {
        $(this).find('.box-card-hide-content').removeClass('hide-content-up').addClass('hide-content-down')
      }))
  }

  getBoxDetailFetch = (boxId) => {
    let thiz = this;
    let successHandler = function (response) {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.setState({
          voucherRecord: response.datas,
          voucherFrontCoverVisible: true
        })
      } else {
        errorNotice(response.msg)
      }
    }
    let errorHandler = function (error) {
      errorNotice(error)
    }
    let url = cKit.makeUrl('/box/info/' + boxId + '?current_org_id=' + this.props.currentOrgId);
    let action = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    action.submit();
  }

  openList = (boxId) => {
    //browserHistory.push('/arrange/afterBooklet/list/' + this.currentOrgId + '/' + boxId);
    browserHistory.push(this.props.openUrl + this.props.currentOrgId + '/' + boxId);
  }

  voucherFrontCover = (boxId) => {
    this.getBoxDetailFetch(boxId)
  }

  render() {
    const cardList = this.props.cardList;
    const cardLoop = (data) => data.map((item, index) => {
      let cardClass = "box-card ";
      if(item.rootCategoryPrefix === 'PZ'){
        cardClass += "voucher-card";
      }else if(item.rootCategoryPrefix === 'BB'){
        cardClass += "report-card";
      }else if(item.rootCategoryPrefix === 'ZB'){
        cardClass += "books-card";
      }else {
        cardClass += "other-card";
      }
      if(item.volumnNum){
        cardClass += " archived-card"
      }
      let cardItem = "";
      if(item.rootCategoryPrefix === 'PZ'){
        cardItem = (
          <Card className={cardClass} key={index}>
            <div className="box-card-main-content">
              <p className="box-card-item">全宗号</p>
              <p className="box-card-item box-item-bottom-line">{item.fondsNo || '-'}</p>
              <p className="box-card-item">目录号</p>
              <p className="box-card-item box-item-bottom-line">{item.categoryCode || '-'}</p>
              {
                item.volumnNum
                &&
                <div>
                  <p className="box-card-item">案卷号</p>
                  <p className="box-card-item box-item-bottom-line">{item.volumnNum || '-'}</p>
                </div>
              }
              <p className="box-card-item">年度</p>
              <p className="box-card-item box-item-bottom-line">{item.accountYear || '-'}</p>
              <p className="box-card-item">月份</p>
              <p className="box-card-item box-item-bottom-line">{item.accountMonth || '-'}</p>
              <p className="box-card-item">共{item.boxTotal}册</p>
              <p className="box-card-item box-item-bottom-line">第{item.boxNum}册</p>
              <p className="box-card-item">保管期限</p>
              <p className="box-card-item box-item-bottom-line">{(item.valiPeriod || 'x') + '(年)'}</p>
              <div className="card-bottom">
                <div className="box-card-circle"/>
              </div>
            </div>
            <div className="box-card-hide-content">
              <p className="work-icon open-icon voucher-icon" onClick={() => this.openList(item.id)}><Icon
                type="folder-open"/><span>&nbsp;打开</span></p>
              <p className="work-icon voucher-icon" onClick={() => this.voucherFrontCover(item.id)} style={{marginTop: 10}}><Icon
                type="eye-o"/><span>&nbsp;封面</span></p>
            </div>
          </Card>
        );
      } else {
        cardItem = (
          <Card className={cardClass} key={index}>
            <div className="box-card-main-content">
              <p className="box-card-item box-item-bottom-line" style={{lineHeight: 3}}>会计档案</p>
              <p className="box-card-item">年度</p>
              <p className="box-card-item box-item-bottom-line">{item.accountYear || '-'}</p>
              <p className="box-card-item">全宗号</p>
              <p className="box-card-item box-item-bottom-line">{item.fondsNo || '-'}</p>
              <p className="box-card-item">目录号</p>
              <p className="box-card-item box-item-bottom-line">{item.categoryCode || '-'}</p>
              {
                item.volumnNum
                &&
                <div>
                  <p className="box-card-item">案卷号</p>
                  <p className="box-card-item box-item-bottom-line">{item.volumnNum || '-'}</p>
                </div>
              }
              <p className="box-card-item">盒号</p>
              <p className="box-card-item box-item-bottom-line">{item.boxNum || '-'}</p>
              <p className="box-card-item">保管期限</p>
              <p className="box-card-item box-item-bottom-line">{(item.valiPeriod || 'x') + '(年)'}</p>
              <div className="card-bottom">
                <div className="box-card-circle"/>
              </div>
            </div>
            <div className="box-card-hide-content">
              <p className="work-icon open-icon" onClick={() => this.openList(item.id)}><Icon
                type="folder-open"/><span>&nbsp;打开</span></p>
            </div>
          </Card>
        )
      }
      return cardItem
    })

    return (
      <div>
        {cardLoop(cardList)}
        <VoucherFrontCover
          onCancel={this.onCancel}
          visible={this.state.voucherFrontCoverVisible}
          voucherRecord={this.state.voucherRecord}
        />
      </div>
    )
  }
}