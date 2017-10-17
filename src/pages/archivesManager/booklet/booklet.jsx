/**
 * Created by APP on 2017/6/5.

 * update
   zhaolongwei 添加代码注释
 */
import React from 'react'
import {Icon, Tooltip, Button, Steps} from 'antd'
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import pKit from '../../../utils/base/permissionKit'
import browserHistory from '../../../libs/browserHistory'
import Topbar from '../../../components/topBar/Topbar'
import {Title} from '../../../components/Title'
import CustomModal from '../../../components/customModal/CustomModal';
import CustomTable from '../../../components/customTable/CustomTable';
import {notice, errorNotice} from '../../../components/Common';
import '../../../less/common.less';
import '../../../less/archivesManager/booklet.less';

import 'animate.css'
import $ from 'jquery'

const Step = Steps.Step;

export default class Booklet extends React.Component {
  constructor(props) {
    super(props);
    let accountYear = this.props.params.year;
    let accountMonth = this.props.params.month;

    this.state = {
      loading: false,

      page: 1,
      size: 100,
      total: 0,
      //装册按钮显示的文案
      buttonName: '',
      //默认无类目
      currentStep: -1,
      //装册类目步骤，目前先在前端写死
      bookletSteps: [{
        label: '会计凭证',
        value: '01'
      }, {
        label: '会计账簿',
        value: '02'
      }, {
        label: '财务报表',
        value: '03'
      }, {
        label: '其它会计资料',
        value: Math.random()
      }],

      //左侧时间树
      bookletTime: {
        year: '',
        arr: []
      },

      //行选中和行展开
      expandedRowKeys: [],
      selectedRowKeys: [],
      selectedRecords: [],

      //没有会计凭证
      noPZ: false,
      pageList: [],
      condition: [{accountYear}, {accountMonth}],
      accountYear,
      accountMonth,
      //盒信息-一个类目下已装册的信息-可撤销
      windowlist: [],

      // 是否选中本类目下最后一条信息（一个类目即将装册完成） 或 会记凭证没有数据
      isComplete: false,
      // 全部类目装册完成
      isAllComplete: false,
      //装册完成的信息
      completeInfo: [],
      //是否显示装册完成的信息
      isShowCompleteInfo: false,

      //是否显示自动装册中
      isAutoBooklet: false,
      canLeftTreeShow: false,
    }

    //自动装册提示是否可以隐藏，用于延时隐藏（最小显示XXX秒）
    this.canAutoBookletHide = true;

    this.orgId = this.props.params.id;

    // 设置列
    // 注意：表格内滚动时，列宽为必需值
    this.tableColumns = [{
      width: '15%',
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
      width: '12%',
      title: '所属日期',
      dataIndex: 'docDate',
      key: 'docDate',
    }, {
      width: '9%',
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
      //最后一列宽度不要设置
      //width: '9%',
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
    }];

    // 设置行选择
    this.rowSelection = {
      onSelect: (record, selected, selectedRows) => {
        //保证只选择第一层级数据，其它层级的复选框和全选框用CSS隐藏了
        let selectedRowKeys = [];
        let selectedRecords = [];
        let pageList = this.state.pageList;
        let rId = record.id;
        for (let i = 0; i < pageList.length; i++) {
          let item = pageList[i];
          let id = item.id;
          if (!selected && id == rId) { //取消选中
            break;
          }
          selectedRowKeys.push(id);
          selectedRecords.push(item);
          if (id == rId) { //点击选中
            break;
          }
        }

        //选中最后一条数据，显示“完成”
        let {total, size, page} = this.state;
        let isComplete = selectedRecords.length == pageList.length;
        isComplete = isComplete && total/size <= page;
        let buttonName = isComplete ? '完成' : '装册';

        this.setState({selectedRowKeys, selectedRecords, buttonName, isComplete});
      }
    };


    this.isFirstGetWindowlistRecords = true;
  }

  componentDidMount = () => {
    this.getTimeTreeFecth();

    this.getPackingRecordsFetch({});
  }

  //盒ID和类目ID
  rollback = (id) => {
    CustomModal.confirm({
      title: '温馨提示',
      content: '确认要撤消吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.rollbackFetch({
          condition: [{
            id,
          }],
          success: () => {
            this.getPackingRecordsFetch({});
          }
        });
      }
    });
  }

  onExpand = (expanded, record) => {
    let sons = record.children;
    let id = record.id;
    let expandedRowKeys = this.state.expandedRowKeys;
    if(expanded) {
      expandedRowKeys.push(id);
      sons && sons.length <= 0 && this.getSonRecordsFetch({
        reqParam: {
          pid: id
        },
        success: (datas) => {
          if (datas.length) {

            record.children = sons.concat(datas);
          } else {
            delete record.children;
          }
        }
      });
    } else {
      expandedRowKeys.splice(expandedRowKeys.indexOf(id), 1);
    }

    this.setState({expandedRowKeys});
  }


  filesPacking = () => {
    if (this.state.isAllComplete) {
      browserHistory.go(-1);
      return;
    }
    let fileIds = [];
    let keys = this.state.selectedRowKeys;
    for (let i = 0; i < keys.length; i++) {
      let item = keys[i];
      fileIds.push({
        id: item
      });
    }

    this.submitPackingFecth({
      fileIds,
      success: (datas) => {
        this.getPackingRecordsFetch({});
        if(datas && datas.length){
          if(this.state.isComplete){
            this.setState({
              completeInfo: datas,
            });

            this.showCompleteInfoDelay();
          } else{
            //this.slideDown('#layoutInfo');
          }
        }
      }
    });
  }

  autoBooletCancel = () => {
    this.setState({
      isShowCompleteInfo: false
    });
  }

  getTimeTreeFecth = () => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        let first = datas[0];
        let condition = this.state.condition;
        let oState = {};
        if(!first){//全部类目装册完成之后，刷新浏览器时
          // oState = {
          //   buttonName: '返回',
          //   isAllComplete: true,
          //   canLeftTreeShow: false,
          // };
        } else {
          let accountYear = first.object;
          let accountMonth;
          let arr = first.children;
          let bookletTime = this.bookletTime = {
            year: accountYear,
            arr: []
          };

          let statusObj = {
            0: '未装册',
            10: '待装册',
            20: '已装册',
            30: '已归档',
          }
          for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            let key = item.id;
            let obj = item.object;
            let status = obj.status;
            let isTarget = item.select;
            isTarget && (accountMonth = obj.month);
            let month = <i className={isTarget && 'target'}>{obj.month + '月 '}</i>;
            let tip;
            // if (status > targetStatus) {
            //   tip = '已装册';
            // } else if (status < targetStatus) {
            //   tip = '未装册';
            // } else {
            //   tip = '待装册';
            // }
            tip = statusObj[status];
            tip = <b className={isTarget && 'target'}>{tip}</b>;
            bookletTime.arr.push({
              key,
              month,
              tip,
            });
          }

          //2016 02
          //condition = [{accountYear}, {accountMonth}];

          // if(
          //   accountYear != this.state.accountYear ||
          //   accountMonth != this.state.accountMonth
          // ){
          //   throw '接口查询年月与URL上传入年月不一致';
          // }

          oState = {
            // accountYear,
            // accountMonth,
            bookletTime,
            //condition,
            //canLeftTreeShow: true
          };
        }

        //处理逻辑如下：
        //用户初次进入、装册但还有数据时，condition设置
        //装册完成某个类目时（理论上可以不用调用，现做成，只要能调，就先调）
        //用户装册完成全部类目，刷新，condition不设置
        if(condition.length) {
          // this.getPackingRecordsFetch({
          //   condition,
          // });
        } else {
          oState.pageList = [];
        }
        this.setState(oState);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/timetree';
    netKit.postFetch({
      url,
      data: {
        condition: [{
          status: 10
        }]
      },
      param: {
        current_org_id: this.orgId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  getPackingRecordsFetch = ({
    page = this.state.page,
    size = this.state.size,
    condition = this.state.condition
  }) => {
    this.setState({
      loading: true
    });
    page < 1 && (page = 1);
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        let category = datas.category;
        let oState = {
          page,
          size,
          selectedRowKeys: [],
          selectedRecords: [],
          expandedRowKeys: [],
          pageList: [],
          total: 0,
        };
        if(category){
          let pageList = datas.pageList;
          //判断当前类目是否是凭证
          let isPZ = category.prefix == 'PZ';


          this.getWindowlistRecordsFetch(category.id);

          //是否没有凭证    没有凭证数据时，返回空数组
          let noPZ = isPZ && pageList.length == 0;
          let buttonName = noPZ ? '完成' : '装册';

          let bookletSteps = this.state.bookletSteps;
          isPZ || bookletSteps.splice(3, 1, {
            label: category.categoryName,
            value: Math.random(),
          });
          oState = Object.assign(oState, {
            pageList,
            page,
            size,
            currentStep: isPZ ? 0 : 3,//目前只有0和3
            total: datas.total,
            buttonName,
            noPZ,
            isComplete: noPZ,
            canLeftTreeShow: true,
          });
        } else {//全部类目装册完成
          oState = Object.assign(oState, {
            currentStep: -1,
            buttonName: '返回',
            isAllComplete: true,
            canLeftTreeShow: false,
          });
        }

        this.setState(oState);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/packinglist';
    netKit.postFetch({
      url,
      data: {condition},
      param: {
        current_org_id: this.orgId,
        page,
        size
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
    reqParam.current_org_id = this.orgId;
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

  getWindowlistRecordsFetch = (categoryId) => {
    let isFirstGetWindowlistRecords = this.isFirstGetWindowlistRecords;
    this.isFirstGetWindowlistRecords =false;
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;

        this.setState({
          windowlist: datas
        });

        isFirstGetWindowlistRecords && datas.length && this.slideDown('#layoutInfo');
      } else {
        errorNotice(response.msg);
      }
    };

    let condition = cKit.copyJson(this.state.condition);
    condition.push({
      categoryId: categoryId
    });

    let url = '/box/windowlist';
    netKit.postFetch({
      url,
      data: {condition},
      param: {
        current_org_id: this.orgId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  submitPackingFecth = ({fileIds, success}) => {
    //凭证装册完成
    this.state.isComplete && this.state.currentStep == 0 && this.autoBookletDelay(true);
    let successHandler = (response) => {
      let {msg, datas} = response;
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(msg);
      }
    };
    let reqParam = {};
    reqParam.accountYear = this.state.accountYear;
    reqParam.accountMonth = this.state.accountMonth;
    reqParam.fileIds = fileIds;
    let prefix;
    if(this.state.currentStep == 0){
      if(fileIds.length){
        prefix = 'PZ';
      } else {//没有凭证，后端强制要求传ZB
        prefix = 'ZB';
      }
    } else {
      prefix = 'QT';
    }
    reqParam.prefix = prefix;

    let url = '/file/packing';
    netKit.postFetch({
      url,
      data: reqParam,
      param: {
        current_org_id: this.orgId
      },
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.autoBookletDelay(false);
      }
    });
  }

  //保证隐藏时间最少XXX秒钟
  autoBookletDelay = (isShow) => {
    if(isShow){
      this.canAutoBookletHide = false;
      this.setState({
        isAutoBooklet: isShow,
      });
      setTimeout(() => {
        this.canAutoBookletHide = true;
      }, 1000);
    } else {
      if(this.canAutoBookletHide) {
        this.setState({
          isAutoBooklet: isShow,
        });
      } else {
        setTimeout(() => {
          this.autoBookletDelay(isShow);
        }, 100);
      }
    }
  }

  //保证时间最少XXX秒钟之后显示， 与autoBookletDelay联用
  showCompleteInfoDelay = () => {
    if(this.canAutoBookletHide) {
      this.setState({
        isShowCompleteInfo: true,
      });
    } else {
      setTimeout(() => {
        this.showCompleteInfoDelay();
      }, 100);
    }
  }


  rollbackFetch = ({condition, success}) => {
    let successHandler = (response) => {
      let msg = response.msg;
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        success && success();
        notice(msg);
      } else {
        errorNotice(msg);
      }
    };

    let url = '/file/unpacking';
    netKit.postFetch({
      url,
      data: {condition},
      param: {
        current_org_id: this.orgId
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

  errorHandler = (error) => {
    console.log(error);
    errorNotice('未知错误');
  }

  pageChange = (page, size) => {
    this.getPackingRecordsFetch({
      page,
      size,
    });
  }

  slideDown = (seletor) => {
    if(this.state.canLeftTreeShow){
      $(seletor).show().animateCss('slide-up-enter slide-up-enter-active');
    }
  }

  slideUp = (seletor) => {
    $(seletor).animateCss('slide-up-leave slide-up-leave-active', function(){
      $(this).hide();
    });
  }

  render() {
    return (
      <div>
        <Topbar />
        <div className="main-content main-content-animate">
          {Title()}
          <div className="booklet-table-wrap">
            <div className="booklet-table-top">
              <div className="left">
                <Icon
                  type="clock-circle-o"
                  className={
                    (this.state.canLeftTreeShow ? '' : 'disabled ')
                    +
                    'operate-icon'
                  }
                  onClick={() => {
                    this.slideDown('#layoutTime');
                  }}
                />
                <div
                  className="elastic-layout-time animated"
                  style={{
                    display: this.state.canLeftTreeShow || 'none'
                  }}
                  id="layoutTime"
                >
                  <header className="title-block">
                    <span
                      className="icon"
                      onClick={() => {
                        this.slideUp('#layoutTime');
                      }}
                    >
                      <Icon type="close"/>
                    </span>
                    装册期间
                  </header>
                  <div className="content">
                    <p>
                      {this.state.bookletTime.year}
                    </p>
                    <ul>
                      {
                        this.state.bookletTime.arr.map(
                          item =>
                            <li key={item.key}>
                              {item.month} {item.tip}
                            </li>
                        )
                      }
                    </ul>
                  </div>
                </div>
              </div>
              <div className="middle">
                <Steps current={this.state.currentStep}>
                  {
                    this.state.bookletSteps.map(
                      item => <Step key={item.value} title={item.label}/>
                    )
                  }
                </Steps>
              </div>
              <div className="right">
                <Icon
                  type="database"
                  style={{transform: 'rotate(-90deg)'}}
                  className={
                    (this.state.canLeftTreeShow ? '' : 'disabled ')
                    +
                    'operate-icon'
                  }
                  onClick={() => {
                    this.slideDown('#layoutInfo');
                  }}
                />
                <div
                  className="elastic-layout-info"
                  style={{
                    display: this.state.canLeftTreeShow || 'none'
                  }}
                  id="layoutInfo"
                >
                  <header className="title-block">
                    <span
                      className="icon-r"
                      onClick={() => {
                        this.slideUp('#layoutInfo');
                      }}
                    >
                      <Icon type="close"/>
                    </span>
                    装册信息
                  </header>
                  <div className="content">
                    <p>装册期间</p>
                    <ul>
                      <li>
                        {this.state.accountYear}年
                        {this.state.accountMonth}月
                      </li>
                    </ul>
                    {
                      this.state.windowlist.map((item, index) => {
                        let {boxClassify, boxList} = item;
                        let domList = boxList.map((target, i) => {
                          let rollbackDom = (
                            <Tooltip title="撤销">
                              <Icon
                                type="rollback"
                                className="rollback"
                                onClick={() => this.rollback(target.id)}
                              />
                            </Tooltip>
                          );

                          let isLast = this.state.windowlist.length - 1 == index &&
                          boxList.length - 1 == i;
                          return (
                            <li key={Math.random()}>
                              {
                                this.state.currentStep == 0 &&
                                (<span className="num">{`第${i + 1}册`} ：</span>)
                              }
                              <span className="name">{`${target.boxName}`}</span>
                              {isLast && rollbackDom}
                            </li>
                          )
                        });
                        return (
                          <div key={Math.random()}>
                            <p>{`${boxClassify}共${boxList.length}册`}</p>
                            <ul>
                              {domList}
                            </ul>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
            <CustomTable
              isSimplePagination={false}
              currentPage={this.state.page}
              currentSize={this.state.size}
              selectedRowKeys={this.state.selectedRowKeys}
              loading={this.state.loading}
              rowSelection={this.state.page == 1 ? this.rowSelection : null}
              expandedRowKeys={this.state.expandedRowKeys}
              dataSource={this.state.pageList}
              columns={this.tableColumns}
              total={this.state.total}
              onPageChange={this.pageChange}
              onExpand={this.onExpand}
              pageSizeOptions={['100', '200', '500']}
              rightBottom={
                <div>
                  {
                    pKit.hasPermission('REC_ARRANGE_SETVOLUME')
                    &&
                    <Button
                      type="primary"
                      disabled={
                        !this.state.noPZ &&
                        !this.state.selectedRecords.length && !this.state.isAllComplete
                      }
                      onClick={this.filesPacking}
                    >{this.state.buttonName}</Button>
                  }

                </div>
              }
            />

            {/*<ul style={{
              width: 300,
              border: '1px solid red',
              display: this.state.isPacking ? 'block' : 'none'
            }}>
              <li>
                <label className="common-head-label-text">装册信息</label>
                <span className="right-info-span">全宗号-KJ•</span>
              </li>
              <li>
                <label className="common-head-label-text">装册时间</label>
                <span className="right-info-span">2017-6-6 14:31:08</span>
              </li>
            </ul>*/}
            <CustomModal
              title="自动装册"
              visible={this.state.isShowCompleteInfo}
              onOk={this.autoBooletCancel}
              onCancel={this.autoBooletCancel}
              width={252}
              operate={false}
            >
              <div className="booklet-complete-window">
                <ul>
                  {this.state.completeInfo.map((item) => {
                    return (
                      <li key={Math.random()}>
                        <header>{item.name}装册完毕</header>
                        <p>{this.state.accountYear}年{this.state.accountMonth}月</p>
                        {
                          item.children.map((target) => {
                            return (
                              <p key={Math.random()}>
                                <span className="name">{target.childName}</span>
                                <span>共{target.size}册</span>
                              </p>
                            );
                          })
                        }
                      </li>
                    );
                  })}
                </ul>
              </div>
            </CustomModal>
            <CustomModal
              width={200}
              visible={this.state.isAutoBooklet}
              closable={false}
              operate={false}
              contentStyle={{
                marginTop: 0
              }}
            >
              <div className="booklet-auto-completing">
              自动装册中……
              </div>
            </CustomModal>
          </div>
        </div>
      </div>
    )
  }
}