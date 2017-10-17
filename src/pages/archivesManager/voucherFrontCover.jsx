import React from 'react';
import {Row, Col} from 'antd';
import '../../less/common.less';
import '../../less/archivesManager/attachmentCollect.less';
import CustomModal from '../../components/customModal/CustomModal';

class VoucherFrontCover extends React.Component {
  state = {
    modalKey: Math.random()
  };

  afterClose = () => {
    this.validateErrors = [];
    this.setState({
      modalKey: Math.random()
    });
    let fn = this.props.afterClose;
    fn && fn();
  }

  componentDidMount = () => {
  }

  render() {
    const record = this.props.voucherRecord;
    return (
      <CustomModal
        className="voucher-table"
        width={800}
        visible={this.props.visible}
        title={"会计凭证封面"}
        operate={false}
        key={this.state.modalKey}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
      >
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            单位名称
          </Col>
          <Col span={10} className="voucher-table-col">
            {record.orgName}&nbsp;
          </Col>
          <Col span={4} className="voucher-table-col">
            凭证类型
          </Col>
          <Col span={6} className="voucher-table-col">
            {record.voucherType}&nbsp;
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            时间
          </Col>
          <Col span={20} className="voucher-table-col">
            {record.accountYear}年{record.accountMonth}月
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            册数
          </Col>
          <Col span={10} className="voucher-table-col">
            共{record.boxTotal}册
          </Col>
          <Col span={4} className="voucher-table-col">
            册次
          </Col>
          <Col span={6} className="voucher-table-col">
            本册是第{record.boxNum}册
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            {record.categoryName}&nbsp;
          </Col>
          <Col span={20} className="voucher-table-col">
            本册自第{record.startFileNo}号&nbsp;至&nbsp;{record.endFileNo}号&nbsp;共{record.voucherTotal}张
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            附件
          </Col>
          <Col span={10} className="voucher-table-col">
            共{record.accessoryTotal}张
          </Col>
          <Col span={10} className="voucher-table-col">
            本次凭证合计{record.accessoryTotal + record.voucherTotal}张
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            备注
          </Col>
          <Col span={20} className="voucher-table-col">
            &nbsp;
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col">
            装订人
          </Col>
          <Col span={10} className="voucher-table-col">
            {record.binderName}&nbsp;
          </Col>
          <Col span={4} className="voucher-table-col">
            装订日期
          </Col>
          <Col span={6} className="voucher-table-col">
            {record.bindTime}&nbsp;
          </Col>
        </Row>
        <Row className="voucher-table-row">
          <Col span={4} className="voucher-table-col voucher-table-bottom-left-col">
            会计主管
          </Col>
          <Col span={20} className="voucher-table-col voucher-table-bottom-right-col">
            &nbsp;
          </Col>
        </Row>
      </CustomModal>
    );
  }
}

export default VoucherFrontCover;