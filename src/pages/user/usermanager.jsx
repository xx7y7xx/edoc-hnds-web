import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import Topbar from '../../components/topBar/Topbar';
import { Title } from '../../components/Title';
import {Form, Button, Icon, Tooltip} from 'antd';
import $ from 'jquery';
import '../../less/common.less';
import '../../less/userManager.less';
import CustomTable from '../../components/customTable/CustomTable';
import CustomIcon from '../../components/customIcon/CustomIcon';
import CustomModal from '../../components/customModal/CustomModal';
import {notice, errorNotice} from '../../components/Common';
import CustomSelect from '../../components/CustomSelect';
import {Validator}  from '../../utils/base/validator';
import EditUser from './editUser';
import AddUser from './addUser';
import AddOrganization from '../orgManager/addOrganization';
import AddRole from '../rolesManager/addRoles';
import userStore from "../../stores/userStore";

class userManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,

      total: 0,
      page: 1,
      size: 10,
      pageList: [],

      roles: [],
      defaultRoleId: '2',
      orgs: [],
      orgInfos: [],

      //添加或修改用户
      isAdding: false,
      isEditing: false,
      isAccrediting: false,
      record: {},

      userDeleteBtn: true,
      sendNotifiesBtn: true, // 通知按钮的状态
      userStopBtn: true, // 停用按钮的状态
      userStartBtn: true,  // 启用按钮的状态

      //新增组织
      isAddingOrg: false,
      //新增角色
      isAddingRole: false,

      accreditSelectInfos: [{}],
      isInviting: false,

      //高级搜索
      keyword: '',
      //选中记录信息（当前页）
      selectedRecords: [],
      //表单验证错误信息
      validateErrors: {},
      userState: {
        0: '未激活',
        1: '启用',
        2: '停用'
      },
      needAction: {
        //未激活
        '0': (record) => <Tooltip onClick={() => this.sendNotifies(record)} title="通知">
              <Icon type="mail" className="operate-icon"/>
            </Tooltip>,
        //已启用
        '1': (record) => <Tooltip onClick={() => this.setUsersStatus('stop', record)} title="停用">
              <Icon type="minus-circle-o" className="operate-icon"/>
            </Tooltip>,
        //已停用
        '2': (record) => <Tooltip onClick={() => this.setUsersStatus('start', record)} title="启用">
              <Icon type="check-circle-o" className="operate-icon" />
            </Tooltip>,
      }
    }

    this.columns = [{
        width: '18%',
        title: '用户账号',
        dataIndex: 'userName',
        key: 'userName',
      }, {
        width: '13%',
        title: '姓名',
        dataIndex: 'realName',
        key: 'realName',
      }, {
        width: '20%',
        title: '注册时间',
        dataIndex: 'createTime',
        key: 'createTime',
      }, {
        width: '20%',
        title: '登录信息',
        dataIndex: 'loginInfo',
        key: 'loginInfo',
        render: (text, record) => {
          let title = `${record.lastLogin}\n${record.lastLoginIp}`;
          return <span title={title}>
            {record.lastLogin}
            <br />
            {record.lastLoginIp}
          </span>
        }
      }, {
        width: '8%',
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          let state = this.state.userState[record.status || 0];
          return (
            <span title={state}>
              {state}
            </span>
          );
        }
      }, {
        title: '操作',
        render:
          (text, record) => (
            <span>
              {this.state.needAction[record.status || 0](record)}
              <Tooltip onClick={() => this.editUser(record)} title="编辑">
                <Icon type="edit" className="operate-icon" />
              </Tooltip>
              <Tooltip onClick={() => this.isDeleteRecord(record)} title="删除">
                <Icon type="delete" className="dangerous-icon"/>
              </Tooltip>
              <Tooltip title="授权">
                {/*span为必须，否则Tooltip无效*/}
                <span>
                  <CustomIcon onClick={() => {this.accredit(record)}} type="accredit" />
                </span>
              </Tooltip>
            </span>
          )
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

  addUser = () => {
    this.setState({
      record: {},
      isAdding: true,
    });
  }
  editUser = (record) => {
    let id = record.id;
    this.getRecordDetailFetch({
      reqParam: {id},
      success: (record) => {
        this.setState({
          record,
          isEditing: true,
        })
      }
    });
  }
  addOrEditCancel = () => {
    this.setState({
      isAdding: false,
      isEditing: false,
    })
  }

  //修改用户状态
  setUsersStatus = (action, record) => {//不传record为批量操作
    let willStatus = action == 'stop' ? 2 : 1;
    let nowStatus = willStatus == 1 ? 2 : 1;
    let isBatch = !record;
    let records = isBatch ? this.state.selectedRecords : [record];

    let reqParam = this.filterRecords(records, (item, results) => {
      return item.status == nowStatus && {
        status: willStatus,
        id: item.id
      };
    });
    if(reqParam.length){
      this.editRecordFetch({
        reqParam,
        success: () => {
          this.modifyLocalRecords(reqParam, (target) => {
            target.status = willStatus;
          });

          // 改变底部按钮状态
          this.judgeBtnIsDisabled(this.state.selectedRecords)
        }
      });
    } else {
      let statusName = willStatus == 1 ? '停用' : '启用';
      let msg = `请勾选${statusName}用户`
      notice(msg);
    }
  }

  //授权
  accredit = (record) => {
    this.setState({record});
    this.getDropdownOptionsFetch({
      type: 'role',
      success: (roles) => {
        let defaultRoleId = roles[0].value;
        this.setState({
          roles,
          defaultRoleId,
        });
        this.refreshUserRoles(record.id, Number(defaultRoleId));
      }
    });
  }
  refreshUserRoles = (userId, defaultRoleId) => {
    this.getUserRolesFetch({
      userId,
      success: (datas) => {
        //添加对应roleId,渲染界面时方便处理
        for (let i = 0; i < datas.length; i++) {
          let item = datas[i];
          item.select || (item.roleId = defaultRoleId);
        }

        this.setState({
          isAccrediting: true,
          orgInfos: datas
        });
      }
    });
  }
  sureAccredit = () => {
    let orgInfos = this.state.orgInfos;
    let reqParam = [];
    let userInfo = {
      userId: this.state.record.id
    };
    userInfo.roles = this.filterRecords(orgInfos, (item, results) => {
      return item.select && {
        orgId: item.orgId,
        roleId: item.roleId
      };
    });
    reqParam.push(userInfo);

    this.accreditRolesFetch({
      reqParam,
      success: () => {
        this.accreditCancel();
      }
    });
  }
  accreditCancel = () => {
    this.setState({
      isAccrediting: false,
    });
  }
  afterAccreditClose = () => {
    this.accreditCancel();
  }

  //新增组织
  addOrg = () => {
    this.setState({
      isAddingOrg: true
    });
  }
  addOrgCancel = () => {
    this.setState({
      isAddingOrg: false
    });
  }
  afterAddOrgSubmit = (orgInfo) => {
    this.addOrgCancel();
    let orgInfos = this.state.orgInfos;
    let orgId = orgInfo.id;
    let orgCode = orgInfo.orgCode;
    let orgName = orgInfo.orgName;
    let roleId = this.state.defaultRoleId;
    orgInfos.push({orgId, orgCode, orgName, roleId});
    this.setState({orgInfos});
  }

  //新增角色
  addRole = () => {
    this.setState({
      isAddingRole: true
    });
  }
  addRoleCancel = () => {
    this.setState({
      isAddingRole: false
    });
  }
  afterAddRoleSubmit = (roleInfo) => {
    let roles = this.state.roles;
    let value = roleInfo.id + '';
    let label = roleInfo.roleName;
    roles.push({value, label});
    this.setState({roles});
  }


  //通知
  sendNotifies = (record) => {
    let isBatch = !record;
    let records = isBatch ? this.state.selectedRecords : [record];
    let reqParam = this.filterRecords(records,(item, results) => {
      return !item.status && {id: item.id};
    });
    if(reqParam.length){
      this.sendNotifiesFetch({reqParam});
    } else {
      notice('请勾选未激活用户');
    }
  }

  //删除
  isDeleteRecord = (record) => {
    let isBatch = !record;
    let records = isBatch ? this.state.selectedRecords : [record];
    if(records.length){
      CustomModal.confirm({
        title: '温馨提示',
        content: '确认要删除吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          let reqParam = [];
          for (let i = 0; i < records.length; i++) {
            let item = records[i];
            reqParam.push({
              id: item.id
            });
          }
          this.deleteRecordsFetch({
            reqParam,
            success: () => {
              this.updateLocalRecords(reqParam);
            }
          });
        }
      });
    } else {
      notice('请至少勾选一条记录');
    }
  }

  //邀请
  // inviteUser = (record) => {
  //   this.setState({
  //     isInviting: true
  //   });

  //   //AJAX缓存
  //   this.getDropdownOptionsFetch({
  //     type: 'role',
  //     success: (roles) => {
  //       this.setState({roles});
  //     }
  //   });
  //   this.getDropdownOptionsFetch({
  //     type: 'org',
  //     success: (orgs) => {
  //       this.setState({orgs});
  //     }
  //   });
  // }
  // inviteSubmit = () => {
  //   this.props.form.validateFields((err, fields) => {
  //     //每次表单验证，重置错误信息
  //     let validateErrors = this.state.validateErrors = {};
  //     if (err) {
  //       for (let i in err) {
  //         validateErrors[err[i].errors[0].field] = {
  //           visible: true,
  //           message: err[i].errors[0].message,
  //           className: 'validator-popover-error'
  //         };
  //       }
  //     } else {
  //       let {inviteOrgs, inviteRole, inviteEmail} = fields;
  //       let reqParam = [];
  //       let details = [];
  //       for (let i = 0; i < inviteOrgs.length; i++) {
  //         let orgId = Number(inviteOrgs[i]);
  //         details.push({
  //           orgId,
  //           roleId: Number(inviteRole)
  //         })
  //       }
  //       let inviteEmails = inviteEmail.split(/\s*;\s*/);
  //       for (let i = 0; i < inviteEmails.length; i++) {
  //         let email = inviteEmails[i];
  //         email && reqParam.push({email, details});
  //       }
  //       this.inviteUserFetch({
  //         reqParam,
  //         success: () => {
  //           this.inviteCancel();
  //         }
  //       });
  //     }
  //   });
  // }
  // inviteCancel = () => {
  //   this.setState({
  //     isInviting: false
  //   });
  // }
  // afterInviteClose = () => {
  //   this.state.validateErrors = {};
  // }

  //更新本地数据
  modifyLocalRecords = (modifiedRecords, cb) => {
    let pageList = this.state.pageList;
    let selectedRecords = this.state.selectedRecords;
    modifiedRecords.forEach((modifiedRecord) => {
      pageList.forEach(function (item, i){
        let modifiedRecordId = modifiedRecord.id;
        if(item.id == modifiedRecordId){
          if(cKit.isFunction(cb)){//执行回调
            cb(item, modifiedRecord, pageList, modifiedRecords)

          } else {//直接替换为目标值
            item = pageList[i] = modifiedRecord;
          }
          //已选中的项也更新
          selectedRecords.forEach((one, ii, arr) => {
            if(one.id == modifiedRecordId){
              arr[ii] = item;
            }
          });
        }
      });
    });
    this.setState({pageList});
  }

  //更新本地数据
  updateLocalRecords = (delRecords) => {
    let {page, pageList} = this.state;
    if(delRecords){
      let selectedRecords = this.state.selectedRecords;
      if(delRecords.length >= pageList.length){//删除本页所有数据
        selectedRecords.length = 0; //清空选中数据
        page > 1 && page--; //有上一页数据时
      } else {
        //也清空本地数据，否则多次删除时会重复提交数据
        delRecords.forEach((delRecord) => {
          selectedRecords.forEach((item, i, arr) => {
            if(item.id == delRecord.id){
              arr.splice(i, 1);
            }
          });
        });
      }
      this.setState({
        userDeleteBtn: !selectedRecords.length
      });
    }
    this.getRecordsFetch({
      page,
    });
  }

  checkEmail = (rule, value, callback) => {
    cKit.isString(value) && (value = value.trim());
    let mes;
    if(rule.field == 'inviteEmail'){
      var emails=(value || '').split(/\s*;\s*/);
      for (let i = 0; i < emails.length; i++) {
        let item = emails[i];
        if(item && !Validator.EMAIL(item)){
          mes = '输入邮箱格式不正确';
          break;
        }
      }
    }

    callback(mes);
  }

  filterRecords = (records, cb) => {
    let results = [];
    for (let i = 0; i < records.length; i++) {
      let record = records[i];
      let cbReturn = cb(record, results);
      cbReturn === false || results.push(cbReturn);
    }
    return results;
  }

  pageChange = (page, size) => {
    this.getRecordsFetch({
      page,
      size,
    });

    //清空上面操作
    this.setState({
      userDeleteBtn: true,
    });
  }


  getRecordDetailFetch = ({reqParam, isEdit, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {datas} = response;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/user/query';
    netKit.getFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  getRecordsFetch = ({
    keyword = this.state.keyword,
    page = this.state.page,
    size = this.state.size
  }) => {
    //page最小为1
    page <= 0 && (page  = 1);
    this.setState({
      loading: true,
      selectedRecords: [],
    });
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {total, pageList, page} = response.datas;
        this.setState({
          page,
          size,
          keyword,
          total,
          pageList,
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/user/list';
    netKit.getFetch({
      url,
      data: {keyword, page, size },
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.setState({
          loading: false
        });
      }
    });
  }

  deleteRecordsFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        notice(msg)
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/user/del';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  editRecordFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        notice(msg)
        success && success(datas);
      } else {
          errorNotice(response.msg);
      }
    };

    let url = '/user/enable';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  inviteUserFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg)
      } else {
          errorNotice(response.msg);
      }
    };

    let url = '/invite/add';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  sendNotifiesFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg)
      } else {
          errorNotice(response.msg);
      }
    };

    let url = '/user/sendnotify';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  accreditRolesFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg)
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/user/roleset';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  getUserRolesFetch = ({userId, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        success && success(response.datas);
      }else {
        errorNotice(response.msg);
      }
    };

    let url = '/role/userlist';
    netKit.getFetch({
      url,
      data: {userId},
      success: successHandler,
      error: this.errorHandler
    });
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

    let url = type == 'role' ? '/role/dropdown' : '/org/dropdown';
    netKit.getFetch({
      url,
      data: {},
      success: successHandler,
      error: this.errorHandler
    });
  }

  judgeBtnIsDisabled = (selectedRows) => { // 判断底部“启用”、“停用”、“通知”按钮的状态
    let userId = userStore.getUser().id;
    let len = selectedRows.length
    this.setState({
      sendNotifiesBtn: true,
      userStopBtn: true,
      userStartBtn: true,
    });
    if (len == 1 && selectedRows[0].id == userId) {
      this.setState({
        userDeleteBtn: true,
      });
      return;
    }
    if (len > 0) {
      for (let i=0; i<len; i++) {
        if (selectedRows[i].status === 0 && selectedRows[i].id != userId) {
          this.setState({
            sendNotifiesBtn: false
          });
          continue;
        }
        if (selectedRows[i].status === 1 && selectedRows[i].id != userId) {
          this.setState({
            userStopBtn: false
          })
          continue;
        }
        if (selectedRows[i].status === 2 && selectedRows[i].id != userId) {
          this.setState({
            userStartBtn: false
          })
          continue;
        }
      }
    }
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  render() {
      const { setFieldsValue, getFieldValue, getFieldDecorator } = this.props.form;

      // 设置行选择
      const rowSelection = {
        onSelect: (record, selected, selectedRows) => {
          this.state.selectedRecords= selectedRows;
          this.setState({
            userDeleteBtn: !selectedRows.length
          });

          this.judgeBtnIsDisabled(selectedRows)
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          this.state.selectedRecords = selectedRows;
          this.setState({
            userDeleteBtn: !selectedRows.length
          });

          this.judgeBtnIsDisabled(selectedRows)
        }
      };

      let leftBottomRect = (
        <div>
          <Button icon="plus" onClick={() => this.addUser()}
            type="primary" className="left-bottom-btn"
          >新增</Button>
          <Button
            disabled={this.state.userDeleteBtn}
            icon="delete"
            type="danger"
            onClick={() => this.isDeleteRecord()}
            className="left-bottom-btn"
          >删除</Button>
        </div>
      );
      let rightBottomRect=(
        <div>
          <Button
            disabled={this.state.userStartBtn}
            icon="check-circle-o"
            onClick={() => this.setUsersStatus('start')}
            type="primary"
          >启用</Button>
          <Button
            disabled={this.state.userStopBtn}
            icon="minus-circle-o"
            onClick={() => this.setUsersStatus('stop')}
            type="primary"
          >停用</Button>
          <Button
            disabled={this.state.sendNotifiesBtn}
            icon="mail"
            onClick={() => this.sendNotifies()}
             type="primary"
          >通知</Button>
          {/*<span style={{paddingLeft:10}}>
            <Button icon="user" onClick={this.inviteUser} type="primary">用户邀请</Button>
          </span>
          <CustomModal
            title="用户邀请"
            visible={this.state.isInviting}
            onCancel={this.inviteCancel}
            afterClose={this.afterInviteClose}
            onOk={this.inviteSubmit}
            width={400}
            maskClosable={false}
          >
            <div className="invite-wrap">
              <Form>
                <ValidatePopover validatePoppoverId="inviteEmail"
                               validateErrors={this.state.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">用户邮箱</label>
                    <FormItem>
                      {getFieldDecorator('inviteEmail', {
                        rules: [{
                          required: true,
                          message: '请输入用户邮箱',
                        }, {
                          max: 40,
                          message: '输入最大长度为40',
                        }, {
                          validator: this.checkEmail
                        }],
                      })(
                        <Input
                          className="form-element"
                          placeholder="请输入用户邮箱"
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="inviteRole"
                               validateErrors={this.state.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">角色</label>
                    <FormItem>
                      {getFieldDecorator('inviteRole', {
                        rules: [{
                          required: true, message: '请选择角色',
                        }],
                      })(
                        <CustomSelect
                          className="form-element"
                          dataSource={this.state.roles}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover
                  validatePoppoverId="inviteOrgs"
                  validateErrors={this.state.validateErrors}
                >
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">单位</label>
                    <FormItem>
                      {getFieldDecorator('inviteOrgs', {
                        rules: [{
                          required: true, message: '请选择单位',
                        }],
                      })(
                        <CustomSelect
                          mode="multiple"
                          className="form-element"
                          dataSource={this.state.orgs}
                        />
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
              </Form>
            </div>
          </CustomModal>*/}
        </div>
      );

      let accreditColumns = [{
        width: '28%',
        title: '单位名称',
        dataIndex: 'orgName',
        key: 'orgName',
      }, {
        width: '28%',
        title: '单位编码',
        dataIndex: 'orgCode',
        key: 'orgCode',
      }, {
        //width: '20%',
        title: '角色',
        render: (text, record) => {
          //let defaultValue = record.select ? record.roleId : this.state.roles[0].value;
          //给本记录添加默认roleId，提交时方便
          // record.roleId = Number(defaultValue);
          //record.select && console.log(record.roleId)
          return (
            <CustomSelect
              getPopupContainer={(trigger) => {
                return $(trigger).closest('.ant-table-body')[0];
              }}
              style={{ width: '100%' }}
              dataSource={this.state.roles}
              placeholder="请选择角色"
              defaultValue={ record.roleId + '' }
              disabled={!record.select}
              onChange={(value) => {
                record.roleId = Number(value);
              }}
            />
          )
        }
      }];
      // 设置行选择
      const accreditRowSelection = {
        onSelect: (record, selected, selectedRows) => {
          accreditRowSelected(selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          accreditRowSelected(selectedRows);
        },
        getCheckboxProps: (record) => ({
          //disabled: true,    // Column configuration not to be checked
          defaultChecked: record.select,
        })
      };
      let accreditRowSelected = (selectedRows) => {
          //通过setState本地数据orgInfos
          //更新下拉框状态，记录选中数据，方便提交时处理
          let orgInfos = this.state.orgInfos;
          orgInfos.forEach((orgInfo, i, arr) => {
            for (var i = 0, len = selectedRows.length; i < selectedRows.length; i++) {
              let item = selectedRows[i];
              //orgId一定存在，id不一定存在，不授权的没ID
              if(orgInfo.orgId == item.orgId){
                orgInfo.roleId = item.roleId;
                break;
              }
            }
            orgInfo.select = i != len;
          });

          this.setState({orgInfos});
      }
      return (
        <div>
          <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入用户账号、姓名、手机、邮箱"}/>
          <div className="main-content main-content-animate">
            { Title() }
            <div className="userManager">
              {/*授权弹窗*/}
              <CustomModal
                title="用户授权"
                visible={this.state.isAccrediting}
                onOk={this.sureAccredit}
                onCancel={this.accreditCancel}
                afterClose={this.afterAccreditClose}
                width={600}
              >
                <div className="accredit-table-wrap">
                  <CustomTable
                    rowKey = {(record) => record.orgId}
                    rowSelection = {accreditRowSelection}
                    rowClassName={(record, index) =>
                      record.pid == 0 ? 'bold' : ''
                    }
                    dataSource = {this.state.orgInfos}
                    height={394}
                    pagination={false}
                    columns = {accreditColumns}
                    scroll={{y: 280}}
                    fixedWidth={540}
                    leftBottom = {
                      <span>
                        <Button
                          className="left-bottom-btn"
                          icon="plus"
                          onClick={this.addOrg}
                          type="primary"
                        >新增单位</Button>&nbsp;
                        <Button
                          icon="plus"
                          onClick={this.addRole}
                          type="primary"
                        >新增角色</Button>
                      </span>
                    }
                  />
                </div>
              </CustomModal>
                <CustomTable
                  currentPage={this.state.page}
                  rowKey={record => record.id}
                  loading={this.state.loading}
                  rowSelection={rowSelection}
                  dataSource={this.state.pageList}
                  columns={this.columns}
                  onTableChange={this.listHeaderChange}
                  total={this.state.total}
                  onPageChange={this.pageChange}
                  leftBottom={leftBottomRect}
                  rightBottom={rightBottomRect}
                  // pagination ={{
                  //   rightStyle:{
                  //     flex: 30
                  //   }
                  // }}
                />
            </div>
          </div>

          {/*新增用户*/}
          <AddUser
            visible={this.state.isAdding}
            onCancel={this.addOrEditCancel}
            success={
              () => {
                this.setState({
                  isAdding: false
                });
                this.updateLocalRecords();
              }
            }
          />
          {/*编辑用户*/}
          <EditUser
            visible={this.state.isEditing}
            onCancel={this.addOrEditCancel}
            record={this.state.record}
            success={
              (record) => {
                this.setState({
                  isEditing: false
                })
                this.modifyLocalRecords([record]);
              }
            }
          />
          {/*新增单位*/}
          <AddOrganization
            visible = {this.state.isAddingOrg}
            onCancel={this.addOrgCancel}
            success={this.afterAddOrgSubmit}
          />
          {/*新增角色*/}
          <AddRole
            visible={this.state.isAddingRole}
            onCancel={this.addRoleCancel}
            success={this.afterAddRoleSubmit}
            afterClose={this.addRoleCancel}
          />
        </div>
      )
  }
}

export default Form.create({})(userManager)