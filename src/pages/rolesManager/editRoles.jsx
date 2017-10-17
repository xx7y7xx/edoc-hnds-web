import React from 'react';
import {Form, Input, Button} from 'antd';
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

class EditUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentRoleId: ''
        };
    }

    componentDidMount = () => {
    }

    editRecordFetch = ({reqParam, success}) => {
        const thiz = this;
        const {setFieldsValue} = this.props.form
        let successHandler = (response) => {
            let {msg, datas} = response;
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                success && success(datas);
                notice(msg);
                thiz.props.afterClose();
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

        let url = '/role/update';
        netKit.postFetch({
            url,
            data: reqParam,
            success: successHandler,
            error: errorHandler
        });
    }


    // 编辑角色表单

    editSubmit = () => {
        //预制角色不能修改
        if(this.props.record.isSystem == 'Y'){
            this.props.onCancel();
            return;
        }
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
                this.editRecordFetch({
                    reqParam,
                    success: () => {
                        this.props.success(reqParam);
                    }
                });
            }
        });
    }
    checkWord_chinese = (rule, value, callback) => {
        let mes;
        value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
        callback(mes);
    }

    afterClose = () => {
        this.validateErrors = {};
        this.props.afterClose();
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const record = this.props.record
        return (
            <CustomModal
                title={'编辑角色'}
                style={{top: 60}}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                afterClose={this.afterClose}
                width={392}
                operate={false}
            >
                <div className="add-user-form clearFloat"
                  style={{overflow: 'hidden'}}
                >
                    <Form style={{height: 300}}>
                        <FormItem style={{display:'none'}}>
                            {getFieldDecorator('id', {
                                initialValue: record.id,
                                rules: [],
                            })(
                                <Input type="hidden"/>
                            )}
                        </FormItem>

                        <ValidatePopover validatePoppoverId="roleCode"
                                         validateErrors={this.validateErrors}>
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">角色编码</label>
                                <FormItem>
                                    {getFieldDecorator('roleCode', {
                                        initialValue: record.roleCode,
                                        rules: [],
                                    })(
                                        <Input className="form-element" placeholder="请输入角色编码" disabled={true}/>
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
                                        initialValue: record.roleName,
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
                                        <Input type="text" className="form-element" placeholder="请输入角色名称" disabled={record.isSystem == 'Y'}/>
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
                                        initialValue: record.description,
                                        rules: [{
                                            max: 50,
                                            message: '输入长度最大为50',
                                        }],
                                    })(
                                        <Input type="textarea" rows={4} className="form-element" placeholder="请输入角色描述" disabled={record.isSystem == 'Y'}/>
                                    )}
                                </FormItem>
                            </InputGroup>
                        </ValidatePopover>
                    </Form>
                    <Button type="primary" onClick={this.editSubmit} className="submit-btn">
                        确定
                    </Button>
                </div>
            </CustomModal>
        );
    }
}

EditUser = Form.create({})(EditUser);
export default EditUser;