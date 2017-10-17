/**
 * Created by APP on 2017/6/29.

 * last update
 * zhaolongwei
 */
import React from 'react';
import { Row, Col, Button } from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';

import '../../less/common.less';
import '../../less/accessManager.less';

import CustomModal from '../../components/customModal/CustomModal';
import CustomTable from '../../components/customTable/CustomTable';
import {errorNotice} from '../../components/Common';
import TransferListPrint from '../printPages/transferListPrint'

class TransferList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,

      record: {},
      targetRecord: {},
    };

    this.isAfterVisible = this.props.visible;

    this.columns = [{
      width: '12.5%',
      title: '所属单位',
      dataIndex: 'orgName',
      key: 'orgName',
    }, {
      width: '12.5%',
      title: '年度',
      dataIndex: 'accountYear',
      key: 'accountYear',
    }, {
      width: '12.5%',
      title: '会计凭证',
      dataIndex: 'voucherBoxTotal',
      key: 'voucherBoxTotal',
      render: (text, record) => {
        return text + '册';
      }
    }, {
      width: '12.5%',
      title: '会计账簿',
      dataIndex: 'bookBoxTotal',
      key: 'bookBoxTotal',
      render: (text, record) => {
        return text + '册';
      }
    }, {
      width: '12.5%',
      title: '会计报表',
      dataIndex: 'reportBoxTotal',
      key: 'reportBoxTotal',
      render: (text, record) => {
        return text + '册';
      }
    }, {
      width: '12.5%',
      title: '其它资料',
      dataIndex: 'otherBoxTotal',
      key: 'otherBoxTotal',
      render: (text, record) => {
        return text + '册';
      }
    }, {
      width: '12.5%',
      title: '光盘',
      dataIndex: 'pan',
      key: 'pan',
      render: () => {
        return '--';
      }
    }, {
      title: '备注',
      dataIndex: 'other',
      key: 'other',
      render: () => {
        return '--';
      }
    }];
  }

  componentDidUpdate() {
    if(this.props.visible && !this.isAfterVisible){ // 当本组件显示的时候执行
      this.isAfterVisible = true;
      this.getRecordDetailFetch();
    }
  }

  getRecordDetailFetch = () => {
    this.setState({
      loading: true,
    });
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        (datas.printList || []).forEach((item) => {
          item.id = Math.random();
        });

        this.setState({
          targetRecord: datas,
        });
      } else {
        errorNotice(msg);
      }
    };
    let id = this.props.record.id;
    let url = '/turnover/printlist';
    netKit.getFetch({
      url,
      data: {id},
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.setState({
          loading: false,
        });
      }
    });
  }

  afterClose = () => {
    this.isAfterVisible = false;
    this.validateErrors = {};

    this.setState({
      currentAction: 'view',
      orgs: [],
      targetRecord: {},
    });

    let fn = this.props.afterClose;
    fn && fn();
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  transferListPrint = () => {
    let printContent = this.printContent.innerHTML;
    this.printIframe.contentDocument.body.innerHTML = printContent;
    this.printIframe.contentWindow.print()
  }

  render() {
    let {
      belongDept,
      applyName,
      receiveDept,
      receiver,
    } = this.state.targetRecord;
    return (
      <CustomModal
        title="移交清单"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
        width={800}
        operate={
          <Button type="primary" onClick={this.transferListPrint}>
            打印
          </Button>
        }
      >
        <div className="transfer-detail-list-modal">
          <div className="table-wrap">
            <CustomTable
              loading={this.state.loading}
              dataSource={this.state.targetRecord.printList}
              columns={this.columns}
              operate={false}
            />
          </div>
          <div className="detail-info">
            <Row>
              <Col className="tit" span={2}>移交部门</Col>
              <Col className="info" span={6}>{belongDept}</Col>
              <Col className="tit" span={2}>接收部门</Col>
              <Col className="info" span={6}>{receiveDept}</Col>
              <Col className="tit" span={2}>监督人</Col>
              <Col className="info" span={6}></Col>
            </Row>
            <Row>
              <Col className="tit" span={2}>移交人</Col>
              <Col className="info" span={6}>{applyName}</Col>
              <Col className="tit" span={2}>接收人</Col>
              <Col className="info" span={6}>{receiver}</Col>
              <Col className="tit" span={2}>移交时间</Col>
              <Col className="info" span={6}></Col>
            </Row>
          </div>
        </div>
        <iframe src={'/print?t=' + new Date().getTime()} style={{display: 'none'}} ref={(node) => this.printIframe = node}/>
        <TransferListPrint
          superRef={(node) => this.printContent = node}
          targetRecord={this.state.targetRecord}
        />
      </CustomModal>
    );
  }
}
export default TransferList;