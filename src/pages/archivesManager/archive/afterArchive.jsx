/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import browserHistory from '../../../libs/browserHistory'
import Topbar from '../../../components/topBar/Topbar'
import CustomModal from '../../../components/customModal/CustomModal';
import VoucherCoverPrint from '../../printPages/voucherCoverPrint'
import {Title} from '../../../components/Title'
import {Button, TreeSelect, Spin} from 'antd'
import {notice, errorNotice} from '../../../components/Common';
import CardList from '../cardsList'
import pKit from '../../../utils/base/permissionKit'
const TreeNode = TreeSelect.TreeNode;

export default class AfterArchive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      page: 1,
      size: 16,
      recordList: [],
      boxInfoList: [],

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

    this.fetchComplete = {};

    this.boxInfoList = [];
  }

  componentDidMount = () => {
    this.getLeftTreeSelectData()
  }

  componentDidUpdate = () => {
  }

  getLeftTreeSelectData = () => { // 获取左侧树的数据
    let reqParam = {
      condition: [{
        status: 30
      }, {
        isAppendCategory: true
      }, {
        isMonthAsc : false
      }]
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
      condition: [{
        status: 30
      }, {
        accountYear
      }, {
        accountMonth
      }, {
        categoryId
      }]
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

  beforeArchive = () => {
    browserHistory.push('/archive/beforeArchive/' + this.currentOrgId);
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
      condition: [{
        status: 30
      }, {
        accountYear
      }, {
        accountMonth
      }, {
        categoryId
      }]
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
    let [accountYear, accountMonth] = treeNode.props.value.split("-");
    let reqParam = {accountYear, accountMonth, current_org_id: this.currentOrgId}
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

  pageChange = (page, size) => {
    this.getRecordsFetch({
      page,
      size,
    });
  }

  fileUnarchiving = (e, yearMonth) => {
    let accountYear = yearMonth.split("-")[0];
    let accountMonth = yearMonth.split("-")[1];
    let reqParam = {
      "accountYear": accountYear,
      "accountMonth": accountMonth
    };

    CustomModal.confirm({
      title: '温馨提示',
      content: '是否对' + accountYear + '年' + accountMonth + '月的档案资料进行归档',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.fileUnarchivingFetch({
          reqParam,
          success: (datas) => {
            notice('已成功对' + accountYear + '年' + accountMonth + '月的档案资料进行归档')
            this.getLeftTreeSelectData();
          }
        });
      }
    });
  }

  fileUnarchivingFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/unarchiving';
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

  beforePrint = () => {
    let list = this.state.recordList;
    let first = list[0];
    if(first.rootCategoryPrefix == 'PZ'){
      this.print();
    } else {
      //记录请求完成数
      let num = 0;
      //记录发送请求数
      let i;
      this.boxInfoList = [];
      for (i = 0; i < list.length; i++) {
        let item = list[i];
        this.getFileListFetch(String(item.id), i, () => {
          //请求完成，记录加1
          num++;
          //请求的顺序与完成的顺序不一定一致
          if(num >= i){//当完成数不小于请求数时，说明最后一个请求完成
            this.setState({
              boxInfoList: this.boxInfoList
            }, () => {
              this.print();
            });
          }
        });
      }
    }
  }

  print = () => {
    let printContent = this.printContent.innerHTML;
    this.printIframe.contentDocument.body.innerHTML = printContent;
    this.printIframe.contentWindow.print();
  }

  getFileListFetch = (boxId, index, complete) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {pageList} = response.datas;
        //let boxInfoList = this.state.boxInfoList;
        //因为是异步请求，所以不能用push
        this.boxInfoList.push(pageList);
        //this.setState({boxInfoList});
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/list';
    netKit.postFetch({
      url,
      data: {
        keyword: '',
        condition: [{boxId}]
      },
      param: {
        page: 1,
        size: 100,
        current_org_id: this.currentOrgId
      },
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        complete && complete();
      }
    });
  }

  render() {
    const monthTreeNodeTitle = (name, index, indexYear, id, yearMonth) => {
      return <span>
              {this.state.eventKey == id && <Spin size="small"/>}&nbsp;
              {name}
              {index == 0
              &&
              pKit.hasPermission('REC_ARCHIVE_REARCHIVE')
              &&
              <Button size="small"
              style={{height: 24, position: 'absolute', marginLeft: 30, marginTop: -3}}
              onClick={(e) => this.fileUnarchiving(e, yearMonth)}>重新归档</Button>
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
      return <TreeNode className="last-node" value={dataValue} title={dataItem.name} key={dataValue + '-' + dataItem.id} isLeaf={true}/>
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
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入案卷号、册号、凭证类型"}/>
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
                className="common-archive-tree-select after-archive-tree-select"
                value={this.state.treeSelectValue}
                treeDefaultExpandedKeys={[this.state.defaultValue]}
                style={{width: 200}}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                treeNodeLabelProp='value'
                onSelect={this.onSelect}
                loadData={this.onLoadData}
                notFoundContent={'暂无已归档数据'}
              >
                {treeNodes}
              </TreeSelect>
              <Button
                disabled={this.state.recordList.length <= 0}
                icon={"printer"}
                className="voucher-cover-print-btn"
                onClick={this.beforePrint}
              >打印封面</Button>
              <span className="booklet-tab-box">
                <span onClick={this.beforeArchive}>待归档</span>
                <span className="booklet-tab-check-btn" >已归档</span>
              </span>
            </div>
            <div className="booklet-content-box clearFloat">
              {
                this.state.recordList.length <= 0 ?
                  <div className="notFound"><i className="anticon anticon-frown-o"/>&nbsp;暂无数据</div>
                  :
                  <CardList
                    openUrl={'/archive/afterArchive/list/'}
                    currentOrgId={this.currentOrgId}
                    cardList={this.state.recordList}
                  />
              }
            </div>
          </div>
        </div>
        <iframe src={'/print'} style={{display: 'none'}} ref={(node) => this.printIframe = node}/>
        <VoucherCoverPrint
          superRef={(node) => this.printContent = node}
          recordList={this.state.recordList}
          boxInfoList={this.state.boxInfoList}
        />
      </div>
    )
  }
}