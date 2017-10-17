import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import {Form, Input, Icon} from 'antd';
import {notice, errorNotice} from '../../components/Common';
import {Validator}  from '../../utils/base/validator';
import CustomModal from '../../components/customModal/CustomModal';
import ValidatePopover from '../../components/validatePopover';
let InputGroup = Input.Group;
let FormItem = Form.Item;

class EditParam extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //每次弹窗的key（保证各操作不受影响）
            modalKey: Math.random(),
            //默认记录应为null，不能为{}
            record: null,
            //表单验证错误信息
            validateErrors: {},

        };
    }
    afterClose = () => {
        this.state.validateErrors = {};
        this.setState({
            modalKey: Math.random()
        });
        let fn = this.props.afterClose;
        fn && fn();
    }
    errorHandler = (error) => {
        errorNotice('未知错误');
    }
    editSubmit = () => {
        this.props.form.validateFields((err, fields) => {
            //每次表单验证，重置错误信息
            let validateErrors = this.state.validateErrors = {};
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
                let id = this.state.record.id;
                reqParam.id = id;

                this.editRecordFetch({
                    reqParam,
                    success: (datas) => {
                        let fn = this.props.success;
                        fn && fn(datas);
                    }
                });
            }
        });
    }
    editRecordFetch = ({reqParam, success}) => {
        let successHandler = (response) => {
            if(response.code == cKit.ResponseCode.SUCCESS_CODE){
                let {msg, datas} = response;
                success && success(datas);
                notice(msg);
            } else {
                errorNotice(response.msg);
            }
        };

        let url = '/params/update';
        netKit.postFetch({
            url,
            data: reqParam,
            success: successHandler,
            error: this.errorHandler
        });
    }
    render() {
        let { setFieldsValue, getFieldValue, getFieldDecorator } = this.props.form;
        let record = this.state.record = this.props.record;



        return (
            <CustomModal
                className="org-manager-wrap"
                title="编辑参数"
                key={this.state.modalKey}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                afterClose={this.afterClose}
                onOk={this.editSubmit}
                width={500}
            >
                <div className="org-manager-wrap info-input-list">
                    <Form>
                        <ValidatePopover
                            validatePoppoverId="code"
                            validateErrors={this.state.validateErrors}
                        >
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">参数编码</label>
                                <FormItem>
                                    {getFieldDecorator('code', {
                                        initialValue : record.code,
                                        rules: [{
                                            required: true,
                                            message: '请输入参数编码',
                                        }, {
                                            max: 30,
                                            message: '输入长度最大为30',
                                        }],
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
                            validateErrors={this.state.validateErrors}
                        >
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">参数名称</label>
                                <FormItem>
                                    {getFieldDecorator('name', {
                                        initialValue : record.name,
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
                            validateErrors={this.state.validateErrors}
                        >
                            <InputGroup className="common-has-label" compact>
                                <label className="common-head-label required-item">参数值</label>
                                <FormItem>
                                    {getFieldDecorator('value', {
                                        initialValue : record.value,
                                        rules: [{
                                            required: true,
                                            message: '请输入参数值',
                                        },{
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
export default Form.create({})(EditParam);