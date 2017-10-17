/**
 * Created by APP on 2017/6/20.

 * last update
 * zhaolongwei
 */
import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import Topbar from '../../components/topBar/Topbar';
import { Title } from '../../components/Title';
import {Icon, Tooltip,Tabs} from 'antd';
import { approveStatusObj, turnoverTypeObj } from '../../utils/common/commonOptions';
import '../../less/common.less';
import '../../less/followupManager.less';
import {errorNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable';

import EditTransferApproval from './editTransferApproval';

const TabPane = Tabs.TabPane;

class ArchiveTransfer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,

      total: 0,
      page: 1,
      size: 10,
      keyword: '',
      pageList: [],
      activeKey: '10',

      record: {},
      isViewing: false,
      isView: true,

      isViewListing: false,
    }

    this.orgId = this.props.params.id;

    // 设置列
    this.columns = [{
      width: '20%',
      title: '申请单号',
      dataIndex: 'billCode',
      key: 'billCode',
    }, {
      width: '12%',
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate'
    }, {
      width: '9%',
      title: '姓名',
      dataIndex: 'receiver',
      key: 'userName',
    }, {
      width: '10%',
      title: '部门',
      dataIndex: 'receiveDept',
      key: 'receiveDept',
    },  {
      width: '10%',
      title: '移交类型',
      dataIndex: 'turnoverType',
      key: 'turnoverType',
      render: (text, record) => (
        turnoverTypeObj[record.turnoverType]
      )
    }, {
      width: '10%',
      title: '移交原因',
      dataIndex: 'reason',
      key: 'reason',
    }, {
      width: '10%',
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        approveStatusObj[record.status]
      )
    }, {
      width: '10%',
      title: '审批意见',
      dataIndex: 'comments',
      key: 'comments',
    }, {
      //最后一列宽度不要设置
      //width: '15%',
      title: '操作',
      render:
        (text,record) => (
          <div>
            <Tooltip onClick={() => this.viewApply(record)} title="查看">
              <Icon type="eye-o" className="operate-icon" />
            </Tooltip>
          </div>
        ),
    }];
  }

  componentDidMount() {
    this.getRecordsFetch({
      page: 1
    });
  }

  //高级搜索
  advanceSearch = (keyword) => {
    this.getRecordsFetch({
      keyword,
      page: 1,
    });
  }

  tabChange = (activeKey) => {
    this.getRecordsFetch({
      activeKey,
      page: 1,
    });
  }

  operateCancel = () => {
    this.setState({
      isViewing: false,
    });
  }
  operateSuccess = () => {
    this.operateCancel();
    this.getRecordsFetch({});
  }

  viewApply = (record) => {
    this.setState({
      record,
      isViewing: true,
      isView: record.status != '10',
    });
  }

  editApply = (record) => {
    this.setState({
      record,
      isViewing: true,
      isView: false,
    });
  }

  viewDetail = (record) => {

  }

  exportApply = () => {
  }

  pageChange = (page, size) => {
    this.getRecordsFetch({page, size});
  }

  getRecordsFetch = ({
    keyword = this.state.keyword,
    activeKey = this.state.activeKey,
    page = this.state.page,
    size = this.state.size
  }) => {
    //page最小为1
    page <= 0 && (page  = 1);
    this.setState({
      loading: true,
      activeKey,
    });

    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let oResult = response.datas;
        this.setState({
          page,
          size,
          keyword,
          total: oResult.total,
          pageList: oResult.pageList,
        });
      }else {
        errorNotice(response.msg);
      }
    };

    let url = '/turnover/list';
    netKit.postFetch({
      url,
      data: {
        keyword,
        condition : [{
          status: Number(activeKey)
        }]
      },
      param: {
        page,
        size,
      },
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.setState({
          loading: false
        });
      }
    });
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  render() {

    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入移交原因"}/>
        <div className="main-content main-content-animate">
          { Title() }
          <Tabs
            className="archive-transfer-tabs"
            activeKey={this.state.activeKey}
            size="small"
            onChange={this.tabChange}
          >
            <TabPane tab="待审批" key="10" />
            <TabPane tab="审批通过" key="20" />
            <TabPane tab="驳回" key="30" />
          </Tabs>
          <CustomTable
            currentPage={this.state.page}
            loading={this.state.loading}
            dataSource={this.state.pageList}
            columns={this.columns}
            total={this.state.total}
            onPageChange= {this.pageChange}
          />

          <EditTransferApproval
            record = {this.state.record}
            visible={this.state.isViewing}
            onCancel={this.operateCancel}
            isView={this.state.isView}
            success={this.operateSuccess}
          />
        </div>
      </div>
    )
  }
}

export default ArchiveTransfer;