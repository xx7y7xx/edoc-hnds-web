import React from 'react'
import cKit from '../utils/base/coreKit'
import netKit from '../utils/base/networkKit'
import Topbar from '../components/topBar/Topbar'
import { Title } from '../components/Title'

import '../less/common.less'
import '../less/logSearch.less'
import {notice, errorNotice} from '../components/Common';
import CustomTable from '../components/customTable/CustomTable'

export default class LogSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      sortedInfo: null,

      page: 1,
      size: 10,
      total: 0,

      search: {},
      pageList: [],
      record: {},

      //高级搜索
      keyword: '',
      level: {
        1: '正常',
        2: '警告',
        3: '严重'
      },
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

  // listHeaderChange = (pagination, filters, sorter) => {
  //   this.setState({
  //     sortedInfo: sorter
  //   });
  // }

  pageChange = (page, size) => {
    this.getRecordsFetch({
      page,
      size,
    });
  }

  getRecordsFetch = ({
    keyword = this.state.keyword,
    page = this.state.page,
    size = this.state.size
  }) => {

    page <= 0 && (page  = 1);
    this.setState({
      loading: true
    });

    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {total, pageList} = response.datas;
        console.log()
        this.setState({
          page,
          size,
          keyword,
          total,
          pageList,
        });
      }else {
        errorNotice(response.msg);
      }
    };

    let url = '/log/list';
    netKit.postFetch({
      url,
      data: {keyword},
      param: {page, size},
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
      let { sortedInfo } = this.state;
      sortedInfo = sortedInfo || {};
      // 设置列
      // 注意：表格内滚动时，列宽为必需值
      const columns = [{
        width: '30%',
        title: '日志时间',
        dataIndex: 'createTime',
        key: 'createTime',
        // sorter: function(a, b){
        //   var num = 1;
        //   a.createTime < b.createTime && (num = -1);
        //   return num;
        // },
        // sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order,
      }, {
        width: '35%',
        title: '日志内容',
        dataIndex: 'content',
        key: 'content',
        // sorter: function(a, b){
        //   var num = 1;
        //   a.content < b.content && (num = -1);
        //   return num;
        // },
        // sortOrder: sortedInfo.columnKey === 'content' && sortedInfo.order,
      }, {
        width: '20%',
        title: '日志类型',
        dataIndex: 'type',
        key: 'type',
      }, {
        title: '日志级别',
        dataIndex: 'level',
        key: 'level',
        render: (text, record) => (
          <span>{this.state.level[record.level]}</span>
        )
      }];

      // 设置行选择
      const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        onSelect: (record, selected, selectedRows) => {
          //console.log(record, selected, selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          //console.log(selected, selectedRows, changeRows);
        },
        getCheckboxProps: record => ({
          //disabled: record.name === 'Disabled User'
        }),
      };

      return (
          <div>
              <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入日志内容"}/>
              <div className="main-content main-content-animate">
                { Title() }
                <CustomTable
                  total={this.state.total}
                  currentPage={this.state.page}
                  currentSize={this.state.size}
                  loading={this.state.loading}
                  dataSource={this.state.pageList}
                  columns={columns}
                  onTableChange={this.listHeaderChange}
                  onPageChange={this.pageChange}
                />
          </div>
        </div>
      )
  }
}