import React from 'react';
import {Form, Input, Button} from 'antd';

import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import '../../less/common.less';
import './userState.less'

import ValidatePopover from '../../components/validatePopover';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';
import CustomModal from '../../components/customModal/CustomModal';

let InputGroup = Input.Group;
let FormItem = Form.Item;

class ModifyPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalKey: Math.random(),
            visible: this.props.visible,
            user: {},
            currentHeadImage: '',
            checkNewPassword: false,
            newPassword:false
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
                let postBody = {
                    oldpassword: fields.oldPassword,
                    newpassword: fields.newPassword
                }
                //postBody.id = userStore.getUser().id;
                let successHandler = (response) => {
                    if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                        let {msg} = response;
                        notice(msg)
                        this.props.onCancel();
                    } else {
                        errorNotice(response.msg);
                    }
                };
                let errorHandler = (error) => {
                    errorNotice('未知错误');
                };

                let url = cKit.makeUrl('/user/resetpassword');
                //验证登录信息
                let ajax = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
                ajax.submit();
            }
        });
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

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ checkNewPassword: this.state.checkNewPassword || !!value });
    }
    handlePasswordBlur = (e) => {
        const value = e.target.value;
        this.setState({ newPassword: this.state.newPassword || !!value });
    }

    checkNewPassword = (rule, value, callback) => {
        const {getFieldValue} = this.props.form;
        if (value !== getFieldValue('newPassword')) {
            callback('两次密码不一致');
        } else {
            callback();
        }
    }

    passwordConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.newPassword) {
            form.validateFields(['newPassword'], { force: true });
        }
        callback();
    }

    checkConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.checkNewPassword) {
            form.validateFields(['checkNewPassword'], { force: true });
        }
        callback();
    }

    newPassword = (rule, value, callback) => {
        const {getFieldValue} = this.props.form;
        if (value == getFieldValue('oldPassword')) {
            callback('新密码不可与旧密码一致');
        } else {
            callback();
        }
    }



    passwordValidator = (rule, value, callback) => {
        let mes;
        value && ( Validator.SPECIAL_CHARACTER(value) || (mes = '输入6-16位字母、数字、特殊字符') );
        callback(mes);
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <CustomModal
                title={'修改密码'}
                style={{top: 60}}
                key={this.state.modalKey}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                afterClose={this.afterClose}
                width={388}
                operate={
                    <Button type="primary" onClick={this.formSubmit} className="submit-btn">
                        确定
                    </Button>
                }
                // footer={null}
                // maskClosable={false}
            >
                <div className="add-user-form clearFloat">
                    <Form>
                        <ValidatePopover validatePoppoverId="oldPassword"
                                         validateErrors={this.validateErrors}>
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">原密码</label>
                                <FormItem>
                                    {getFieldDecorator('oldPassword', {
                                        rules: [{
                                            required: true,
                                            message: '请输入旧密码！'
                                        },{
                                            validator: this.passwordConfirm
                                        }]
                                    })(
                                        <Input type={'password'} className="form-element" placeholder="请输入旧密码" onBlur={this.handlePasswordBlur}/>
                                    )}
                                </FormItem>
                            </InputGroup>
                        </ValidatePopover>
                        <ValidatePopover validatePoppoverId="newPassword"
                                         validateErrors={this.validateErrors}>
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">新密码</label>
                                <FormItem>
                                    {getFieldDecorator('newPassword', {
                                        rules: [{
                                                required: true,
                                                message: '请输入新密码！'
                                            },{
                                                min: 6,
                                                message: '请输入6-16位密码！'
                                            },{
                                                max: 16,
                                                message: '请输入6-16位密码！'
                                            },{
                                                validator: this.checkConfirm
                                            },{
                                                validator: this.passwordValidator
                                            },{
                                                validator: this.newPassword
                                            }
                                        ],
                                    })(
                                        <Input type={'password'} className="form-element" placeholder="请输入新密码" onBlur={this.handleConfirmBlur} />
                                    )}
                                </FormItem>
                            </InputGroup>
                        </ValidatePopover>
                        <ValidatePopover validatePoppoverId="checkNewPassword"
                                         validateErrors={this.validateErrors}>
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">确认密码</label>
                                <FormItem>
                                    {getFieldDecorator('checkNewPassword', {
                                        rules: [{
                                            required: true,
                                            message: '请确认新密码!'
                                        },{
                                            validator: this.checkNewPassword
                                        }],
                                    })(
                                        <Input type={'password'} className="form-element" placeholder="请再次确认新密码"/>
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

ModifyPassword = Form.create({})(ModifyPassword);
export default ModifyPassword;