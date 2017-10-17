import React from 'react';
import {Form, Modal, Input, Upload, Tabs, Button} from 'antd';

import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import userStore from '../../stores/userStore'
import '../../less/common.less';
import './userState.less'
import userAvatar from '../../images/default-head-img.png';

import ValidatePopover from '../../components/validatePopover';
import {errorNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable';
import CustomModal from '../../components/customModal/CustomModal';

let InputGroup = Input.Group;
let FormItem = Form.Item;
const TabPane = Tabs.TabPane;

const columns = [{
  title: '授权单位',
  dataIndex: 'orgName',
  width: 150,
  key: 'orgName'
}, {
  title: '角色',
  dataIndex: 'roleName',
  key: 'roleName'
}];

class UserState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalKey: Math.random(),
      visible: this.props.visible,
      user: {},
      currentHeadImage: ''
    };
  }

  formSubmit = () => {
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
        let postBody = {...fields};
        postBody.id = userStore.getUser().id;
        postBody.headImage = this.state.currentHeadImage || this.props.userDetail.headImage;
        let successHandler = (response) => {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            let {datas} = response;
            userStore.setUser({
              realName: datas.realName,
              headImage: datas.headImage
            })
            this.props.onCancel();
          } else {
            errorNotice(response.msg);
          }
        };
        let errorHandler = (error) => {
          errorNotice('未知错误');
        };

        let url = cKit.makeUrl('/user/person/update');
        //验证登录信息
        let ajax = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        ajax.submit();
      }
    });
  }

  uploadChange = (info) => {
    let formData = new FormData();
    formData.append('file', info.file.originFileObj);
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let {datas} = response;
        this.setState({
          currentHeadImage: datas.imageurl
        })
      } else {
        errorNotice(response.msg);
      }
    };
    let errorHandler = (error) => {
      errorNotice(error);
    }
    let url = cKit.makeUrl('/image/upload');
    //验证登录信息
    let ajax = new netKit.FormCorsPostAction(null, url, formData, successHandler, errorHandler);
    ajax.submit();
  }

  afterClose = () => {
    this.validateErrors = {};
    this.setState({
      modalKey: Math.random(),
      currentHeadImage: ''
    })
  }

  componentWillMount = () => {
  }


  render() {
    const {getFieldDecorator} = this.props.form;
    const userDetail = this.props.userDetail;
    const userCorpRolesList = this.props.userCorpRolesList;
    return (
      <CustomModal
        style={{top: 60}}
        key={this.state.modalKey}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
        width={420}
        footer={null}
        maskClosable={false}
        title={"我的状态"}
        operate={
          !this.props.isView &&
          <Button type="primary" onClick={this.formSubmit}>
            确定
          </Button>
        }
      >
        <div className="user-state-form clearFloat">
          <Upload
            className="user-avatar-upload"
            name="file"
            showUploadList={false}
            customRequest={() => {
            }}
            onPreview={() => {
            }}
            onChange={this.uploadChange}
          >
            <img className="user-avatar"
                 src={this.state.currentHeadImage || userDetail.headImage ? this.state.currentHeadImage || userDetail.headImage : userAvatar}
                 alt="头像"/>
          </Upload>

          <Form>
            <Tabs defaultActiveKey="1" className='profile-tab-tabs'>
              <TabPane tab={<span>个人信息</span>} key="1" className='profile-tab-pane'>
                <ValidatePopover validatePoppoverId="userName"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">用户账号</label>
                    <FormItem>
                      {getFieldDecorator('userName', {
                        initialValue: userDetail.userName,
                        rules: [],
                      })(
                        <Input className="form-element" placeholder="请输入用户账号" disabled={true}/>
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="email"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">用户邮箱</label>
                    <FormItem>
                      {getFieldDecorator('email', {
                        initialValue: userDetail.email,
                        rules: [{
                          required: true,
                          message: '请输入用户邮箱',
                        }],
                      })(
                        <Input className="form-element" placeholder="请输入用户邮箱"/>
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="realName"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label required-item">姓名</label>
                    <FormItem>
                      {getFieldDecorator('realName', {
                        initialValue: userDetail.realName,
                        rules: [{
                          required: true,
                          whitespace: true,
                          message: '请输入姓名',
                        }, {
                          max: 20,
                          message: '输入长度需小于20',
                        }],
                      })(
                        <Input className="form-element" placeholder="请输入姓名"/>
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="post"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label">所属部门</label>
                    <FormItem>
                      {getFieldDecorator('post', {
                        initialValue: userDetail.post,
                        rules: [{
                          max: 40,
                          message: '输入长度需小于40',
                        }],
                      })(
                        <Input className="form-element" placeholder="请输入部门"/>
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="duty"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label">职务</label>
                    <FormItem>
                      {getFieldDecorator('duty', {
                        initialValue: userDetail.duty,
                        rules: [{
                          max: 20,
                          message: '输入长度需小于20',
                        }],
                      })(
                        <Input className="form-element" placeholder="请输入职务"/>
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
                <ValidatePopover validatePoppoverId="mobile"
                                 validateErrors={this.validateErrors}>
                  <InputGroup className="common-has-label" compact>
                    <label className="common-head-label">联系电话</label>
                    <FormItem>
                      {getFieldDecorator('mobile', {
                        initialValue: userDetail.mobile,
                        rules: [],
                      })(
                        <Input className="form-element" placeholder="请输入联系电话"/>
                      )}
                    </FormItem>
                  </InputGroup>
                </ValidatePopover>
              </TabPane>
              <TabPane tab={<span>授权单位</span>} key="2" className='profile-tab-pane'>
                <CustomTable
                  columns={columns}
                  dataSource={userCorpRolesList}
                  scroll={{y: 240}}
                  operate={false}
                  className='profile-table'
                />
              </TabPane>
            </Tabs>
          </Form>
        </div>
      </CustomModal>
    );
  }
}

UserState = Form.create({})(UserState);
export default UserState;