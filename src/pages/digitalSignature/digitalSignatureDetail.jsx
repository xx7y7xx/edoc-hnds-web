import React from 'react';
import {Form, Input} from 'antd';
import CustomModal from '../../components/customModal/CustomModal';
import '../../less/digitalSignature/digitalSignature.less'
let InputGroup = Input.Group;
let FormItem = Form.Item;

class DigitalSignatureDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  //默认记录应为null，不能为{}
  record = null

  componentDidMount() {
  }


  afterClose = () => {
    let fn = this.props.afterClose;
    fn && fn();
  }

  render() {
    let record = this.props.signRecord;
    return (
      <CustomModal
        title="签名详情"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
        width={550}
        operate={false}
      >
        <div className="">
          <Form className="digitalSignature-form digitalSignature-detail-form" style={{marginBottom: 20}}>
            <InputGroup className="common-has-label" compact>
              <label className="common-head-label no-border">有效时间</label>
              <FormItem className="common-input-item no-border">
                <label>{record.openedDate + ' - ' + record.expireDate}</label>
              </FormItem>
            </InputGroup>

            <InputGroup className="common-has-label" compact>
              <label className="common-head-label no-border">企业账号</label>
              <FormItem className="common-input-item no-border">
                <label>{record.userName}</label>
              </FormItem>
            </InputGroup>

            <InputGroup className="common-has-label" compact>
              <label className="common-head-label no-border">企业名称</label>
              <FormItem className="common-input-item no-border">
                <label>{record.corpName}</label>
              </FormItem>
            </InputGroup>

            <InputGroup className="common-has-label" compact>
              <label className="common-head-label no-border">企业邮箱</label>
              <FormItem className="common-input-item no-border">
                <label>{record.email}</label>
              </FormItem>
            </InputGroup>

            <InputGroup className="common-has-label" compact>
              <label className="common-head-label no-border">所属地区</label>
              <FormItem className="common-input-item no-border">
                <label>{record.province +'/'+record.city}</label>
              </FormItem>
            </InputGroup>
            <InputGroup className="common-has-label" compact>
              <label className="common-head-label no-border">有效期限</label>
              <FormItem className="common-input-item no-border">
                <label>{record.validateTime}</label>
              </FormItem>
            </InputGroup>
          </Form>
        </div>
      </CustomModal>
    )
  }
}

export default Form.create({})(DigitalSignatureDetail);