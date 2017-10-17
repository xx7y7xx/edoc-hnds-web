/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import Topbar from '../../../components/topBar/Topbar'
import {Title} from '../../../components/Title'
import {Icon, Tooltip} from 'antd'
import CustomTable from '../../../components/customTable/CustomTable';
import {errorNotice} from '../../../components/Common';
import AttachmentDetail from './../attachmentDetail';

export default class AfterBookletList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      page: 1,
      size: 10,
      total: 0,
      loading: false,
      accountYear: '',
      accountMonth: '',
      categoryName: '',
      boxNum: 'N',
      isViewDetailing: false,
      fileId: '',
      expandedRowKeys: [],
      pageList: []
    }
    this.paramsRecord = this.props.params;
    // 设置列
    // 注意：表格内滚动时，列宽为必需值
    this.tableColumns = [{
      width: '20%',
      title: '题名',
      dataIndex: 'title',
      key: 'title',
    }, {
      width: '10%',
      title: '文号',
      dataIndex: 'fileNo',
      key: 'fileNo',
    }, {
      width: '10%',
      title: '关键词',
      dataIndex: 'keywords',
      key: 'keywords',
    }, {
      width: '15%',
      title: '摘要',
      dataIndex: 'abstracts',
      key: 'abstracts',
    }, {
      width: '8%',
      title: '责任人',
      dataIndex: 'owner',
      key: 'owner',
    }, {
      width: '10%',
      title: '所属日期',
      dataIndex: 'docDate',
      key: 'docDate',
    }, {
      width: '10%',
      title: '来源',
      dataIndex: 'srcType',
      key: 'srcType',
      render: (text, record) => {
        let level = {
          1: '接口同步',
          2: '手工采集',
        }
        return level[record.srcType];
      }
    }, {
      width: '9%',
      title: '存储形式',
      dataIndex: 'storeType',
      key: 'storeType',
      render: (text, record) => {
        let level = {
          1: '电子+纸质',
          2: '电子',
          3: '纸质',
        }
        return level[record.storeType];
      }
    }, {
      //最后一列宽度不要设置
      //width: '120px',
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record) => {
        return (
          <span>
            <Tooltip title="查看">
              <Icon type="eye-o" className="operate-icon" onClick={() => this.attachmentDetailFun(record)}/>&nbsp;
            </Tooltip>
          </span>
        )
      }
    }];
  }

  attachmentDetailFun = (record) => { //查看文件详情
    let fileId = record.id
    this.setState({
      fileId: fileId,
      isViewDetailing: true
    });
  }

  componentDidMount = () => {
    this.getBoxDetailFetch()
  }

  //高级搜索
  advanceSearch = (keyword) => {
    this.getRecordsFetch({
      keyword,
      page: 1,
    });
  }

  getBoxDetailFetch = () => {
    let successHandler = (response) => {
      let {datas, code, msg} = response;
      if (code == cKit.ResponseCode.SUCCESS_CODE) {

        this.setState({
          accountYear: datas.accountYear,
          accountMonth: datas.accountMonth,
          categoryName: datas.categoryName,
          boxNum: datas.boxNum
        })
        this.getRecordsFetch({
          page: 1,
          size: 10
        });
      } else {
        errorNotice(msg)
      }
    }
    let errorHandler = function (error) {
      errorNotice(error)
    }
    let url = cKit.makeUrl('/box/info/' + this.paramsRecord.boxId + '?current_org_id=' + this.paramsRecord.id);
    let action = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    action.submit();
  }

  getRecordsFetch = ({
    keyword = this.state.keyword,
    page = this.state.page,
    size = this.state.size
  }) => {
    //page最小为1
    page <= 0 && (page = 1);
    this.setState({
      loading: true,
      expandedRowKeys: [],
    });
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {total, pageList, page} = response.datas;
        this.setState({
          page,
          size,
          keyword,
          total,
          pageList,
          page
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/list';
    netKit.postFetch({
      url,
      data: {
        keyword,
        "condition": [
          {
            "boxId": this.paramsRecord.boxId
          }
        ]
      },
      param: {
        page,
        size,
        current_org_id: this.paramsRecord.id
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

  getSonRecordsFetch = ({reqParam, success}) => { //{pid}
    reqParam.current_org_id = this.paramsRecord.id;
    this.setState({
      loading: true
    });
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/children';
    netKit.getFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.setState({
          loading: false
        });
      }
    });
  }

  onExpand = (expanded, record, g) => {
    let sons = record.children;
    let id = record.id;
    let expandedRowKeys = this.state.expandedRowKeys;
    if (expanded) {
      expandedRowKeys.push(id);

      expanded && sons && sons.length <= 0 && this.getSonRecordsFetch({
        reqParam: {
          pid: id,
          current_org_id: this.paramsRecord.id
        },
        success: (datas) => {
          if (datas.length) {
            record.children = sons.concat(datas);
          } else {
            delete record.children;
            // this.toCollect(record.id)
          }
        }
      });
    } else {
      expandedRowKeys.splice(expandedRowKeys.indexOf(id), 1);
    }
    this.setState({expandedRowKeys});
  }

  pageChange = (page, size) => {
    this.getRecordsFetch({
      page,
      size,
      keyword: this.state.keyword
    });
    //清空上面操作
    this.setState({
      page,
      size,
    });
  }

  render() {
    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入题名、文号、关键字、摘要、责任人"}/>
        <div className="main-content main-content-animate">
          {Title()}
          <div className="booklet-table-box">
            <div className="booklet-table-top">
              <p style={{margin: 8}}>{this.state.accountYear}年{this.state.accountMonth}月/{this.state.categoryName}/第{this.state.boxNum}册</p>
            </div>
            <CustomTable
              rowKey={record => record.id}
              currentPage={this.state.page}
              loading={this.state.loading}
              dataSource={this.state.pageList}
              columns={this.tableColumns}
              total={this.state.total}
              onPageChange={this.pageChange}
              onExpand={this.onExpand}
              expandedRowKeys={this.state.expandedRowKeys}
            />
          </div>
          <AttachmentDetail
            visible={this.state.isViewDetailing}
            orgId={this.paramsRecord.id}
            fileId={this.state.fileId}
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