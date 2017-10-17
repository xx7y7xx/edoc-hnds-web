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
import {Button, TreeSelect, Spin} from 'antd'
import {notice, errorNotice} from '../../../components/Common';
import CardList from '../cardsList'

import pKit from '../../../utils/base/permissionKit'

const TreeNode = TreeSelect.TreeNode;

export default class AfterBooklet extends React.Component {
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
      voucherRecord: {}
    }
    this.currentOrgId = this.props.params.id;
  }

  componentDidMount = () => {
    this.getLeftTreeSelectData()
  }

  componentDidUpdate = () => {
  }

  getLeftTreeSelectData = () => { // 获取左侧树的数据
    let reqParam = {
      "condition": [
        {
          "status": 20
        },
        {
          "isAppendCategory": true
        },
        {
          "isMonthAsc" : false
        }
      ]
    };

    this.subSelectFecth({
      reqParam,
      success: (datas) => {
        this.setState({
          treeData: datas
        })
        this.getTreeDefaultExpandedKeys(datas);
      }
    });
  }

  getTreeDefaultExpandedKeys = (treeData) => { //得到默认展开的月的节点数据
    if (treeData.length <= 0) {
      this.setState({
        treeSelectValue: '',
        recordList: []
      })
      return;
    }
    let categoryId = treeData[0].children[0].children[0].id;
    let name = treeData[0].children[0].children[0].name;
    let accountYear = treeData[0].name;
    let accountMonth = treeData[0].children[0].name;
    let defaultValue = accountYear + '-' + accountMonth + '-' + name + '-' + categoryId;
    let treeSelectValue = accountYear + '-' + accountMonth + '-' + name;
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
    this.setState({
      defaultValue: defaultValue,
      treeSelectValue: treeSelectValue,
      reqParam: reqParam
    });

    this.getRecordsFetch({ // 获取文件列表
      page: 1,
      reqParam
    });
  }

  getRecordsFetch = ({
    keyword = this.state.keyword,
    page = this.state.page,
    size = this.state.size,
    reqParam = this.state.reqParam
  }) => {
    //page最小为1
    page <= 0 && (page = 1);

    reqParam.keyword = keyword;

    this.setState({
      loading: true
    });
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {total, pageList, page} = response.datas;
        this.setState({
          page,
          size,
          keyword,
          total,
          recordList: pageList,
          page
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

  //高级搜索
  advanceSearch = (keyword) => {
    this.getRecordsFetch({
      keyword,
      page: 1,
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

  beforeBooklet = () => {
    browserHistory.push('/arrange/beforeBooklet/' + this.currentOrgId);
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
    let accountYear = treeNode.props.value.split("-")[0];
    let accountMonth = treeNode.props.value.split("-")[1];
    let reqParam = {accountYear: accountYear, accountMonth: accountMonth, current_org_id: this.currentOrgId}
    return new Promise((resolve) => {
      treeData.forEach((item) => {
        item.children.forEach((childrenItem) => {
          if (childrenItem.id == eventKey && childrenItem.children.length <= 0) {
            this.setState({
              eventKey: eventKey
            });
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
          return;
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

  fileUnpacking = (e, yearMonth, object) => {
    let accountYear = yearMonth.split("-")[0];
    let accountMonth = yearMonth.split("-")[1];
    let reqParam = {
      "condition": [
        {
          "accountYear": accountYear
        },
        {
          "accountMonth": accountMonth
        },
        {
          "categoryId": object.id
        }
      ]
    };

    CustomModal.confirm({
      title: '温馨提示',
      content: object.rootCategoryPrefix === 'QT' ?
        accountYear + '年' + accountMonth + '月的 ' + object.categoryName + ' 将拆册' :
        accountYear + '年' + accountMonth + '月的 会计凭证、会计账簿、会计报表 将一并拆册',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.fileUnpackingFetch({
          reqParam,
          success: (datas) => {
            notice('已成功拆册' + accountYear + '年' + accountMonth + '月的' + object.categoryName +'目录')
            this.getLeftTreeSelectData();
          }
        });
      }
    });
  }

  fileUnpackingFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/unpacking';
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
    const monthTreeNodeTitle = (name, index, indexYear, id) => {
      return <span>
              {this.state.eventKey == id && <Spin size="small"/>}&nbsp;
        {name}
             </span>
    }

    const dataTreeNodeTitle = (object, index, yearMonth, monthIndex) => {
      return <span>
              {object.categoryName}&nbsp;&nbsp;&nbsp;&nbsp;
              {
                ((object.prefix == 'PZ' && monthIndex == 0 && object.oprtStatus == 10)
                  ||
                (object.prefix == 'BB' && monthIndex == 0 && object.oprtStatus == 10)
                  ||
                (object.prefix == 'ZB' && monthIndex == 0 && object.oprtStatus == 10)
                  ||
                (object.rootCategoryPrefix == 'QT' && monthIndex == 0 && object.oprtStatus == 10))
                &&
                pKit.hasPermission('REC_ARRANGE_UNSETVOLUME')
                &&
                <Button size="small"
                style={{height: 24}}
                onClick={(e) => this.fileUnpacking(e,yearMonth, object)}
                >拆册</Button>
              }
             </span>
    }

    let value = '';
    const getDataList = (data, value, monthIndex) => data.map((dataItem, index) => {
      let dataValue = value + ('-' + dataItem.name);
      if (dataItem.children && dataItem.children.length > 0) {
        return <TreeNode value={dataValue} title={dataTreeNodeTitle(dataItem.object, index, value, monthIndex)}
                         key={dataValue + '-' + dataItem.id}>{getDataList(dataItem.children, dataValue, monthIndex) }</TreeNode>
      }
      return <TreeNode className="last-node" value={dataValue}
                       title={dataTreeNodeTitle(dataItem.object, index, value, monthIndex)}
                       key={dataValue + '-' + dataItem.id} isLeaf={true}/>
    })

    const getMonthList = (data, indexYear, yearName) => data.map((monthItem, index) => {
      value = yearName + '-' + monthItem.name;
      return <TreeNode value={value} title={monthTreeNodeTitle(monthItem.name, index, indexYear, monthItem.id)} key={monthItem.id + ''}>
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
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入册号、凭证类型"}/>
        <div className="main-content main-content-animate"
             style={{height: main_content_H, overflowY: 'auto'}}
             onScroll={this.appendRecordList}
             ref={(node) => this.contentDom = node}
        >
          {Title()}
          <div className="booklet-table-box">
            <div className="booklet-table-top">
              <TreeSelect
                className="common-archive-tree-select"
                value={this.state.treeSelectValue}
                treeDefaultExpandedKeys={[this.state.defaultValue]}
                style={{width: 230}}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                treeNodeLabelProp='value'
                onSelect={this.onSelect}
                loadData={this.onLoadData}
                notFoundContent={'暂无已裝册数据'}
              >
                {treeNodes}
              </TreeSelect>
              <span className="booklet-tab-box">
                <span onClick={this.beforeBooklet}>待装册</span>
                <span className="booklet-tab-check-btn">已裝册</span>
              </span>
            </div>
            <div className="booklet-content-box clearFloat">
              {
                this.state.recordList.length <= 0 ?
                <div className="notFound"><i className="anticon anticon-frown-o"/>&nbsp;暂无数据</div>
                :
                <CardList
                  openUrl={'/arrange/afterBooklet/list/'}
                  currentOrgId={this.currentOrgId}
                  cardList={this.state.recordList}
                />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}