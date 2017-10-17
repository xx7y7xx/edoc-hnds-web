/**
 * Created by APP on 2017/6/20.
 */
import React from 'react'
import {Icon, Tooltip, Button} from 'antd'
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit'
import Topbar from '../../components/topBar/Topbar'
import {Title} from '../../components/Title'
import {notice, errorNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable'
import DigitalSignatureCreate from './digitalSignatureCreate'
import DigitalSignatureDetail from './digitalSignatureDetail'

export default class LogSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      page: 1,
      size: 10,
      total: 0,
      search: {},
      pageList: [],
      record: {},
      //高级搜索
      keyword: '',
      createVisible: false,
      detailVisible: false,
      signRecord: {}
    }
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

  pageChange = (page, size) => {
    this.getRecordsFetch({
      page,
      size,
    });
  }

  getRecordsFetch = ({keyword = this.state.keyword, page = this.state.page, size = this.state.size}) => {
    page <= 0 && (page = 1);
    this.setState({
      loading: true
    });

    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {total, pageList} = response.datas;
        console.log()
        this.setState({
          page,
          size,
          keyword,
          total,
          pageList,
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/configsign/record/list';
    netKit.getFetch({
      url,
      data: {page, size, keyword},
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

  signServiceCreate = () => {
    this.getConfigSignRecord()
  }

  getConfigSignRecord = () => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let record = response.datas;
        this.setState({
          createVisible: true,
          signRecord: record
        })
      } else {
        errorNotice(response.msg);
      }
    };
    let url = '/configsign/record/display';
    netKit.getFetch({
      url,
      success: successHandler,
      error: this.errorHandler
    });
  }

  digitalSignatureDetail = (record) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let record = response.datas;
        this.setState({
          detailVisible: true,
          signRecord: record
        })
      } else {
        errorNotice(response.msg);
      }
    };
    let url = '/configsign/record/detail';
    netKit.getFetch({
      url,
      data: {
        id: record.id
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  onCancel = () => {
    this.setState({
      createVisible: false,
      detailVisible: false
    })
  }

  afterAddSubmit = () => {
    this.getRecordsFetch({
      page: 1
    })
    this.onCancel();
  }

  render() {
    // 设置列
    // 注意：表格内滚动时，列宽为必需值
    const columns = [{
      width: '20%',
      title: '开通时间',
      dataIndex: 'openedDate',
      key: 'openedDate'
    }, {
      width: '10%',
      title: '有效期',
      dataIndex: 'validateTime',
      key: 'validateTime',
      render: (text, record) => (
        <span>{text + '年'}</span>
      )
    }, {
      width: '20%',
      title: '停用时间',
      dataIndex: 'disableDate',
      key: 'disableDate',
    }, {
      width: '20%',
      title: '状态',
      dataIndex: 'isEnable',
      key: 'isEnable',
      render: (text, record) => (
        <span>{text === 'Y' ? '开通' : '停用'}</span>
      )
    }, {
      width: '20%',
      title: '开通人',
      dataIndex: 'openerName',
      key: 'openerName'
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record) => {
        return (
          <Tooltip title="查看">
            <Icon type="eye-o" className="operate-icon" onClick={() => this.digitalSignatureDetail(record)}/>
          </Tooltip>
        )
      }
    }];

    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入查询条件"}/>
        <div className="main-content main-content-animate">
          { Title() }
          <CustomTable
            total={this.state.total}
            currentPage={this.state.page}
            currentSize={this.state.size}
            loading={this.state.loading}
            dataSource={this.state.pageList}
            columns={columns}
            onPageChange={this.pageChange}
            leftBottom={
              <span>
                <Button
                  className="left-bottom-btn"
                  onClick={this.signServiceCreate}
                  type="primary"
                >开通签名</Button>
              </span>
            }
          />
          <DigitalSignatureCreate
            visible={this.state.createVisible}
            onCancel={this.onCancel}
            success={this.afterAddSubmit}
            signRecord={this.state.signRecord}
          />
          <DigitalSignatureDetail
            visible={this.state.detailVisible}
            onCancel={this.onCancel}
            signRecord={this.state.signRecord}
          />
        </div>
      </div>
    )
  }
}