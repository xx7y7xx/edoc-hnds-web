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
import {Button, Icon, Tooltip, Tabs} from 'antd';
import browserHistory from '../../libs/browserHistory';
import '../../less/common.less';
import '../../less/accessManager.less';
import {errorNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable';
import { approveStatusObj } from '../../utils/common/commonOptions';
import AddAccessApply from './addAccessApply';
import EditAccessApply from './editAccessApply';

const TabPane = Tabs.TabPane;

class AccessApply extends React.Component {
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

      //当前记录
      record: {},
      //新增申请
      isAdding: false,
      //查看详情
      isViewing: false,
      //详情是否只读
      isView: true,
      //是否可以进入档案查阅 是否有审批通过的申请
      canViewRecord: false,
    }

    // 设置列
    this.columns = [{
      width: '15%',
      title: '申请单号',
      dataIndex: 'billCode',
      key: 'billCode',
    }, {
      width: '13%',
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate'
    }, {
      width: '22%',
      title: '查阅日期',
      render: (text, record) => (
        record.consultBeginDate + '-' + record.consultEndDate
      )
    }, {
      width: '15%',
      title: '申请原因',
      dataIndex: 'consultReason',
      key: 'consultReason',
    }, {
      width: '10%',
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        approveStatusObj[record.status]
      )
    }, {
      width: '15%',
      title: '审批意见',
      dataIndex: 'approveNote',
      key: 'approveNote',
    }, {
      //最后一列宽度不要设置
      //width: '15%',
      title: '操作',
      render:
        (text,record) => (
          this.state.activeKey == '30' ?
          <Tooltip onClick={() => this.editApply(record)} title="编辑">
            <Icon type="edit" className="operate-icon" />
          </Tooltip>
          :
          <Tooltip onClick={() => this.viewApply(record)} title="查看">
            <Icon type="eye-o" className="operate-icon" />
          </Tooltip>
        ),
    }];
  }

  componentDidMount() {
    this.getRecordsFetch({});
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
      page: 1,
      activeKey,
    });
  }

  editApply = (record) => {
    this.setState({
      record,
      isViewing: true,
      isView: false,
    });
  }

  viewApply = (record) => {
    this.setState({
      record,
      isViewing: true,
      isView: true,
    });
  }

  addRecord = () => {
    this.setState({
      isAdding: true,
    });
  }
  addOrEidtSuccess = () => {
    this.operateCancel();
    this.getRecordsFetch({});
  }

  operateCancel = () => {
    this.setState({
      isAdding: false,
      isViewing: false,
    });
  }

  recordConsult = () => {
    browserHistory.push('/archiveAccess');
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
          canViewRecord:  oResult.isHasApproved == 'Y'
        });
      }else {
        errorNotice(response.msg);
      }
    };

    let url = '/consult/applylist';
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
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入申请单号、申请原因"}/>
        <div className="main-content main-content-animate">
          { Title() }
          <Tabs
            className="access-apply-tabs"
            activeKey={this.state.activeKey}
            size="small"
            onChange={this.tabChange}
          >
            <TabPane tab="待审批" key="10" />
            <TabPane tab="审批通过" key="20" />
            <TabPane tab="驳回" key="30" />
            <TabPane tab="过期" key="40" />
          </Tabs>
          <CustomTable
            currentPage={this.state.page}
            rowKey={record => record.id}
            loading={this.state.loading}
            dataSource={this.state.pageList}
            columns={this.columns}
            total={this.state.total}
            onPageChange= {this.pageChange}
            leftBottom={
              <div>
                <Button icon="plus" onClick={this.addRecord} type="primary">查阅申请</Button>
                <Button
                  disabled={!this.state.canViewRecord}
                  icon="eye-o"
                  onClick={this.recordConsult}
                  type="primary"
                >
                  档案查阅
                </Button>
              </div>
            }
          />
          <AddAccessApply
            visible={this.state.isAdding}
            onCancel={this.operateCancel}
            success={this.addOrEidtSuccess}
          />
          <EditAccessApply
            record = {this.state.record}
            visible={this.state.isViewing}
            onCancel={this.operateCancel}
            isView={this.state.isView}
            success={this.addOrEidtSuccess}
          />
        </div>
      </div>
    )
  }
}

export default AccessApply;