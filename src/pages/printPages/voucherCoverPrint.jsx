import React from 'react';
import {Row, Col} from 'antd';
import '../../less/common.less';
import '../../less/print/print.less';

class VoucherFrontCoverPrint extends React.Component {
  state = {};

  componentDidMount = () => {
  }

  render() {
    let {superRef, recordList, boxInfoList = []} = this.props;
    let printType = recordList[0] && recordList[0].rootCategoryPrefix;

    let loop = data => data.map((record, index) => {
      return (
        <div key={index}>
          <div className="voucher-cover-outLine">
            <h2 className="voucher-cover-title">会计凭证封面</h2>
            <Row className="voucher-table-row voucher-table-header">
              <Col span={4} className="intend-col">
                单位名称:
              </Col>
              <Col span={10} className="intend-col" style={{textAlign: 'left'}}>
                {record.orgName}&nbsp;
              </Col>
              <Col span={4} className="intend-col">
                凭证类型:
              </Col>
              <Col span={6} className="intend-col"  style={{textAlign: 'left'}}>
                {record.voucherType}&nbsp;
              </Col>
            </Row>
            <Row className="voucher-table-row">
              <Col span={4} className="voucher-table-col has-border-top">
                时间
              </Col>
              <Col span={20} className="voucher-table-col has-border-top has-border-right">
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
              <Col span={6} className="voucher-table-col has-border-right">
                本册是第{record.boxNum}册
              </Col>
            </Row>
            <Row className="voucher-table-row">
              <Col span={4} className="voucher-table-col">
                {record.categoryName}&nbsp;
              </Col>
              <Col span={20} className="voucher-table-col has-border-right">
                本册自第{record.startFileNo}&nbsp;至&nbsp;{record.endFileNo}&nbsp;共{record.voucherTotal}张
              </Col>
            </Row>
            <Row className="voucher-table-row">
              <Col span={4} className="voucher-table-col">
                附件
              </Col>
              <Col span={10} className="voucher-table-col">
                共{record.accessoryTotal}张
              </Col>
              <Col span={10} className="voucher-table-col has-border-right">
                本次凭证合计{record.accessoryTotal + record.voucherTotal}张
              </Col>
            </Row>
            <Row className="voucher-table-row">
              <Col span={4} className="voucher-table-col">
                备注
              </Col>
              <Col span={20} className="voucher-table-col has-border-right">
                &nbsp;
              </Col>
            </Row>
            <Row className="voucher-table-row voucher-table-footer">
              <Col span={5} className="intend-col">
                会计主管:
              </Col>
              <Col span={4} className="intend-col">
                &nbsp;
              </Col>
              <Col span={3} className="intend-col">
                装订人:
              </Col>
              <Col span={4} className="intend-col" style={{textAlign: 'left'}}>
                {record.binderName}&nbsp;
              </Col>
              <Col span={3} className="intend-col">
                装订日期:
              </Col>
              <Col span={5} className="intend-col">
                {record.bindTime}&nbsp;
              </Col>
            </Row>
          </div>
          <div className="box-back">
            <p className="box-back-item box-back-header">&nbsp;</p>
            <p className="box-back-item">全宗号</p>
            <p className="box-back-item box-item-bottom-line">{record.fondsNo || '-'}</p>
            <p className="box-back-item">目录号</p>
            <p className="box-back-item box-item-bottom-line">{record.categoryCode || '-'}</p>
            <p className="box-back-item">案卷号</p>
            <p className="box-back-item box-item-bottom-line">{record.volumnNum || '-'}</p>
            <p className="box-back-item">年度</p>
            <p className="box-back-item">{record.accountYear || '-'}</p>
            <p className="box-back-item">月份</p>
            <p className="box-back-item">{record.accountMonth || '-'}</p>
            <p className="box-back-item">共{record.boxTotal}册</p>
            <p className="box-back-item ">第{record.boxNum}册</p>
            <p className="box-back-item">保管期限</p>
            <p className="box-back-item">{(record.valiPeriod || 'x') + '(年)'}</p>
            <p className="box-back-item box-back-footer has-border-bottom">&nbsp;</p>
          </div>
          <p style={{'pageBreakAfter': 'always'}}/>
        </div>
      )
    });


    let loopOther = (records, boxInfoList) => {
      let recordsDom = records => records.map((record, index) => {
        let doms = (boxInfoList[index] || []).map((item, i) => {
          return (
            <Row key={Math.random()} type="flex" className="table-tr">
              <Col span={3}>{i + 1}</Col>
              <Col span={3}>{item.owner}</Col>
              <Col span={3}>{item.fileNo}</Col>
              <Col span={6}>{item.title}</Col>
              <Col span={4}>{item.docDate}</Col>
              <Col span={2}>{item.pages || 0}</Col>
              <Col className="last" span={3}></Col>
            </Row>
          );
        });
        let arr = [
          <div key={Math.random()} className="table-header-title">
            <h2 className="table-top-title">卷内目录</h2>
            <Row className="table-header-hr">
              <Col span={3}>顺序号</Col>
              <Col span={3}>责任者</Col>
              <Col span={3}>文号</Col>
              <Col span={6}>题名</Col>
              <Col span={4}>日期</Col>
              <Col span={2}>页码</Col>
              <Col className="last" span={3}>备注</Col>
            </Row>
          </div>
        ];
        arr.push(doms);
        arr.push(<p style={{'pageBreakAfter': 'always'}}/>);
        arr.push(
          <div key={Math.random()}>
            <div className="box-back">
              <p className="box-back-item box-back-header">&nbsp;</p>
              <p className="box-back-item">会计档案</p>
              <p className="box-back-item">年度</p>
              <p className="box-back-item box-item-bottom-line">{record.accountYear || '-'}</p>
              <p className="box-back-item">全宗号</p>
              <p className="box-back-item box-item-bottom-line">{record.fondsNo || '-'}</p>
              <p className="box-back-item">目录号</p>
              <p className="box-back-item box-item-bottom-line">{record.volumnNum || '-'}</p>
              <p className="box-back-item">案卷号</p>
              <p className="box-back-item">{record.volumnNum || '-'}</p>
              <p className="box-back-item">盒号</p>
              <p className="box-back-item">{record.boxNum || '-'}</p>
              <p className="box-back-item">保管期限</p>
              <p className="box-back-item">{(record.valiPeriod || 'x') + '(年)'}</p>
              <p className="box-back-item box-back-footer has-border-bottom">&nbsp;</p>
            </div>
            <p style={{'pageBreakAfter': 'always'}}/>
          </div>
        );
        return arr;
      });

      return recordsDom(records, boxInfoList);
    }
    return (
      <div ref={superRef} style={{display: 'none'}}>
        {printType &&  (printType == 'PZ' ? loop(recordList) : loopOther(recordList, boxInfoList))}
      </div>
    );
  }
}

export default VoucherFrontCoverPrint;