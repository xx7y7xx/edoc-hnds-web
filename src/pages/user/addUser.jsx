import React from 'react';
import { Form, Input, Icon, Upload } from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';

import '../../less/common.less';
import '../../less/userManager.less';
import defaultHeadImage from '../../images/default-head-img.png';

import ValidatePopover from '../../components/validatePopover';
import CustomModal from '../../components/customModal/CustomModal';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';

let InputGroup = Input.Group;
let FormItem = Form.Item;

class AddUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headImage: '',

      //控制图片上面的蒙层显示隐藏
      ifShowDelBtnBj: {
        'opacity': 0,
        'transition': 'opacity 0s'
      },
      submitBtn: {
        loading: false
      }
    };
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
        reqParam.headImage = this.state.headImage;

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

  checkEmail = (rule, value, callback) => {
    let mes;
    value && ( Validator.EMAIL(value) || (mes = '输入邮箱格式不正确') );
    callback(mes);
  }
  checkMobile = (rule, value, callback) => {
    let mes;
    value && ( Validator.MOBILE(value) || (mes = '输入手机格式不正确') );
    callback(mes);
  }
  checkLetterNumber = (rule, value, callback) => {
    let mes;
    value && ( Validator.ALLLETTERNUMBER(value) || (mes = '请输入字母或数字') );
    callback(mes);
  }
  checkWord_chinese = (rule, value, callback) => {
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
    callback(mes);
  }

  //上传图片之后
  uploadChange = (info) => {
    let formData = new FormData();
    formData.append('file', info.file.originFileObj);
    this.uploadFileFetch({
      reqParam: formData,
      success: (data) => {
        this.setState({
          headImage: data.imageurl
        });
      }
    });

    this.setState({ // 清除消失删除按钮动画
      ifShowDelBtnBj: {
        'opacity': 0,
        'transition': 'opacity 0s'
      }
    });
  }

  afterClose = () => {
    this.validateErrors = {};
    this.setState({
      headImage: '',
    });
    let fn = this.props.afterClose;
    fn && fn();
  }

  addRecordFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };
    let completeHandler = () => {
      this.setState({
        submitBtn:{
          loading: false
        }
      })
    }
    let url = '/user/add';
    this.setState({
      submitBtn:{
        loading: true
      }
    })
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler,
      complete: completeHandler
    });
  }

  uploadFileFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {datas} = response;
        success && success(datas);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/image/upload';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  handleMouseEnter = () => { // 鼠标移到图片上显示删除按钮
    if (this.state.headImage !== '') {
      this.setState({
        ifShowDelBtnBj: {
          'opacity': 1,
          'transition': 'opacity 0.3s'
        }
      });
    }
  }

  handleMouseLeave = () => { // 鼠标移到图片上隐藏删除按钮
    this.setState({
      ifShowDelBtnBj: {
        'opacity': 0,
        'transition': 'opacity 0.3s'
      }
    });
  }

  delImg = () => { // 删除上传的图片
    this.setState({
      headImage: '',
      ifShowDelBtnBj: {
        'opacity': 0,
        'transition': 'opacity 0s'
      }
    });
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  render() {
    let record = {};
    const { getFieldDecorator } = this.props.form;

    return (
      <CustomModal
        title="新增用户"
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        onOk={this.addSubmit}
        width={394}
        onOkLoading={this.state.submitBtn.loading}
      >
        <div className="add-user-form clearFloat">
          <Upload
            className="user-avatar-upload"
            name="file"
            showUploadList={false}
            //action=""
            customRequest={() => {}}
            //beforeUpload={}
            onChange={this.uploadChange}
            disabled={Boolean(this.state.headImage)}
          >
            {
              <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                <img src={this.state.headImage || defaultHeadImage} alt="头像"/>
                <div
                  className="delBtnBj" style={{...this.state.ifShowDelBtnBj}}>
                  <Icon type="delete" className="delIcon" onClick={this.delImg}/>
                </div>
              </div>
            }
          </Upload>
          <Form>
            <ValidatePopover validatePoppoverId="userName"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">用户账号</label>
                <FormItem>
                  {getFieldDecorator('userName', {
                    initialValue: record.userName,
                    rules: [{
                      required: true,
                      message: '请输入用户账号',
                    }, {
                      max: 20,
                      message: '输入长度最大为20',
                    }, {
                      validator: this.checkLetterNumber
                    }],
                  })(
                    <Input disabled={!!record.id} type="text" className="form-element" placeholder="请输入用户账号" />
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
                    initialValue: record.email,
                    rules: [{
                      required: true,
                      message: '请输入用户邮箱',
                    }, {
                      max: 40,
                      message: '输入长度最大为40',
                    }, {
                      validator: this.checkEmail
                    }],
                  })(
                    <Input className="form-element" placeholder="请输入用户邮箱" />
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
                        initialValue: record.realName,
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: '请输入姓名',
                        }, {
                            max: 20,
                            message: '输入长度最大为20',
                        }, {
                            validator: this.checkWord_chinese
                        }],
                    })(
                        <Input className="form-element" placeholder="请输入姓名" />
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
                    initialValue: record.post,
                    rules: [{
                      max: 40,
                      message: '输入长度最大为40',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input className="form-element" placeholder="请输入部门" />
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
                    initialValue: record.duty,
                    rules: [{
                      max: 20,
                      message: '输入长度最大为20',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input className="form-element" placeholder="请输入职务" />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover validatePoppoverId="mobile"
                           validateErrors={this.validateErrors}>
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label">手机</label>
                <FormItem>
                  {getFieldDecorator('mobile', {
                    initialValue: record.mobile,
                    rules: [{
                      validator: this.checkMobile
                    }],
                  })(
                    <Input className="form-element" placeholder="请输入手机" />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
          </Form>
        </div>
      </CustomModal>
    );
  }
}

AddUser = Form.create({})(AddUser);
export default AddUser;