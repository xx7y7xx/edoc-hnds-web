import React from 'react';
import CustomModal from '../../components/customModal/CustomModal';
import {Form, Input} from 'antd';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';
import ValidatePopover from '../../components/validatePopover';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
let InputGroup = Input.Group;
let FormItem = Form.Item;
class AddParam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            submitBtn: {
                loading: false
            }
        };
    }
    //默认记录应为null，不能为{}
    record = null
    //表单验证错误信息
    validateErrors = {}
    checkWord_chinese = (rule, value, callback) => {
        //cKit.isString(value) && (value = value.trim());
        let mes;
        value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
        callback(mes);
    }
    afterClose = () => {
        this.validateErrors = {};

        let fn = this.props.afterClose;
        fn && fn();
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
        let url = '/params/add';
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
    errorHandler = (error) => {
        errorNotice('未知错误');
    }

    render() {
        let { getFieldDecorator } = this.props.form;
        let record = this.record = {};
        return (
            <CustomModal
                className="org-manager-wrap"
                title="新增参数"
                visible={this.props.visible}
                onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
                afterClose={this.afterClose}
                onOk={this.addSubmit}
                width={500}
                onOkLoading={this.state.submitBtn.loading}
            >
                <div className="info-input-list">
                    <Form>
                        <ValidatePopover
                            validatePoppoverId="code"
                            validateErrors={this.validateErrors}
                        >
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">参数编码</label>
                                <FormItem>
                                    {getFieldDecorator('code', {
                                        initialValue: record.code,
                                        rules: [{
                                            required: true,
                                            message: '请输入参数编码',
                                        }, {
                                            max: 30,
                                            message: '输入长度最大为30',
                                        }/*, {
                                         validator: this.checkWord_chinese
                                         }*/],
                                    })(
                                        <Input
                                            placeholder="请输入参数编码"
                                        />
                                    )}
                                </FormItem>
                            </InputGroup>
                        </ValidatePopover>
                        <ValidatePopover
                            validatePoppoverId="name"
                            validateErrors={this.validateErrors}
                        >
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">参数名称</label>
                                <FormItem>
                                    {getFieldDecorator('name', {
                                        initialValue: record.name,
                                        rules: [{
                                            required: true,
                                            message: '请输入参数名称',
                                        }, {
                                            max: 30,
                                            message: '输入长度最大为30',
                                        }, {
                                            validator: this.checkWord_chinese
                                        }],
                                    })(
                                        <Input
                                            placeholder="请输入参数名称"
                                        />
                                    )}
                                </FormItem>
                            </InputGroup>
                        </ValidatePopover>
                        <ValidatePopover
                            validatePoppoverId="value"
                            validateErrors={this.validateErrors}
                        >
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">参数值</label>
                                <FormItem>
                                    {getFieldDecorator('value', {
                                        initialValue: record.value,
                                        rules: [{
                                            required: true,
                                            message: '请输入参数值',
                                        }, {
                                            max: 30,
                                            message: '输入长度最大为30',
                                        }, {
                                            validator: this.checkWord_chinese
                                        }],
                                    })(
                                        <Input
                                            placeholder="请输入参数值"
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
export default Form.create({})(AddParam);