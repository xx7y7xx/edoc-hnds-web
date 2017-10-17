import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import { Button, Input, Form, Icon, Tooltip} from 'antd';

import '../../less/common.less';
import '../../less/archivesManager/establishArchives.less';
import ValidatePopover from '../../components/validatePopover';
import {notice, errorNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable';
import CustomTableCell from '../../components/customTableCell/CustomTableCell';
import CustomModal from '../../components/customModal/CustomModal';
import CustomSelect from '../../components/CustomSelect';
import {Validator}  from '../../utils/base/validator';

const InputGroup = Input.Group;
const FormItem = Form.Item;

class EstablishArchives extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //establish editCategory addCategory editNum editOrgAndQue
      currentAction: 'establish',

      orgs: [],
      categoryTypes: [],
      selectedOrg: '',
      selectedCategoryType: '',
      fondsNo: '',
      startNum: '1',
      recordCode: 'KJ',
      startYear: '',
      startMonth: '',
      startMonthArr: this.getStartMonthArrFun(new Date().getFullYear()),

      categories: [],
      isEditingCategories: {},
      categoriesValidVisible: {},
      categoriesValidMessage: {},
      editCategoryExpandedRowKeys: [],

      level: {
        1: '正常',
        2: '警告',
        3: '严重'
      },
        serialruleList: [
            {
                "id" : 1,
                "corpId" : 1,
                "orgId" : 1,
                "type" : 1,
                "ruleCode" : "规则编码",
                "ruleName" : "规则名称",
                "ruleValue" : "",
                "ruleOrder" : 1,
                "seperator" : "-",
                "isSystem" : "Y",
                "isEnable" : "Y",
                "resetType" : 1,
                "serialNoLength" : 4,
                "createTime" : "2017-01-01 11:11:11",
                "ts" : "2017-01-01 11:11:11"
            }
        ]
    }

    this.valiPeriodList = function(){
      let arr = [{value: '永久', label: '永久'}];
      for (let i = 12; i >= 1; i--) {
        let str = i * 5 + '';
        arr.unshift({
          value: str,
          label: str
        })
      }
      return arr
    }();

    // 设置列
    // 注意：表格内滚动时，列宽为必需值
    this.categoriesColumns = [{
      width:'40%',
      title: '目录名称',
      dataIndex: 'object.categoryName',
      key: 'object.categoryName',
      render: (text, record) => {
        let id = 'categoryName' + record.id;
        let defaultMsg = '请输入目录名称';
        return record.object.isSystem == 'Y' ?
        text :
        <CustomTableCell
          isEditing={this.state.isEditingCategories[id]}
          //autoFocus={record.object.isSystem != 'Y'}
          width={140}
          value={text}
          validTip = {{
            visible: this.state.categoriesValidVisible[id],
            message: this.state.categoriesValidMessage[id] || defaultMsg
          }}
          eidtCompleted={(value) => {
            value = (value || '').trim();
            let isRepeated = this.isRepeated('categoryName', value);
            isRepeated.id == record.id && (isRepeated = false);
            let longer =  value.length > 30;
            if(!value || longer || isRepeated){
              let {categoriesValidVisible, categoriesValidMessage} = this.state;
              categoriesValidVisible[id] = true;
              let message;
              if(!value){
                message = defaultMsg;
              } else if(longer){
                message = '输入长度最大为30';
              } else if(isRepeated){
                message = '目录名称已存在，请重新输入';
              }
              categoriesValidMessage[id] = message;
              this.setState({categoriesValidVisible, categoriesValidMessage});
            } else {
              record.name = record.object.categoryName = value;
              this.cellEditCompleted(id);
            }
          }}
        />
      }
    }, {
      width:'20%',
      title: '编码',
      dataIndex: 'object.categoryCode',
      key: 'object.categoryCode',
      render: (text, record) => {
        let id = 'categoryCode' + record.id;
        let defaultMsg = '请输入编码';
        return <CustomTableCell
          isEditing={this.state.isEditingCategories[id]}
          //autoFocus={record.object.isSystem == 'Y'}
          validTip = {{
            visible: this.state.categoriesValidVisible[id],
            message: this.state.categoriesValidMessage[id] || defaultMsg
          }}
          value={text}
          eidtCompleted={(value) => {
            value = (value || '').trim();
            let noFomat = !this.checkSpecialCharacter(value);
            let isRepeated = this.isRepeated('categoryCode', value);
            isRepeated.id == record.id && (isRepeated = false);

            let longer = value.length > 20;
            if(!value || longer || isRepeated || noFomat){
              let {categoriesValidVisible, categoriesValidMessage} = this.state;
              categoriesValidVisible[id] = true;
              let message;
              if(!value){
                message = defaultMsg;
              } else if(longer){
                message = '输入长度最大为20';
              } else if(isRepeated){
                message = '编码已存在，请重新输入'
              } else if(noFomat){
                message = '编码仅支持数字、字母和特殊字符';
              }
              categoriesValidMessage[id] = message;
              this.setState({categoriesValidVisible, categoriesValidMessage});
            } else {
              record.object.categoryCode = value;
              this.cellEditCompleted(id);
            }
          }}
        />
      }
    }, {
      width:'13%',
      title: '保管期限',
      dataIndex: 'object.valiPeriod',
      key: 'object.valiPeriod',
      render: (text, record) => {
        let date = record.object.valiPeriod;
        if(date){
          let dataSource = this.valiPeriodList;
          //不能小于系统预置时间
          if(record.object.isSystem == 'Y'){
            for (let i = 0; i < this.valiPeriodList.length; i++) {
              let item = this.valiPeriodList[i];
              if(item.value == record.object.originPeriod){
                dataSource = dataSource.slice(i);
                break;
              }
            }
          }

          return <span >
            <CustomSelect
              className="estblish-period"
              getPopupContainer={(trigger) => document.querySelectorAll( '.ant-table-body')[0]}
              defaultValue={date}
              dataSource={dataSource}
              onChange={(value) => {
                record.object.valiPeriod = value;
              }}
            />
          </span>
        } else {
          return '…';
        }
      }
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record) => {
        let obj = record.object;
        let children = [];
        obj.level >= obj.maxLevel || children.push(
          <Tooltip
            key = {Math.random()}
            onClick={() => this.addCategory(record)}
            title="新增"
          >
            <Icon type="plus" className="operate-icon" />
          </Tooltip>
        );
        children.push(
          <Tooltip
            key = {Math.random()}
            onClick={() => this.editCategory(record)}
            title="编辑"
          >
            <Icon type="edit" className="operate-icon"/>
          </Tooltip>
        );

        obj.isSystem == 'Y' || children.push(
          <Tooltip
            key = {Math.random()}
            onClick={() => this.isDeleteCategory(record)}
            title="删除"
          >
            <Icon type="delete" className="dangerous-icon"/>
          </Tooltip>
        );

        return (
          <span>
            {children}
          </span>
        )
      }
    },];

    this.isAfterVisible = this.props.visible;
  }

  componentDidUpdate() {
    if(this.props.visible && !this.isAfterVisible){ // 当本组件显示的时候执行
      this.isAfterVisible = true;
      this.getDropdownOptionsFetch({
        type: 'category-sys',
        success: (categoryTypes) => {
          this.setState({
            categoryTypes,
            selectedCategoryType: categoryTypes[0] ? categoryTypes[0].value : ''
          });
        }
      });
      this.getDropdownOptionsFetch({
        type: 'org',
        success: (orgs) => {

          this.setState({
            orgs,
            selectedOrg: orgs[0] ? orgs[0].value : ''
          });
        }
      });

      this.setStartDate(); // 初始化设置起始年、起始月
    }
  }

  //流程控制
  /*
   * 组件整体流程在一个弹窗里，
   * 当用户点击关闭按钮（X）时，
   * 执行此函数，函数根据this.state.currentAction的值，
   * 做相应的处理
   */
  actionChange = () => {
    //establish editCategory addCategory editNum editOrgAndQue
    let currentAction;
    switch(this.state.currentAction){
      case 'editCategory':
        //清除本次编辑类目的痕迹
        this.state.categories.length = 0;
        this.state.isEditingCategories = {};
        this.state.categoriesValidVisible = {};
        this.state.categoriesValidMessage = {};
        this.state.editCategoryExpandedRowKeys.length = 0;

        currentAction = 'establish'
        break;
      case 'establish':
        this.props.onCancel();
        break;
    }

    let json = {};
    currentAction ? json.currentAction = currentAction : this.validateErrors = {};
    this.setState(json);
  }

  //编辑类目
  needEditCategory = () => {
    let {selectedOrg, selectedCategoryType} = this.state;
    this.getCategoryTreeFetch({
      reqParam: {
        orgId: selectedOrg,
        sysPid: selectedCategoryType
      },
      success: (datas) => {
        //去掉空children
        each(datas);

        this.setState({
          currentAction: 'editCategory',
          categories: datas
        });

        function each(datas){
          datas.forEach((item) => {
            let sons = item.children || [];
            if(sons){
              if(sons.length){
                each(sons);
              } else {
                delete item.children;
              }
            }
          });
        }
      }
    });
  }
  //新增类目
  addCategory = (record) => {
    if(record){
      let pid = record.id;
      let newId = Math.random();
      let oldObj = record.object;
      record.children = record.children || [];
      record.children.push({
        id: newId,
        name: '',
        object: {
          pid,
          //此id为前端临时使用，后端会忽略此值
          id: newId,
          sysPid: this.state.selectedCategoryType,

          orgId: oldObj.orgId,
          level: oldObj.level + 1,
          maxLevel: oldObj.maxLevel,
          isSystem: 'N',
          valiPeriod: '永久',
          categoryCode: '',
          categoryName: '',
        },
      });

      let editCategoryExpandedRowKeys = this.state.editCategoryExpandedRowKeys;
      if(editCategoryExpandedRowKeys.indexOf(pid) == -1){
        editCategoryExpandedRowKeys.push(record.id);
      }

      //新数据为编辑状态
      let isEditingCategories = this.state.isEditingCategories;
      isEditingCategories['categoryCode' + newId] = true;
      isEditingCategories['categoryName' + newId] = true;

      this.setState({
        editCategoryExpandedRowKeys,
        isEditingCategories,
        ategories: this.state.categories
      });
    }
  }
  editCategorySubmit = () => {
    this.beforeCategorySubmit() || this.submitCategoryTreeFetch({
      reqParam: this.state.categories,
      success: () => {
        this.setState({
          currentAction: 'establish',
          isEditingCategories: {}
        });
      }
    });
  }
  isDeleteCategory = (record) => {
    CustomModal.confirm({
      title: '温馨提示',
      content: '确认要删除吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.deleteCategoryById(record.id);
        this.setState({
          categories: this.state.categories
        });
      }
    });
  }
  deleteCategoryById = (id, categories = this.state.categories) => {
    for (let i = 0; i < categories.length; i++) {
      let item = categories[i];
      let sons = item.children || [];
      if(item.id == id){
        //删除
        categories.splice(i, 1);
        return true;
      } else if(sons && sons.length && this.deleteCategoryById(id, sons)){
        return true;
      }
    }
  }
  editCategory = (record) => {
    let isEditingCategories = this.state.isEditingCategories;
    isEditingCategories['categoryCode' + record.id] = true;
    isEditingCategories['categoryName' + record.id] = true;
    this.setState({isEditingCategories});
  }
  cellEditCompleted = (id) => {
    let {categoriesValidVisible, isEditingCategories, categoriesValidMessage} = this.state;
    isEditingCategories[id] = false;
    categoriesValidVisible[id] = false;
    categoriesValidMessage[id] = '';
    this.setState({isEditingCategories, categoriesValidVisible, categoriesValidMessage});
  }
  beforeCategorySubmit = (categories = this.state.categories) => {
    let bFlag = false;
    let {categoriesValidVisible, editCategoryExpandedRowKeys} = this.state;
    for (let i = 0; i < categories.length; i++) {
      let item = categories[i];
      let sons = item.children || [];
      let obj = item.object;
      let id_name = 'categoryName' + item.id;
      let id_code = 'categoryCode' + item.id;
      if(!obj.categoryName || categoriesValidVisible[id_name]){
        bFlag = categoriesValidVisible[id_name] = true;
      }
      if(!obj.categoryCode || categoriesValidVisible[id_code]){
        bFlag = categoriesValidVisible[id_code] = true;
      }
      if(bFlag){
        editCategoryExpandedRowKeys.push(obj.pid);
        this.setState({categoriesValidVisible, editCategoryExpandedRowKeys});
      }
      if(sons.length && this.beforeCategorySubmit(sons)){
        bFlag = true;
      }
    }

    return bFlag;
  }
  editCategoryRowExpand =  (expanded, record) => {
    let editCategoryExpandedRowKeys = this.state.editCategoryExpandedRowKeys;
    if(expanded){
      editCategoryExpandedRowKeys.push(record.id);
    } else {
      for (let i = 0, len = editCategoryExpandedRowKeys.length; i < len;) {
        if(editCategoryExpandedRowKeys[i] == record.id){
          editCategoryExpandedRowKeys.splice(i, 1);
        } else {
          i++;
        }
      }
    }
    this.setState({editCategoryExpandedRowKeys});
  }
  /*
   * 编辑类目时，判断字段值是否已经存在（不包含自己）
   */
  isRepeated = (prop, value, arr = this.state.categories) => {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let sons = item.children || [];
      if(item.object[prop] == value ||
        (sons.length &&
        (item = this.isRepeated(prop, value, sons)))
      ){
        return item;
      }
    }
    return false;
  }
  getDropdownOptionsFetch = ({type, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {datas} = response;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = type == 'category-sys' ? '/category/sys/dropdown' : '/org/unestablish/dropdown';
    netKit.getFetch({
      url,
      data: {},
      success: successHandler,
      error: this.errorHandler
    });
  }
  getCategoryTreeFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        success && success(datas);
      } else {
        errorNotice(msg);
      }
    };

    let url = '/category/tree';
    netKit.getFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }
  submitCategoryTreeFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        success && success(datas);
        notice('操作成功');
      } else {
        errorNotice(msg);
      }
    };

    let url = '/category/tree/insert';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  //表单验证
  checkSpecialCharacter = (value) => {
    return Validator.SPECIAL_CHARACTER(value);
  }
  checkAllNumber = (rule, value, callback) => {
    let mes;
    value && ( Validator.ALLNUMBER(value) || (mes = '请输入数字') );
    callback(mes);
  }
  checkSpecialCharacterForm = (rule, value, callback) => {
    let mes;
    value && ( Validator.SPECIAL_CHARACTER(value) || (mes = '请输入字母、数字或特殊字符') );
    callback(mes);
  }
  checkAllLetterNumber = (rule, value, callback) => {
    let mes;
    value && ( Validator.ALLLETTERNUMBER(value) || (mes = '请输入字母或数字') );
    callback(mes);
  }

  setStartDate = (dateNow = new Date()) => {  // 初始化设置起始年、起始月
    let date = cKit.date2json(dateNow);
    this.setState({
      startYear: date.sYear,
      startMonth: date.sMonth,
    })
  }

  sureEstablishAdd = () => {
    this.props.form.validateFields((err, fields) => {
      //每次表单验证，重置错误信息
      let validateErrors = this.validateErrors = {};
      if (err) {
        for (let i in err) {
          validateErrors[err[i].errors[0].field] = {
            visible: true,
            message: err[i].errors[0].message,
            className: 'validator-popover-error'
          };
        }
      } else {
        let param = {...fields};
        let reqParam = {};
        reqParam.corpId = '';
        reqParam.orgId = Number(param.orgId);
        reqParam.sysPid = Number(param.sysPid);
        reqParam.fondsNo = param.fondsNo;
        reqParam.startYear = param.startYear + '';
        reqParam.startMonth = param.startMonth + '';
        reqParam.startNum = param.startNum;
        reqParam.recordCode = param.recordCode;
        this.addRecordFetch({
          reqParam,
          success: (datas) => {
            let fn = this.props.success;
            fn && fn(datas);
          }
        });
      }
    });
  }

  addRecordFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
        this.props.onCancel();
        this.props.success();
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/establish/add';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  afterClose = () => {
    this.isAfterVisible = false;
    this.validateErrors = {};

    //初始化所有数据
    this.setState({
      orgs: [],
      categoryTypes: [],
      selectedOrg: '',
      selectedCategoryType: '',
      fondsNo: '',
      startNum: '1',
      recordCode: 'KJ',

      categories: [],
      isEditingCategories: {},
      categoriesValidVisible: {},
      categoriesValidMessage: {},
      editCategoryExpandedRowKeys: [],
    });
  }

  getStartYearArrFun = (dateNow = new Date()) => {
    let yearNow =  dateNow.getFullYear();
    let startYearArr = [];
    for (let i = 0; i < 11; i++) {
      let obj = {};
      obj.label = obj.value = yearNow - i + '';
      startYearArr.push(obj);
    }
    return startYearArr;
  }

  getStartMonthArrFun = (checkYear) => {
    let dateNow = new Date();
    let startMonthArr = [];
    let monthNow = dateNow.getMonth() + 1;
    let yearNow = dateNow.getFullYear();
    let targetMonth = monthNow != 12 && yearNow == checkYear ? monthNow : 12;

    for (let i = 1; i <= targetMonth; i++) {
      let obj = {};
      let month = i < 10 ? '0' + i : i + '';
      obj.label = month;
      obj.value = month;
      startMonthArr.push(obj);
    }
    return startMonthArr;
  }

  getInitStartMonthFun = (checkYear) => {
    let dateYearNow = new Date().getFullYear();
    let dateMonthNow = new Date().getMonth() + 1;
    if (dateYearNow == checkYear && this.state.startMonth > dateMonthNow) {
      return '0' + dateMonthNow
    } else {
      return this.state.startMonth;
    }
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  render() {
    let { getFieldDecorator, setFieldsValue } = this.props.form;
    let serialruleColumns = [{
        width:'25%',
        title: '顺序',
        dataIndex: 'categoryName',
        key: 'categoryName',
        render: (text, record, index) => (
            <span>{index + 1}</span>
        )
    }, {
        width:'25%',
        title: '名称',
        dataIndex: 'ruleName',
        key: 'ruleName'
    }, {
        width:'25%',
        title: '状态',
        dataIndex: 'isEnable',
        key: 'isEnable',
        render: (text, record) => (
            <span><i className="enable-o" />&nbsp;{record.isEnable == 'Y' ? '启用' : '停用'}</span>
        )
    },{
        title: '操作',
        render: (text, record) => (
            <span>{record.isEnable == 'Y' ? <Icon style={{color: '#c3bebe'}} type="minus-circle-o" /> : <Icon style={{color: '#c3bebe'}} type="check-circle-o" />}</span>
        )
    }];

    let getStartYearArr = this.getStartYearArrFun();

    return (
      <CustomModal
        title="立卷"
        operate={false}
        visible={this.props.visible}
        //visible={true}
        onCancel={this.actionChange}
        afterClose={this.afterClose}
        width={610}
      >
        <div className="establish-archives" >
          {
            this.state.currentAction == 'establish' && (
            <div>
              <Form className="establish-form">
                <ValidatePopover validatePoppoverId="orgId"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">单位名称</label>
                    <FormItem className="common-long-input">
                      {getFieldDecorator('orgId', {
                        //默认选中第一项
                        initialValue: this.state.selectedOrg,
                        rules: [
                          {
                            required: true,
                            message: '请选择立卷单位',
                          }
                        ],
                      })(
                        <CustomSelect
                          className="longSelect"
                          onChange={(value) => {
                            this.setState({
                              selectedOrg: value
                            });
                          }}
                          dataSource={this.state.orgs}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="fondsNo"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">全宗号</label>
                    <FormItem className="common-long-input">
                      {getFieldDecorator('fondsNo', {
                        initialValue: this.state.fondsNo,
                        rules: [{
                          required: true,
                          message: '请输入全宗号',
                        }, {
                          max: 20,
                          message: '输入长度最大为20',
                        }, {
                          validator: this.checkSpecialCharacterForm
                        }],
                      })(
                        <Input
                          type="text"
                          className="establish-long-input"
                          placeholder="请输入全宗号"
                          onChange={(e) => {
                            this.setState({
                              fondsNo: e.target.value.trim()
                            });
                          }}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId=""
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">起始年</label>
                    <FormItem className="establish-date-select">
                      {getFieldDecorator('startYear', {
                        initialValue: this.state.startYear,
                        rules: [],
                      })(
                        <CustomSelect
                          onChange={(value) => {
                            this.setState({
                              startYear: value,
                              startMonthArr: this.getStartMonthArrFun(value),
                              startMonth: this.getInitStartMonthFun(value)
                            });
                            setFieldsValue({
                              'startMonth': this.getInitStartMonthFun(value)
                            });
                          }}
                          dataSource={getStartYearArr}
                        />
                      )}
                    </FormItem>
                    <label
                      className="common-head-label required-item"
                      style={{
                        borderLeft: 'none'
                      }}
                    >起始月</label>
                    <FormItem className="establish-date-select">
                      {getFieldDecorator('startMonth', {
                        initialValue: this.state.startMonth,
                        rules: [],
                      })(
                        <CustomSelect
                          onChange={(value) => {
                            this.setState({
                              startMonth: value
                            });
                          }}
                          dataSource={this.state.startMonthArr}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="startNum" validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">起始案卷号</label>
                    <FormItem className="common-long-input">
                      {getFieldDecorator('startNum', {
                        initialValue: this.state.startNum,
                        rules: [{
                          required: true,
                          message: '请输入起始案卷号',
                        }, {
                          max: 20,
                          message: '输入长度最大为20',
                        }, {
                          validator: this.checkAllNumber
                        }],
                      })(
                        <Input
                          type="text"
                          className="establish-long-input"
                          placeholder="请输入起始案卷号"
                          onChange={(e) => {
                            this.setState({
                              startNum: e.target.value.trim()
                            });
                          }}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="sysPid" validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">档案目录</label>
                    <FormItem className="common-long-select">
                      {getFieldDecorator('sysPid', {
                        initialValue: this.state.selectedCategoryType,
                        rules: [],
                      })(
                        <CustomSelect
                          onChange={(value) => {
                            this.setState({
                              selectedCategoryType: value
                            });
                          }}
                          dataSource={this.state.categoryTypes}
                        />
                      )}
                    </FormItem>
                    <Button
                      className="edit-btn"
                      onClick={this.needEditCategory}
                      disabled={!(this.state.orgs && this.state.orgs.length > 0)}
                    >
                      编辑
                    </Button>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="recordCode"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">编码</label>
                    <FormItem className="common-long-input">
                      {getFieldDecorator('recordCode', {
                        initialValue: this.state.recordCode,
                        rules: [{
                          required: true,
                          message: '请输入编码',
                        }, {
                          max: 20,
                          message: '输入长度最大为20',
                        }, {
                          validator: this.checkAllLetterNumber
                        }],
                      })(
                        <Input
                          type="text"
                          className="establish-long-input"
                          placeholder="请输入编码"
                          onChange={(e) => {
                            this.setState({
                              recordCode: e.target.value.trim()
                            });
                          }}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <label className="common-head-label" style={{border: 'none'}}>档号规则</label>
                <span className="right-info-span">全宗号-KJ•目录号•年度•月份-保管期限-案卷号-件号</span>
              </Form>
              <div className="custom-modal-operate">
                <Button key="ok" type="primary" onClick={this.sureEstablishAdd} className="sure">
                  确定
                </Button>
              </div>
            </div>
            )
          }
          {
            this.state.currentAction == 'editCategory' && (
              <div>
                <CustomTable
                  expandedRowKeys={this.state.editCategoryExpandedRowKeys}
                  onExpand={this.editCategoryRowExpand}
                  height={344}
                  fixedWidth={650}
                  rowKey = {(record) => record.id}
                  dataSource = {this.state.categories}
                  columns = {this.categoriesColumns}
                  operate = {false}
                  scroll={{y: 300}}
                />
                <div className="custom-modal-operate">
                  <Button key="ok" type="primary" onClick={this.editCategorySubmit} className="sure">
                    确定
                  </Button>
                </div>
              </div>
            )
          }
          {
            this.state.currentAction == 'addCategory' && (
                <div></div>
            )
          }
          {
            this.state.currentAction == 'editSerialRule' && (
            <div className="establish-archives-content">
                <CustomTable
                    rowKey = {(record) => record.id}
                    dataSource = {this.state.serialruleList}
                    columns = {serialruleColumns}
                    pagination = {false}
                />
                <div className="content-footer">

                </div>
            </div>
            )
          }
          {
            this.state.currentAction == 'editOrgAndQue' && (
                <div></div>
            )
          }
        </div>
      </CustomModal>
    )
  }
}

export default Form.create({})(EstablishArchives);