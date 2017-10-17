import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import {Form, Input, Icon, Upload} from 'antd';

import '../../less/common.less';
import '../../less/organization.less';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';
import CustomModal from '../../components/customModal/CustomModal';
import ValidatePopover from '../../components/validatePopover';

let InputGroup = Input.Group;
let FormItem = Form.Item;

class Origanization extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orgImage: '',

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

  //默认记录应为null，不能为{}
  record = null
  //表单验证错误信息
  validateErrors = {}

  componentDidMount() {}

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
        let orgImage = this.state.orgImage;
        reqParam.orgImage = orgImage;

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

  //上传图片之后
  uploadChange = (info) => {
    let formData = new FormData();
    formData.append('file', info.file.originFileObj);
    this.uploadFileFetch({
      reqParam: formData,
      success: (data) => {
        this.setState({
          orgImage: data.imageurl
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

  checkPhone = (rule, value, callback) => {
    let mes;
    value && ( Validator.TEL_NUMBER(value) || (mes = '输入固定电话格式不正确') );
    callback(mes);
  }

  checkWord_chinese = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
    callback(mes);
  }

  checkZipCode = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.ALLNUMBER(value) || (mes = '输入6位邮编') );
    callback(mes);
  }

  afterClose = () => {
    this.validateErrors = {};
    this.setState({
      orgImage: '',
    });
    let fn = this.props.afterClose;
    fn && fn();
  }

  addRecordFetch = ({reqParam, success}) => {
    let thiz = this;
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };
    let completeHandler = function () {
      thiz.setState({
        submitBtn:{
          loading: false
        }
      })
    }
    let url = '/org/add';
    thiz.setState({
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
    this.setState({
      ifShowDelBtnBj: {
        'opacity': 1,
        'transition': 'opacity 0.3s'
      }
    });
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
      orgImage: '',
      ifShowDelBtnBj: {
        'opacity': 0,
        'transition': 'opacity 0s'
      }
    });
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  };

  render() {
    let { getFieldDecorator } = this.props.form;
    let record = this.record = {};

    return (
      <CustomModal
        className="org-manager-wrap"
        title="新增单位"
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        onOk={this.addSubmit}
        width={707}
        onOkLoading={this.state.submitBtn.loading}
      >
        <div className="add-pic">
          <Upload
            className="uploader"
            name="file"
            showUploadList={false}
            customRequest={() => {}}
            onChange={this.uploadChange}
            disabled={!!this.state.orgImage}
          >
            {
              this.state.orgImage ?
                <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                  <img
                    src={this.state.orgImage}
                    alt="单位图片"
                    className="orgImg"
                  />
                  <div
                    className="delBtnBj" style={{...this.state.ifShowDelBtnBj}}>
                    <Icon type="delete" className="delIcon" onClick={this.delImg}/>
                  </div>
                </div> :
                (
                  <div style={{marginTop: 60}}>
                    <Icon type="plus" style={{fontSize:150}}/>
                    <div>单击此处添加单位图片</div>
                  </div>
                )
            }
          </Upload>
        </div>
        <div className="info-input-list">
          <Form>
            <ValidatePopover
              validatePoppoverId="orgCode"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">单位编码</label>
                <FormItem>
                  {getFieldDecorator('orgCode', {
                    initialValue : record.orgCode,
                    rules: [{
                      required: true,
                      message: '请输入单位编码',
                    }, {
                      max: 30,
                      message: '输入长度最大为30',
                    }/*, {
                      validator: this.checkWord_chinese
                    }*/],
                  })(
                    <Input
                      placeholder="请输入单位编码"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover
              validatePoppoverId="orgName"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label required-item">单位名称</label>
                <FormItem>
                  {getFieldDecorator('orgName', {
                    initialValue: record.orgName,
                    rules: [{
                      required: true,
                      message: '请输入单位名称',
                    }, {
                      max: 30,
                      message: '输入长度最大为30',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input
                      placeholder="请输入单位名称"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover
              validatePoppoverId="contacter"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label">联系人</label>
                <FormItem>
                  {getFieldDecorator('contacter', {
                    initialValue : record.contacter,
                    rules: [{
                      max: 30,
                      message: '输入长度最大为30',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input
                      placeholder="请输入联系人"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover
              validatePoppoverId="phone"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label">固定电话</label>
                <FormItem>
                  {getFieldDecorator('phone', {
                    initialValue : record.phone,
                    rules: [{
                      validator: this.checkPhone
                    }],
                  })(
                    <Input
                      placeholder="请输入固定电话"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover
              validatePoppoverId="zipcode"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label">邮编</label>
                <FormItem>
                  {getFieldDecorator('zipcode', {
                    initialValue : record.zipcode,
                    rules: [{
                      len: 6, message: '请输入6位邮编'
                    }, {
                      validator: this.checkZipCode
                    }],
                  })(
                    <Input
                      placeholder="请输入邮编"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
            <ValidatePopover
              validatePoppoverId="address"
              validateErrors={this.validateErrors}
            >
              <InputGroup className="common-has-label" compact>
                <label className="common-head-label">地址</label>
                <FormItem>
                  {getFieldDecorator('address', {
                    initialValue : record.address,
                    rules: [{
                      max: 100,
                      message: '输入长度最大为100',
                    }, {
                      validator: this.checkWord_chinese
                    }],
                  })(
                    <Input
                      placeholder="请输入地址"
                    />
                  )}
                </FormItem>
              </InputGroup>
            </ValidatePopover>
          </Form>
        </div>
      </CustomModal>
    )
  }
}

export default Form.create({})(Origanization);