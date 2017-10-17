import React from 'react'
import cKit from '../../utils/base/coreKit'
import netKit from '../../utils/base/networkKit'
import {Tooltip, Icon} from 'antd';
import Topbar from '../../components/topBar/Topbar'
import { Title } from '../../components/Title'

import '../../less/common.less'

import {errorNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable';

import AttachmentDetail from '../../pages/archivesManager/attachmentDetail';

export default class UserCollection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,

      page: 1,
      size: 10,
      total: 0,
      pageList: [],

      record: {},

      //高级搜索
      keyword: '',

      isViewDetailing: false,
    }

    this.columns = [{
      width: '15%',
      title: '单位',
      dataIndex: 'orgName',
      key: 'orgName',
    }, {
      width: '15%',
      title: '目录分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
    }, {
      width: '15%',
      title: '档号',
      dataIndex: 'docNo',
      key: 'docNo',
    }, {
      width: '15%',
      title: '题名',
      dataIndex: 'title',
      key: 'title',
    }, {
      width: '15%',
      title: '文号',
      dataIndex: 'fileNo',
      key: 'fileNo',
    }, {
      title: '操作',
      render: (text, record) => {
        let title, type;
        if(record.isNoFavorite){
          title = '收藏';
          type = 'heart-o';
        } else {
          title = '取消收藏';
          type = 'heart';
        }
        return (
          <span>
            <Tooltip onClick={() => this.viewFavorite(record)} title="查看">
              <Icon type="eye-o" className="operate-icon" />
            </Tooltip>&nbsp;
            <Tooltip onClick={() => this.changeFavorite(record)} title={title}>
              <Icon type={type} className="dangerous-icon"/>
            </Tooltip>&nbsp;
          </span>
        );
      }
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

  viewFavorite = (record) => {
    this.setState({
      record,
      isViewDetailing: true,
    });
  }

  changeFavorite = (record) => {
    let flag = record.isNoFavorite;
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        record.isNoFavorite = !flag;
        this.setState({
          pageList: this.state.pageList
        });
      }else {
        errorNotice(response.msg);
      }
    };

    let url = flag ? '/favorite/add' : '/favorite/cancel';
    netKit.postFetch({
      url,
      data: {
        fileId: record.fileId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

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

    let url = '/favorite/list';
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
    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch}/>
        <div className="main-content main-content-animate">
          { Title() }
          <CustomTable
            total={this.state.total}
            currentPage={this.state.page}
            currentSize={this.state.size}
            loading={this.state.loading}
            dataSource={this.state.pageList}
            columns={this.columns}
            onPageChange={this.pageChange}
          />

          <AttachmentDetail
            visible={this.state.isViewDetailing}
            orgId={this.state.record.orgId}
            fileId={this.state.record.fileId}
            onClose={() => {
              this.setState({
                isViewDetailing: false
              })
            }}
          />
        </div>
      </div>
    )
  }
}