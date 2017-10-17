import React from 'react';
import {Form, Input, Icon, Tree, Steps, Button} from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import userStore from "../../stores/userStore"

import '../../less/common.less';
import '../../less/rolesManager/addRoles.less';

import ValidatePopover from '../../components/validatePopover';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';
import CustomModal from '../../components/customModal/CustomModal';

let InputGroup = Input.Group;
let FormItem = Form.Item;
const Step = Steps.Step;
const TreeNode = Tree.TreeNode;

const steps = [{
  title: '新增角色'
}, {
  title: '角色授权'
}];

class AddRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      currentRoleId: '',
      checkedKeys: [],
      currentPermTree: [],
      //expandedKeys: []
      submitBtn: {
        loading: false
      }
    };
  }

  componentDidMount = () => {
    this.setState({
      currentStep: 0
    })
  }

  addOrEditRecordFetch = ({reqParam, success}) => {
    const thiz = this;
    const {setFieldsValue} = this.props.form
    let successHandler = (response) => {
      let {msg, datas} = response;
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        success && success(datas);
        //notice(msg);
        thiz.setState({
          currentRoleId: datas.id
        })
        this.next();
        //this.props.afterClose();
      } else if (response.code == '10041') {
        setFieldsValue({
          roleName: ''
        });
        errorNotice(msg);
      } else if (response.code == '10042') {
        setFieldsValue({
          roleCode: ''
        });
        errorNotice(msg);
      } else {
        errorNotice(response.msg);
      }
    };

    let errorHandler = (error) => {
      errorNotice(error);
    };
    let completeHandler = () => {
      this.setState({
        submitBtn: {
          loading: false
        }
      })
    };

    let url = '/role/add';
    this.setState({
      submitBtn: {
        loading: true
      }
    })
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: errorHandler,
      complete: completeHandler
    });
  }


  // 新增角色表单
  next = () => {
    const currentStep = this.state.currentStep + 1;
    this.setState({currentStep: currentStep});
    this.getPremTree();
  }

  addSubmit = () => {
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
        let reqParam = {...fields};
        reqParam.corpId = userStore.getUser().corp.id;
        reqParam.isEnable = 'Y';
        this.addOrEditRecordFetch({
          reqParam,
          success: (datas) => {
            this.props.success(datas);
          }
        });
      }
    });
  }

  checkWord = (rule, value, callback) => {
    let mes;
    value && ( Validator.WORD(value) || (mes = '请输入字母、数字或下划线') );

    callback(mes);
  }

  checkWord_chinese = (rule, value, callback) => {
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
    callback(mes);
  }

  afterClose = () => {
    this.validateErrors = {};
    this.setState({
      currentStep: 0
    })
    let fn = this.props.afterClose;
    fn && fn();
  }

  // 角色授权
  onCheck = (checkedKeys, info) => {
    let checkedKeyObj = [];
    for (let i in checkedKeys) {
      checkedKeyObj.push(JSON.parse(checkedKeys[i]))
    }
    for (let i in info.halfCheckedKeys) {
      checkedKeyObj.push(JSON.parse(info.halfCheckedKeys[i]))
    }
    this.setState({
      checkedKeys: checkedKeyObj
    })
  }
  onSelect = (selectedKeys, info) => {
    //this.onCheck(selectedKeys)
  }

  getPremTree = () => {
    const thiz = this;
    let successHandler = (response) => {
      let {datas} = response;
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.setState({
          currentPermTree: datas
        })
      } else {
        errorNotice(response.msg);
      }
    };

    let errorHandler = (error) => {
      errorNotice(error);
    };

    let url = cKit.makeUrl('/permission/tree?roleId=' + this.state.currentRoleId);
    let action = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    action.submit();
  }

  accreditSubmit = () => {
    let successHandler = (response) => {
      let {msg} = response;
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        notice(msg)
        let fn = this.props.afterClose;
        fn && fn();
      } else {
        errorNotice(response.msg);
      }
    };

    let errorHandler = (error) => {
      errorNotice(error);
    };
    let completeHandler = () => {
      this.setState({
        submitBtn: {
          loading: false
        }
      })
    };

    let url = cKit.makeUrl('/role/permtree');
    let postBody = {
      roleId: this.state.currentRoleId,
      perms: this.state.checkedKeys
    }
    let action = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler, completeHandler);
    this.setState({
      submitBtn: {
        loading: true
      }
    })
    action.submit();
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const loop = data => data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode key={JSON.stringify(
            {
              id: item.id,
              type: item.type
            }
          )} title={item.name}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={JSON.stringify(
        {
          id: item.id,
          type: item.type
        }
      )} title={item.name}/>;
    });
    return (
      <CustomModal
        title={'新增角色'}
        style={{top: 60}}
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        width={392}
        operate={false}
      >
        <div className="add-user-form clearFloat"
          style={{overflow: 'hidden'}}
        >
          <div className="role-add-steps">
            <Steps current={this.state.currentStep}>
              {steps.map(item => <Step key={item.title} title={item.title}/>)}
            </Steps>
          </div>
          {
            this.state.currentStep === 0
            &&
            (
              <div className="">
                <Form style={{height: 300, overflowY: 'auto'}}>
                  <ValidatePopover validatePoppoverId="roleCode"
                                   validateErrors={this.validateErrors}>
                    <InputGroup className="common-has-label" compact>
                      <label className="common-head-label required-item">角色编码</label>
                      <FormItem>
                        {getFieldDecorator('roleCode', {
                          rules: [{
                            required: true,
                            message: '请输入角色编码',
                          }, {
                            max: 20,
                            message: '输入长度最大为20',
                          }, {
                            validator: this.checkWord
                          }],
                        })(
                          <Input className="form-element" placeholder="请输入角色编码"/>
                        )}
                      </FormItem>
                    </InputGroup>
                  </ValidatePopover>

                  <ValidatePopover validatePoppoverId="roleName"
                                   validateErrors={this.validateErrors}>
                    <InputGroup className="common-has-label" compact>
                      <label className="common-head-label required-item">角色名称</label>
                      <FormItem>
                        {getFieldDecorator('roleName', {
                          rules: [{
                            required: true,
                            message: '请输入角色名称',
                          }, {
                            max: 20,
                            message: '输入长度最大为20',
                          }, {
                            validator: this.checkWord_chinese
                          }],
                        })(
                          <Input type="text" className="form-element"
                                 placeholder="请输入角色名称"/>
                        )}
                      </FormItem>
                    </InputGroup>
                  </ValidatePopover>

                  <ValidatePopover validatePoppoverId="description"
                                   validateErrors={this.validateErrors}>
                    <InputGroup className="common-has-label" compact>
                      <label className="common-head-label common-textarea-head-label">角色描述</label>
                      <FormItem>
                        {getFieldDecorator('description', {
                          rules: [{
                            max: 50,
                            message: '输入长度最大为50',
                          }],
                        })(
                          <Input type="textarea" rows={4} className="form-element"
                                 placeholder="请输入角色描述"/>
                        )}
                      </FormItem>
                    </InputGroup>
                  </ValidatePopover>
                </Form>
                <Button type="primary" onClick={this.addSubmit} className="submit-btn" loading={this.state.submitBtn.loading}>
                  授权<Icon type="right"/>
                </Button>
              </div>
            )
          }
          {
            this.state.currentStep === 1
            &&
            <div className="steps-content animated fadeIn">
              <div style={{height: 300, overflowY: 'auto'}}>
                <Tree
                  className='menu-perm-tree'
                  //showLine
                  checkable
                  onCheck={this.onCheck}
                  onSelect={this.onSelect}
                  showIcon={true}
                >
                  {loop(this.state.currentPermTree)}
                </Tree>
              </div>
              <Button type="primary" onClick={this.accreditSubmit} className="submit-btn" loading={this.state.submitBtn.loading}>
                确定
              </Button>
            </div>
          }
        </div>
      </CustomModal>
    );
  }
}

AddRole = Form.create({})(AddRole);
export default AddRole;