/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import {Form, Input, DatePicker, Button, Checkbox} from 'antd';
import cKit from '../../utils/base/coreKit';
import CustomModal from '../../components/customModal/CustomModal';
import ValidatePopover from '../../components/validatePopover';
import userStore from '../../stores/userStore';

let FormItem = Form.Item;
class ExternalOffer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isWaterMark: false
    }
    this.orgId = this.props.orgId;
  }

  componentDidUpdate(props) {
  }

  afterClose = () => {
    this.validateErrors = {}
  }

  addSubmit = () => {
    this.props.form.validateFields((err, fields) => {
      //每次表单验证，重置错误信息
      let validateErrors = this.validateErrors = {};
      if (err && this.state.isWaterMark) {
        for (let i in err) {
          validateErrors[err[i].errors[0].field] = {
            visible: true,
            message: err[i].errors[0].message,
            className: 'validator-popover-error'
          };
        }
      } else {
        let fileList = [];
        for(let i in this.props.externalOfferRecords){
          fileList.push({
            id: this.props.externalOfferRecords[i]
          })
        }
        let postBody = {
          "purpose": fields.purpose,
          "validDateFrom": fields.validDateFrom ? fields.validDateFrom.format('YYYY-MM-DD') : '',
          "validDateTo": fields.validDateTo ? fields.validDateTo.format('YYYY-MM-DD') : '',
          "isWaterMark": this.state.isWaterMark,
          "fileList": fileList
        };
        this.fileExportFetch({
          postBody,
          success: (datas) => {
            let fn = this.props.success;
            fn && fn(datas);
            this.props.onClose();
          }
        });
      }
    });
  }

  fileExportFetch = ({postBody, success}) => {
    postBody['x-auth-token'] = userStore.getSessionId();
    postBody.fileList = JSON.stringify(postBody.fileList);
    let url = cKit.makeUrl('/file/export',postBody);
    window.open(url);
    success && success();
  }

  isWaterMarkChange = (e) => {
    this.setState({
      isWaterMark: e.target.checked
    })
  }

  validFromDate = (rule, value, callback) => {
    const form = this.props.form;
    form.validateFields(['validDateTo'], {force: true});
    callback();
  }

  validDate = (rule, value, callback) => {
    const form = this.props.form;
    if (!value || !form.getFieldValue('validDateFrom')) {
      callback('有效期起止时间不能为空');
    }
    callback();
  }

  render() {
    let {getFieldDecorator, getFieldValue} = this.props.form;
    return (
      <CustomModal
        title="对外提供"
        visible={this.props.visible}
        onCancel={this.props.onClose}
        afterClose={this.afterClose}
        width={450}
        operate={
          <div>
            <Checkbox className="sign-check" onChange={(e) => this.isWaterMarkChange(e)}>加盖签章</Checkbox>
            <Button type="primary" key="ok" onClick={() => this.addSubmit()}>
              下载
            </Button>
          </div>
        }
      >
        <div className="">
          <Form >
            <div className="external-offer">
              <label>此件与原件相符，仅用于</label>
              <ValidatePopover
                validatePoppoverId="purpose"
                validateErrors={this.validateErrors}
              >
                <FormItem className="external-offer-purpose">
                  {getFieldDecorator('purpose', {
                    initialValue: '',
                    rules: [{
                      required: true, message: '请输入对外提供用途',
                    }, {
                      max: 19, message: '不得超过19字符!'
                    }],
                  })(
                    <Input
                      placeholder="最多输入19个字符"
                    />
                  )}
                </FormItem>
              </ValidatePopover>
              <label>其他无效</label>
              <br/>

              <ValidatePopover validatePoppoverId="validDateTo" validateErrors={this.validateErrors}>
                <label className="external-offer-label" style={{marginLeft: 80}}>有效期&nbsp;</label>
                <FormItem className="external-offer-date">
                  {getFieldDecorator('validDateFrom', {
                    rules: [
                      {
                        validator: this.validFromDate
                      }
                    ],
                  })(
                    <DatePicker
                      onChange={() => {
                      }}
                      disabledDate={
                        (currentDate) => {
                          return currentDate > getFieldValue('validDateTo')
                        }
                      }
                      format='YYYY-MM-DD'
                    />
                  )}
                </FormItem>

                <label className="external-offer-label">&nbsp;至&nbsp;</label>
                <FormItem className="external-offer-date">
                  {getFieldDecorator('validDateTo', {
                    rules: [{
                      validator: this.validDate
                    }],
                  })(
                    <DatePicker
                      onChange={() => {
                      }}
                      disabledDate={
                        (currentDate) => {
                          return currentDate <= getFieldValue('validDateFrom')
                        }
                      }
                      format='YYYY-MM-DD'
                    />
                  )}
                </FormItem>
              </ValidatePopover>
            </div>
          </Form>
        </div>
      </CustomModal>
    );
  }
}
export default Form.create({})(ExternalOffer);