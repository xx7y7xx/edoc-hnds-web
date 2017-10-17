/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import browserHistory from '../../../libs/browserHistory'
import Topbar from '../../../components/topBar/Topbar'
import CustomModal from '../../../components/customModal/CustomModal';
import {Title} from '../../../components/Title'
import {Button, TreeSelect, Spin, Progress} from 'antd'
import {notice, errorNotice} from '../../../components/Common';
import CardList from '../cardsList'
import pKit from '../../../utils/base/permissionKit'
const TreeNode = TreeSelect.TreeNode;

export default class BeforeArchive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      page: 1,
      size: 16,
      recordList: [],
      total: 0,
      loading: false,
      treeData: [],
      eventKey: '',
      reqParam: {},
      defaultValue: '',
      treeSelectValue: '',
      voucherRecord: {},
      progressModalVisible: false,
      percent: 0, // 进度%,
      ifShowProgressModalBtn: 'none',
      progressStatus: 'active',
      progressModalCardTitle: ''
    }
    this.currentOrgId = this.props.params.id;
    this.timeout = null;
  }

  componentDidMount = () => {
    this.getLeftTreeSelectData()
  }

  componentDidUpdate = () => {
  }

  getLeftTreeSelectData = (total) => { // 获取左侧树的数据
    let reqParam = {
      condition: [{
        status: 20
      }, {
        isAppendCategory: true
      }]
    };

    this.subSelectFecth({
      reqParam,
      success: (datas) => {
        this.setState({
          treeData: datas
        })
        this.getTreeDefaultExpandedKeys(datas, !!total);
      }
    });
  }

  getTreeDefaultExpandedKeys = (treeData, notGetStatus) => { //得到默认展开的月的节点数据
    if (treeData.length <= 0) {
      this.setState({
        treeSelectValue: '',
        recordList: []
      })
      return;
    }
    let first = treeData[0];
    let json = first.children[0].children[0];
    let categoryId = json.id;
    let name = json.name;
    let accountYear = first.name;
    let accountMonth = first.children[0].name;
    let treeSelectValue = accountYear + '-' + accountMonth + '-' + name;
    let defaultValue = treeSelectValue + '-' + categoryId;
    let reqParam = {
      condition: [{
        status: 20
      }, {
        accountYear
      }, {
        accountMonth
      }, {
        categoryId
      }]
    };
    this.setState({
      defaultValue,
      treeSelectValue,
      reqParam,
    });

    this.getRecordsFetch({ // 获取文件列表
      page: 1,
      reqParam
    });
    if (!notGetStatus) {
      this.fileArchivingStatus(accountYear, accountMonth)
    }
  }

  getRecordsFetch = ({
    keyword = this.state.keyword,
    page = this.state.page,
    size = this.state.size,
    reqParam =this.state.reqParam
  }) => {
    //page最小为1
    page <= 0 && (page = 1);

    reqParam.keyword = keyword;

    this.setState({
      loading: true,
      expandedRowKeys: []
    });
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {total, pageList} = response.datas;
        this.setState({
          page,
          size,
          keyword,
          total,
          recordList: pageList,
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/box/list';
    netKit.postFetch({
      url,
      data: reqParam,
      param: {
        page,
        size,
        current_org_id: this.currentOrgId
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

  fileArchivingStatus = (accountYear, accountMonth) => {  // 归档状态查询
    this.fileArchivingStatusFecth({
      reqParam: {accountYear, accountMonth},
      success: (datas) => {
        let total = datas && datas.total;
        if (total > 0) {
          this.setState({
            progressModalVisible: true,
            ifShowProgressModalBtn: 'block',
            percent: 100,
            progressModalCardTitle: '归档完成'
          });
          notice('已成功对' + accountYear + '年' + accountMonth + '月的档案资料进行归档')
          this.getLeftTreeSelectData(total)
        }
      },
      loading: (datas) => {
        let total = datas.total;
        if (total > 0) {
          let success = datas.success;
          this.setState({
            percent: parseInt(success / total * 100),
            progressModalVisible: true,
          });

          clearTimeout(this.timeout);
          this.timeout = setTimeout(() => {
            this.fileArchivingStatus(accountYear, accountMonth);
          }, 2000);
        }
      }
    });
  }

  fileArchivingStatusFecth = ({reqParam, success, loading}) => {
    //let {accountYear, accountMonth} = reqParam;
    let successHandler = (response) => {
      let {code, datas} = response;
      if (code == cKit.ResponseCode.SUCCESS_CODE) {  // 代表归档成功
        let datas = response.datas;
        success && success(datas);
      } else if (code == '7001') {  //  代表正在有数据进行归档中
        loading && loading(datas);
      } else if(code == '7002') {
        errorNotice(response.msg);
        this.setState({
          ifShowProgressModalBtn: 'block',
          percent: parseInt(datas.success / datas.total * 100),
          progressStatus: 'exception'
        });
      } else {
        errorNotice(response.msg);
        this.setState({
          ifShowProgressModalBtn: 'block',
          progressStatus: 'exception'
        });
      }
    };

    let url = '/file/archiving/status';
    netKit.postFetch({
      url,
      data: reqParam,
      param: {
        current_org_id: this.currentOrgId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  //高级搜索
  advanceSearch = (keyword) => {
    // if (this.state.recordList.length <= 0) {
    //   return;
    // }
    this.getRecordsFetch({
      keyword,
      page: 1
    })
  }

  subSelectFecth = ({reqParam, success}) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/timetree';
    netKit.postFetch({
      url,
      data: reqParam,
      param: {
        current_org_id: this.currentOrgId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  afterArchive = () => {
    browserHistory.push('/archive/afterArchive/' + this.currentOrgId);
  }

  onSelect = (value, node, extra) => {
    let isLeaf = node.props.isLeaf;
    let eventKey = node.props.eventKey;
    let eventKeyArr = eventKey.split("-");
    let categoryId = eventKeyArr[eventKeyArr.length - 1];
    let accountYear = value.split("-")[0];
    let accountMonth = value.split("-")[1];
    let categoryName = value.split("-")[value.split("-").length - 1];
    let reqParam = {
      "condition": [
        {
          "status": 20
        },
        {
          "accountYear": accountYear
        },
        {
          "accountMonth": accountMonth
        },
        {
          "categoryId": categoryId
        }
      ]
    };

    if (isLeaf) {
      this.setState({
        treeSelectValue: value,
        fileBaseData: {
          current_org_id: this.currentOrgId,
          categoryId,
          accountYear,
          accountMonth,
          categoryName
        },
        reqParam,
        expandedRowKeys: []
      });

      this.getRecordsFetch({ // 获取文件列表
        reqParam,
      });
    }
  }

  onLoadData = (treeNode) => {  // 左侧树 懒加载
    let eventKey = treeNode.props.eventKey
    let treeData = this.state.treeData;
    let [accountYear, accountMonth] = treeNode.props.value.split('-');
    let reqParam = {
      accountYear,
      accountMonth,
      current_org_id: this.currentOrgId
    };
    return new Promise((resolve) => {
      treeData.forEach((item) => {
        item.children.forEach((childrenItem) => {
          if (childrenItem.id == eventKey && childrenItem.children.length <= 0) {
            this.setState({eventKey});
            this.getCategoryOrgCachetreeFecth({
              reqParam,
              success: (datas) => {
                childrenItem.children = datas;
                this.setState({
                  eventKey: ''
                });
              }
            })
          }
        })
      })
    });
  }

  getCategoryOrgCachetreeFecth = ({reqParam, success}) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/category/org/cachetree';
    netKit.getFetch({
      url,
      data: reqParam,
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

  fileArchiving = (e, yearMonth) => {
    let accountYear = yearMonth.split("-")[0];
    let accountMonth = yearMonth.split("-")[1];
    CustomModal.confirm({
      title: '温馨提示',
      content: '是否对' + accountYear + '年' + accountMonth + '月的档案资料进行归档',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.fileArchivingFetch({
          reqParam: {accountYear, accountMonth},
          success: (datas) => {
            this.setState({
              progressModalVisible: true
            });
            this.fileArchivingStatus(accountYear, accountMonth)
          }
        });
      }
    });
  }

  fileArchivingFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/archiving';
    netKit.postFetch({
      url,
      data: reqParam,
      param: {
        current_org_id: this.currentOrgId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

progressModalBtn = () => {
    this.setState({
      progressModalVisible: false,
      ifShowProgressModalBtn: 'none',
      percent: 0,
      progressModalCardTitle: '归档中...'
    });
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  appendRecordList = () => {
    const contentDom = this.contentDom;
    const scorllTop = contentDom.scrollTop;
    const scorllHeight = contentDom.scrollHeight;
    const clientHeight = contentDom.clientHeight;
    if (clientHeight + scorllTop == scorllHeight) {
      let currentSize = this.state.size;
      let total = this.state.total;
      if (currentSize >= total) {
        this.setState({
          finish: true
        })
      } else {
        this.setState({
          size: currentSize + 10,
          loading: true
        })
        this.getRecordsFetch({ // 获取文件列表
          page: 1,
          size: currentSize + 10,
        });
      }
    }
  }

  render() {
    const monthTreeNodeTitle = (name, index, indexYear, id, yearMonth) => {
      return <span>
              {this.state.eventKey == id && <Spin size="small"/>}&nbsp;
        {name}
        {
          index == 0
          &&
          pKit.hasPermission('REC_ARCHIVE_ARCHIVE')
          &&
          <Button size="small"
            style={{height: 24,
              position: 'absolute',
              marginLeft: 30,
              marginTop: -3
            }}
            onClick={(e) => this.fileArchiving(e, yearMonth)}
          >一键归档</Button>
        }
             </span>
    }

    let value = '';
    const getDataList = (data, value, monthIndex) => data.map((dataItem, index) => {
      let dataValue = value + ('-' + dataItem.name);
      if (dataItem.children && dataItem.children.length > 0) {
        return <TreeNode value={dataValue} title={dataItem.name}
                         key={dataValue + '-' + dataItem.id}>{getDataList(dataItem.children, dataValue) }</TreeNode>
      }
      return <TreeNode className="last-node" value={dataValue} title={dataItem.name} key={dataValue + '-' + dataItem.id}
                       isLeaf={true}/>
    })

    const getMonthList = (data, indexYear, yearName) => data.map((monthItem, index) => {
      value = yearName + '-' + monthItem.name;
      return <TreeNode value={value} title={monthTreeNodeTitle(monthItem.name, index, indexYear, monthItem.id, value)}
                       key={monthItem.id + ''}>
        { getDataList(monthItem.children, value, index) }
      </TreeNode>
    })


    const getYeartList = (data) => data.map((yearItem, index) => {
      return <TreeNode value={yearItem.name} title={yearItem.name} key={yearItem.id + ''}>
        { getMonthList(yearItem.children, index, yearItem.name) }
      </TreeNode>
    })
    const treeNodes = getYeartList(this.state.treeData);
    const main_content_H = document.documentElement.clientHeight - 76;
    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入单位名称、全宗号"}/>
        <div>
          <div className="main-content main-content-animate"
               style={{height: main_content_H, overflowY: 'auto'}}
               onScroll={this.appendRecordList}
               ref={(node) => this.contentDom = node}
          >
            {Title()}
            <div className="booklet-table-box">
              <div className="booklet-table-top">
                <TreeSelect
                  key={this.state.defaultValue}
                  className="tree-select common-archive-tree-select"
                  value={this.state.treeSelectValue}
                  treeDefaultExpandedKeys={[this.state.defaultValue]}
                  style={{width: 230}}
                  dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                  treeNodeLabelProp='value'
                  onSelect={this.onSelect}
                  loadData={this.onLoadData}
                  notFoundContent={'暂无待归档数据'}
                >
                  {treeNodes}
                </TreeSelect>
                <span className="booklet-tab-box">
                <span className="booklet-tab-check-btn">待归档</span>
                <span onClick={this.afterArchive}>已归档</span>
              </span>
              </div>
              <div className="booklet-content-box clearFloat">
                {
                  this.state.recordList.length <= 0 ?
                    <div className="notFound"><i className="anticon anticon-frown-o"/>&nbsp;暂无数据</div>
                    :
                    <CardList
                      openUrl={'/archive/beforeArchive/list/'}
                      currentOrgId={this.currentOrgId}
                      cardList={this.state.recordList}
                    />
                }
              </div>
            </div>
          </div>
          {
            this.state.progressModalVisible
            &&
            <div className="progress-modal">
              <div className="progress-modal-bg"/>
              <div className="progress-modal-card">
                <div className="progress-modal-card-title">{this.state.progressModalCardTitle}</div>
                <Progress
                  className="progress-modal-progress"
                  percent={this.state.percent}
                  status={this.state.progressStatus}
                  type="circle"/>
                <div className="progress-modal-btn" style={{display: this.state.ifShowProgressModalBtn}}>
                  <Button onClick={this.progressModalBtn}>确定</Button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}