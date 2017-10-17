import React from 'react';
import {Row, Col} from 'antd';
import '../../less/common.less';
import '../../less/print/print.less';

class TransferListPrint extends React.Component {
  state = {};

  componentDidMount = () => {
  }

  render() {
    let {
      orgName,
      applyName,
      receiveDept,
      receiver,
      printList
    } = this.props.targetRecord;
    const loop = data => data.map((record, index) => {
      return (
        <Row key={index} className="transfer-list-table-row">
          <Col span={5} className="center-col">
            {record.orgName}&nbsp;
          </Col>
          <Col span={3} className="center-col">
            {record.accountYear}&nbsp;
          </Col>
          <Col span={3} className="center-col">
            {record.voucherBoxTotal}册
          </Col>
          <Col span={3} className="center-col">
            {record.bookBoxTotal}册
          </Col>
          <Col span={3} className="center-col">
            {record.reportBoxTotal}册
          </Col>
          <Col span={3} className="center-col">
            {record.otherBoxTotal}册
          </Col>
          <Col span={4} className="center-col has-border-right">
            &nbsp;
          </Col>
        </Row>
      )
    });
    return (
      <div ref={this.props.superRef} style={{display:'none',width: '90%'}}>
        <Row className="transfer-list-table-header">
          <Col span={5} className="center-col">
            所属单位
          </Col>
          <Col span={3} className="center-col">
            年度
          </Col>
          <Col span={3} className="center-col">
            会计凭证
          </Col>
          <Col span={3} className="center-col">
            会计账簿
          </Col>
          <Col span={3} className="center-col">
            会计报表
          </Col>
          <Col span={3} className="center-col">
            其他资料
          </Col>
          <Col span={4} className="center-col has-border-right">
            备注
          </Col>
        </Row>
        {loop(printList || [])}
        <Row className="transfer-list-table-footer">
          <Col span={3} className="transfer-indent-item transfer-bold-item">
            移交部门
          </Col>
          <Col span={6} className="transfer-indent-item">
            {orgName}
          </Col>
          <Col span={3} className="transfer-indent-item transfer-bold-item">
            接受部门
          </Col>
          <Col span={6} className="transfer-indent-item">
            {receiveDept}
          </Col>
          <Col span={3} className="transfer-indent-item transfer-bold-item">
            监督人
          </Col>
          <Col span={3} className="transfer-indent-item">
            &nbsp;
          </Col>
        </Row>
        <Row className="">
          <Col span={3} className="transfer-indent-item transfer-bold-item">
            移交人
          </Col>
          <Col span={6} className="transfer-indent-item">
            {applyName}
          </Col>
          <Col span={3} className="transfer-indent-item transfer-bold-item">
            接收人
          </Col>
          <Col span={6} className="transfer-indent-item">
            {receiver}
          </Col>
          <Col span={3} className="transfer-indent-item transfer-bold-item">
            移交时间
          </Col>
          <Col span={3} className="">
            &nbsp;
          </Col>
        </Row>
      </div>
    );
  }
}

export default TransferListPrint;