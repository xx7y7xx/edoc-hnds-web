/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import pKit from '../../../utils/base/permissionKit';
import browserHistory from '../../../libs/browserHistory';
import Topbar from '../../../components/topBar/Topbar'
import {Title} from '../../../components/Title'
import {Icon, Tooltip, Button, TreeSelect, Spin} from 'antd'
import CustomModal from '../../../components/customModal/CustomModal';
import CustomTable from '../../../components/customTable/CustomTable';
import AttachmentCollect from './attachmentCollect';
import AttachmentEdit from './attachmentEdit';
import {notice, errorNotice} from '../../../components/Common';

import '../../../less/common.less';
import '../../../less/archivesManager/booklet.less';

import AttachmentDetail from './../attachmentDetail';

const TreeNode = TreeSelect.TreeNode;

export default class BeforeBooklet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      page: 1,
      size: 10,
      total: 0,
      loading: false,
      pageList: [],
      treeData: [],
      bookletMonth: '',
      defaultValue: [],
      treeSelectValue: '',
      eventKey: '',
      checkedEventKey: '',
      afterProcessDate: [],
      attachmentCollectVisible: false,
      editAttachmentVisible: false,
      attachmentRecord: {},
      fileBaseData: {},
      reqParam: {},
      isViewDetailing: false,
      fileId: '',
      expandedRowKeys: [],
      rootCategoryPrefix: 'PZ'
    }

    this.currentOrgId = this.props.params.id;

    // 设置列
    // 注意：表格内滚动时，列宽为必需值
    this.tableColumns = [{
      width: '15%',
      title: '题名',
      dataIndex: 'title',
      key: 'title',
    }, {
      width: '9%',
      title: '文号',
      dataIndex: 'fileNo',
      key: 'fileNo',
    }, {
      width: '9%',
      title: '关键词',
      dataIndex: 'keywords',
      key: 'keywords',
    }, {
      width: '13%',
      title: '摘要',
      dataIndex: 'abstracts',
      key: 'abstracts',
    }, {
      width: '7%',
      title: '责任人',
      dataIndex: 'owner',
      key: 'owner',
    }, {
      width: '12%',
      title: '所属日期',
      dataIndex: 'docDate',
      key: 'docDate',
    }, {
      width: '8%',
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
            {
              Boolean(record.level && record.level < 3) &&
              <Tooltip title="新增" key={Math.random()}>
                <Icon type="plus" className="operate-icon" onClick={() => this.toCollect(record)}/>&nbsp;
              </Tooltip>
            }
            {
              pKit.hasPermission('REC_ARRANGE_EDIT') && record.srcType != 1
              &&
              <Tooltip title="编辑">
                <Icon type="edit" className="operate-icon" onClick={() => this.editAttachment(record)}/>&nbsp;
              </Tooltip>
            }
            {
              record.srcType != 1 &&
              <Tooltip title="删除">
                <Icon type="delete" className="dangerous-icon" onClick={() => this.deleteAttachmentConfirm(record.id)}/>
              </Tooltip>
            }
          </span>
        )
      }
    }];
  }

  componentDidMount = () => {
    this.getLeftTreeSelectData()
  }

  booklet = () => {
    let url = '/arrange/booklet/' + this.currentOrgId;
    url += '/' + this.state.fileBaseData.accountYear;
    url += '/' + this.state.fileBaseData.accountMonth;
    browserHistory.push(url);
  }

  afterBooklet = () => {
    browserHistory.push('/arrange/afterBooklet/' + this.currentOrgId);
  }

  //高级搜索
  advanceSearch = (keyword) => {
    this.getRecordsFetch({
      keyword,
      page: 1,
    });
  }

  attachmentDetailFun = (record) => { //查看文件详情
    let fileId = record.id
    this.setState({
      fileId: fileId,
      isViewDetailing: true
    });
  }

  getLeftTreeSelectData = () => { // 获取左侧树的数据
    let reqParam = {
      "condition": [
        {
          "status": 10
        },
        {
          "isAppendCategory": true
        }
      ]
    };

    this.subSelectFecth({
      reqParam,
      success: (datas) => {
        this.setState({
          treeData: datas,
          bookletMonth: datas[0].children[0] ? datas[0].children[0].name : ''
        })
        this.getTreeDefaultExpandedKeys(datas);
      }
    });

  }

  getTreeDefaultExpandedKeys = (treeData) => { //得到默认展开的月的节点数据
    if (treeData.length <= 0) {
      return;
    }
    let category = treeData[0].children[0].children[0];
    let categoryId = category.id;
    let name = category.name;
    let accountYear = treeData[0].name;
    let accountMonth = treeData[0].children[0].name;
    let rootCategoryPrefix = category.object.rootCategoryPrefix;
    let treeSelectValue = accountYear + '-' + accountMonth + '-' + name;
    let defaultValue = treeSelectValue + '-' + categoryId;
    let reqParam = {
      condition: [{
        status: 10
      }, {
        accountYear
      }, {
        accountMonth
      }, {
        categoryId
      }
      ]
    };
    this.setState({
      treeSelectValue,
      reqParam,
      rootCategoryPrefix,
      defaultValue: [defaultValue],
      fileBaseData: {
        current_org_id: this.currentOrgId,
        categoryId,
        accountYear,
        accountMonth,
        categoryName: name
      }
    });

    this.getRecordsFetch({ // 获取文件列表
      reqParam
    });
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
      loading: true,
      expandedRowKeys: []
    });
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {total, pageList, page} = response.datas;
        /*let accountMonth = reqParam.condition[2].accountMonth;
         let treeDataAccountMonth = this.state.treeData[0].children[0].name;*/
        pageList.forEach((item) => {
          item.level = 1;
        })
        this.setState({
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

  pageChange = (page, size) => {
    this.getRecordsFetch({
      page,
      size,
    });
  }

  onSelect = (value, node, extra) => {
    let isLeaf = node.props.isLeaf;
    let eventKey = node.props.eventKey;
    let eventKeyArr = eventKey.split("-");
    let categoryId = eventKeyArr[eventKeyArr.length - 1];
    let valueArr = value.split("-");
    let accountYear = valueArr[0];
    let accountMonth = valueArr[1];
    let categoryName = valueArr[valueArr.length - 1];
    let reqParam = {
      condition: [{
        status: 10
      }, {
        accountYear: accountYear
      }, {
        accountMonth: accountMonth
      }, {
        categoryId: categoryId
      }, {
        "isAsc": false
      }]
    };

    if (isLeaf) {
      this.setState({
        treeSelectValue: value,
        reqParam,
        expandedRowKeys: [],
        rootCategoryPrefix: categoryName == '会计凭证' ? 'PZ' : '',
        fileBaseData: {
          current_org_id: this.currentOrgId,
          categoryId,
          accountYear,
          accountMonth,
          categoryName
        }
      });
      this.getRecordsFetch({ // 获取文件列表
        reqParam
      });
    }
  }

  onLoadData = (treeNode) => {  // 左侧树 懒加载
    let eventKey = treeNode.props.eventKey;
    let [accountYear, accountMonth] = treeNode.props.value.split('-');
    let reqParam = {
      accountYear,
      accountMonth,
      current_org_id: this.currentOrgId
    };
    let treeData = this.state.treeData;
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

  onExpand = (expanded, record) => {
    let sons = record.children;
    let id = record.id;
    let expandedRowKeys = this.state.expandedRowKeys;
    if (expanded) {
      expandedRowKeys.push(id);
      expanded && sons && sons.length <= 0 && this.getSonRecordsFetch({
        reqParam: {
          pid: id,
          current_org_id: this.currentOrgId
        },
        success: (datas) => {
          if (datas.length) {
            record.children = sons.concat(datas);
            if (record.level == 1) {
              record.children.forEach((item) => {
                item.level = 2;
              })
            } else if (record.level == 2) {
              record.children.forEach((item) => {
                item.level = 3;
                delete item.children;
              })
            }
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

  getNewPageList = (datas, id) => {
    let pageList = this.state.pageList;
    pageList.forEach((item) => {
      if (item.id == id) {
        item.children = datas;
        return;
      }
    })
  }

  getSonRecordsFetch = ({reqParam, success}) => { //{pid}
    reqParam.current_org_id = this.currentOrgId;
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

  fileClean = (e, yearMonth) => {
    let accountYear = yearMonth.split("-")[0];
    let accountMonth = yearMonth.split("-")[1];
    let reqParam = [
      {
        "accountYear": accountYear,
        "accountMonth": accountMonth
      }
    ]
    CustomModal.confirm({
      title: '温馨提示',
      content: '是否清除包含' + yearMonth + '之后的全部数据',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.fileCleanFetch({
          reqParam,
          success: (datas) => {
            notice('已清除包含' + yearMonth + '之后的全部数据')
            this.getLeftTreeSelectData();
          }
        });
      }
    });
  }
  fileCleanFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/clean';
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

  deleteAttachmentConfirm = (id) => {
    CustomModal.confirm({
      title: '温馨提示',
      content: '确认要删除吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.deleteAttachment(id, () => {
          let newList = this.onAttachmentDeleteOk(id, this.state.pageList)
          this.setState({
            pageList: newList
          })
        })
      }
    });
  }

  onAttachmentDeleteOk = (id, recordList) => {
    for (let i in recordList) {
      if (recordList[i].id == id) {
        recordList.splice(i, 1);
        return recordList;
      }
      if (recordList[i].children) {
        this.onAttachmentDeleteOk(id, recordList[i].children)
      }
    }
    return recordList;
  }

  deleteAttachment = (id, success) => {
    let successHandler = (response) => {
      let msg = response.msg;
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        success && success();
        notice(msg);
      } else {
        errorNotice(msg);
      }
    }

    let url = '/file/delete';
    netKit.postFetch({
      url,
      data: [{id}],
      param: {
        current_org_id: this.currentOrgId,
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  toCollect = (currentFile) => {
    let fileBaseData = this.state.fileBaseData;
    if (currentFile) {
      fileBaseData.currentFileId = currentFile.id
      fileBaseData.currentFileLevel = currentFile.level
    } else {
      delete fileBaseData.currentFileId
      delete fileBaseData.currentFileLevel
    }
    this.setState({
      fileBaseData: fileBaseData,
      attachmentCollectVisible: true
    })
  }

  editAttachment = (record) => {
    this.setState({
      attachmentRecord: record,
      editAttachmentVisible: true
    })
  }

  onCancel = () => {
    this.setState({
      editAttachmentVisible: false,
      attachmentCollectVisible: false
    })
  }

  recordListPush = (list, record, currentFileId) => {
    if (currentFileId) {
      for (let i in list) {
        if (list[i].id == currentFileId) {
          if (list[i].children) {
            if (cKit.isArray(record)) {
              for (let j in record) {
                record[j].isNew = true;
                list[i].children.unshift(record[j])
              }
            } else {
              record.isNew = true;
              list[i].children.unshift(record)
            }
          } else {
            if (cKit.isArray(record)) {
              list[i].children = [];
              for (let j in record) {
                record[j].isNew = true;
                list[i].children.unshift(record[j])
              }
            } else {
              record.isNew = true;
              list[i].children = [record]
            }
          }
          return list;
        }
        if (list[i].children) {
          this.recordListPush(list[i].children, record, currentFileId)
        }
      }
    } else {
      if (cKit.isArray(record)) {
        for (let j in record) {
          record[j].isNew = true;
          record[j].level = 1;
          list.unshift(record[j])
        }
      } else {
        record.isNew = true;
        record.level = 1;
        list.unshift(record)
      }
    }
    return list;
  }

  onOk = (record, currentFileId) => {
    console.log(record)
    let list = cKit.copyJson(this.state.pageList)
    let newList = currentFileId ? this.recordListPush(list, record, currentFileId) : this.recordListPush(list, record)
    let expandedRowKeys = this.state.expandedRowKeys;
    if (currentFileId) {
      expandedRowKeys.push(currentFileId);
    }
    this.setState({
      pageList: newList,
      expandedRowKeys
    })
    this.onCancel();
  }

  recordListUpdate = (list, record) => {
    for (let i in list) {
      if (list[i].id == record.id) {
        for (let j in record) {
          if (j != 'children') {
            list[i][j] = record[j]
          }
        }
        return list;
      }
      if (list[i].children) {
        this.recordListUpdate(list[i].children, record)
      }
    }
    return list;
  }

  onUpdateOk = (record) => {
    let list = cKit.copyJson(this.state.pageList)
    let newList = this.recordListUpdate(list, record)
    let expandedRowKeys = this.state.expandedRowKeys;
    this.setState({
      pageList: newList,
      expandedRowKeys
    })
    this.onCancel();
  }

  render() {

    const monthTreeNodeTitle = (monthObject, index, indexYear, id, yearMonth) => {
      let lastIndex = this.state.treeData[0].children.length - 1
      return <span>
              <span style={{marginRight: 40}}>
                {this.state.eventKey == id && <Spin size="small"/>}
                {monthObject.month}
              </span>
        {
          monthObject.status == 10
          &&
          pKit.hasPermission('REC_ARRANGE_CLEANDATA')
          &&
          <Tooltip title="删除">
            <Icon type="delete" className="dangerous-icon tree-select-del-btn" data={yearMonth}
                  onClick={(e) => this.fileClean(e, yearMonth)}/>
          </Tooltip>
        }
            </span>
    }

    let value = '';
    const getDataList = (data, value) => data.map((dataItem, index) => {
      let dataValue = value + ('-' + dataItem.name);
      if (dataItem.children && dataItem.children.length > 0) {
        return <TreeNode value={dataValue} title={dataItem.name}
                         key={dataValue + '-' + dataItem.id}>
          {getDataList(dataItem.children, dataValue)}
        </TreeNode>
      }
      return <TreeNode className="last-node" value={dataValue} title={dataItem.name} key={dataValue + '-' + dataItem.id}
                       isLeaf={true}/>
    })

    const getMonthList = (data, indexYear, yearName) => data.map((monthItem, index) => {
      value = yearName + '-' + monthItem.name;
      return <TreeNode value={value} title={monthTreeNodeTitle(monthItem.object, index, indexYear, monthItem.id, value)}
                       key={monthItem.id + ''}>
        { getDataList(monthItem.children, value) }
      </TreeNode>
    })

    const getYeartList = (data) => data.map((yearItem, index) => {
      return <TreeNode value={yearItem.name} title={yearItem.name} key={yearItem.id + ''}>
        { getMonthList(yearItem.children, index, yearItem.name) }
      </TreeNode>
    })
    const treeNodes = getYeartList(this.state.treeData);
    /* 待研究方案，不要删*/
    /*const loop = (data, dataIndex) => data.map((item, index) => {
     if (item.id <= 12) {
     return <TreeNode value={item.name}
     title={monthTreeNodeTitle(item.name, index, dataIndex, item.id)}
     key={item.id + ''}
     >
     {loop(item.children, dataIndex)}
     </TreeNode>;
     } else {
     if (item.children && item.children.length > 0) {
     return <TreeNode value={item.name} title={item.name} key={item.id + ''}>
     {loop(item.children)}
     </TreeNode>;
     }
     return <TreeNode value={item.name} title={item.name} key={item.id + ''} isLeaf={true} />;
     }
     });
     const treeNodes = loop(this.state.treeData);*/
    return (
      <div>
        <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch}
                placeholder={'请输入题名、文号、关键词、摘要、责任人'}/>
        <div className="main-content main-content-animate">
          {Title()}
          <div className="booklet-table-box">
            <div className="booklet-table-top">
              <TreeSelect
                className="common-archive-tree-select"
                value={this.state.treeSelectValue}
                treeDefaultExpandedKeys={this.state.defaultValue}
                style={{width: 230}}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                onSelect={this.onSelect}
                treeNodeLabelProp={'value'}
                loadData={this.onLoadData}
              >
                {treeNodes}
              </TreeSelect>
              <span className="booklet-tab-box">
                <span className="booklet-tab-check-btn">待装册</span>
                <span onClick={this.afterBooklet}>已裝册</span>
              </span>

            </div>
            <CustomTable
              onExpand={this.onExpand}
              expandedRowKeys={this.state.expandedRowKeys}
              rowKey={record => record.id}
              currentPage={this.state.page}
              loading={this.state.loading}
              dataSource={this.state.pageList}
              columns={this.tableColumns}
              total={this.state.total}
              onPageChange={this.pageChange}
              rightBottom={
                <div>
                  {
                    pKit.hasPermission('REC_ARRANGE_SETVOLUME')
                    &&
                    <Button
                      disabled={!(this.state.fileBaseData.accountMonth == this.state.bookletMonth)}
                      onClick={this.booklet}
                      type="primary"
                    >启动装册
                    </Button>
                  }
                </div>
              }
              leftBottom={
                <div style={{display: (this.state.rootCategoryPrefix === 'PZ') ? 'none' : 'block'}}>
                  <Button icon="plus" type="primary" onClick={() => this.toCollect()}>
                    新增
                  </Button>
                </div>
              }
            />

          </div>
          <AttachmentCollect
            visible={this.state.attachmentCollectVisible}
            onCancel={this.onCancel}
            fileBaseData={ this.state.fileBaseData }
            afterClose={() => {
            }}
            onOk={this.onOk}
          />
          <AttachmentEdit
            visible={this.state.editAttachmentVisible}
            onCancel={this.onCancel}
            fileBaseData={ this.state.fileBaseData }
            attachmentRecord={this.state.attachmentRecord }
            afterClose={() => {
            }}
            onUpdateOk={this.onUpdateOk}
          />
        </div>
        <AttachmentDetail
          visible={this.state.isViewDetailing}
          orgId={this.currentOrgId}
          fileId={this.state.fileId}
          onClose={() => {
            this.setState({
              isViewDetailing: false
            })
          }}
        />
      </div>
    )
  }
}