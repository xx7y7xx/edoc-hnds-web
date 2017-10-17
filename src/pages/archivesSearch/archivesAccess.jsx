/**
 * Created by APP on 2017/6/20.
 */
import React from 'react'
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import Topbar from '../../components/topBar/Topbar'
import {Title} from '../../components/Title'
import {TreeSelect, Spin} from 'antd'
import {errorNotice} from '../../components/Common';
import CardList from '../archivesManager/cardsList'
import CustomSelect from "../../components/CustomSelect";
import '../../less/archivesSearch/archivesSearch.less'
const TreeNode = TreeSelect.TreeNode;

export default class ArchivesSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      page: 1,
      size: 16,
      orgId: '',
      orgList: [],
      accountYear: '',
      yearList: [],
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
  }

  componentDidMount = () => {
    this.getOrgList();
  }

  componentDidUpdate = () => {
  }

  getOrgList = () => {
    let thiz = this;
    let url = '/consult/approve/org/dropdown';
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        if(response.datas.length > 0){
          this.setState({
            orgId: response.datas[0].value,
            orgList : response.datas
          });
          thiz.getYearList(response.datas[0].value)
        }
      } else {
        errorNotice(response.msg);
      }
    };

    netKit.getFetch({
      url,
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
      }
    });
  }
  orgChange = (orgId) => {
    this.setState({
      orgId
    })
    this.getYearList(orgId)
  }

  getYearList = (orgId) => {
    let thiz = this;
    let url = '/consult/approve/year/dropdown?orgId=' + orgId;
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let yearList = response.datas;
        let defaultYear = yearList[0] ? yearList[0].value : '';
        for(let i in yearList){
          yearList[i].label += '年'
        }
        thiz.setState({
          accountYear: defaultYear,
          yearList : yearList
        });
        thiz.getLeftTreeSelectData(defaultYear)
      } else {
        thiz.setState({
          accountYear: '',
          yearList : []
        });
        errorNotice(response.msg);
      }
    };

    netKit.getFetch({
      url,
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
      }
    });
  }

  yearChange = (yearValue) => {
    this.setState({
      accountYear: yearValue
    })
    this.getLeftTreeSelectData(yearValue)
  }

  getLeftTreeSelectData = (accountYear) => { // 获取左侧树的数据
    if(!accountYear){
      this.setState({
        treeData: [],
        treeSelectValue: ''
      })
    }else {
      let reqParam = {
        orgId: this.state.orgId,
        accountYear: accountYear
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
  }

  getTreeDefaultExpandedKeys = (treeData) => { //得到默认展开的月的节点数据
    if (treeData.length <= 0) {
      this.setState({
        treeSelectValue: '',
        recordList: []
      })
      return;
    }
    let defaultTreeIndex = 0;
    for(let i in treeData[0].children){
      if(treeData[0].children[i].select === true){
        defaultTreeIndex = i;
        break;
      }
    }
    let categoryId = treeData[0].children[defaultTreeIndex].children[0].id;
    let name = treeData[0].children[defaultTreeIndex].children[0].name;
    let accountYear = treeData[0].name;
    let accountMonth = treeData[0].children[defaultTreeIndex].name;
    let defaultValue = accountYear + '-' + accountMonth + '-' + name + '-' + categoryId;
    let treeSelectValue = accountMonth + '月/' + name;
    let reqParam = {
      "condition": [
        {
          "status": 30
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
        current_org_id: this.state.orgId
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

    let url = '/consult/approve/timetree';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
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
          "status": 30
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
    let treeSelectValue = accountMonth + "月/";
    for(let i in value.split("-")){
      if(i > 1){
        treeSelectValue += value.split("-")[i] + (i < value.split("-").length - 1 ? '/' : '')
      }
    }
    if (isLeaf) {
      this.setState({
        treeSelectValue: treeSelectValue,
        fileBaseData: {
          current_org_id: this.state.orgId,
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
    let reqParam = {accountYear: accountYear, accountMonth: accountMonth, orgId: this.state.orgId}
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

    let url = '/consult/approve/monthly/timetree';
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
              {this.state.eventKey == id && <Spin size="small"/>}&nbsp;{name}
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
              <CustomSelect
                className="archive-select archive-org-select"
                dataSource={this.state.orgList}
                value={this.state.orgId}
                onChange={this.orgChange}
                notFoundContent="无单位信息"
              />
              <CustomSelect
                className="archive-select archive-year-select"
                dataSource={this.state.yearList}
                value={this.state.accountYear}
                onChange={this.yearChange}
                notFoundContent="无会计年"
              />
              <TreeSelect
                className="archive-tree-select"
                value={this.state.treeSelectValue}
                treeDefaultExpandedKeys={[this.state.defaultValue]}
                style={{width: 230}}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                treeNodeLabelProp='value'
                onSelect={this.onSelect}
                loadData={this.onLoadData}
                notFoundContent={'暂无已归档数据'}
              >
                {treeNodes}
              </TreeSelect>
            </div>
            <div className="booklet-content-box clearFloat">
              {
                this.state.recordList.length <= 0 ?
                  <div className="notFound"><i className="anticon anticon-frown-o"/>&nbsp;暂无数据</div>
                  :
                  <CardList
                    openUrl={'/archive/access/list/'}
                    currentOrgId={this.state.orgId}
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