import React from 'react';
import { Form, Input, Upload, Button } from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import userStore from '../../stores/userStore';

import '../../less/common.less';
import '../../less/accessManager.less';

import ValidatePopover from '../../components/validatePopover';
import CustomModal from '../../components/customModal/CustomModal';
import CustomTree from '../../components/customTree/CustomTree';
import CustomSelect from '../../components/CustomSelect';
import {notice, errorNotice} from '../../components/Common';

let InputGroup = Input.Group;
let FormItem = Form.Item;

class EditTransferApproval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orgs: [],
      fileList: [],

      categorySource: [],

      checkedKeys: [],

      targetRecord: {},

      previewVisible: false,
      previewImage: '',

      currentAction: 'view',
    };

    this.isAfterVisible = this.props.visible;
  }

  componentDidUpdate() {
    if(this.props.visible && !this.isAfterVisible){ // 当本组件显示的时候执行
      this.isAfterVisible = true;

      this.getDropdownOptionsFetch();
      this.getRecordDetailFetch(this.props.record.id);
    }
  }

  getRecordDetailFetch = (id) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let fileList = this.convertFile(datas.attaches || []);
        this.setState({
          targetRecord: datas,
          fileList,
        });
        this.getCategoryTreeFetch({
          orgId: datas.orgId
        });
      } else {
        errorNotice(msg);
      }
    };

    let url = '/turnover/info';
    netKit.getFetch({
      url,
      urlAppend: [id],
      success: successHandler,
      error: this.errorHandler
    });
  }

  convertFile = (fileList) => {
    return fileList.map((item) => {
      let name = item.fileName;
      let file = cKit.checkFileType({name});
      let isImg = file.isImg;
      let thumbUrl = isImg ? 'data:image/jpg;base64,' +  item.thumbnailDatas : file.img;
      return {
        isImg,
        name,
        thumbUrl,
        originFileObj: null,
        type: '',
        uid: Math.random() * (-1),
        status: 'done',
        id: item.id,
      }
    });
  }

  editSubmit = () => {
    this.editRecordFetch({
      isApprove: true,
      success: (datas) => {
        let fn = this.props.success;
        fn && fn(datas);
      }
    });
  }

  rejectSubmit = () => {
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
        let comments = fields.comments;
        this.editRecordFetch({
          comments,
          success: (datas) => {
            let fn = this.props.success;
            fn && fn(datas);
          }
        });
      }
    });
  }

  setComments = () => {
    this.setState({
      currentAction: 'reject'
    });
  }

  uploadRemove = () => {
    //不能删除
    return false;
  }

  onCancel = () => {
    if(this.state.currentAction == 'reject'){
      this.setState({
        currentAction: 'view'
      });
    } else {
      let fn = this.props.onCancel;
      fn && fn();
    }
  }

  afterClose = () => {
    this.isAfterVisible = false;
    this.validateErrors = {};

    this.setState({
      currentAction: 'view',
      orgs: [],
      fileList: [],
      categorySource: [],
      checkedKeys: [],
      targetRecord: {},
    });

    let fn = this.props.afterClose;
    fn && fn();
  }

  editRecordFetch = ({isApprove, comments, success}) => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {msg, datas} = response;
        success && success(datas);
        notice(msg);
      } else {
        errorNotice(response.msg);
      }
    };

    let url = isApprove? '/turnover/attach/pass' : '/turnover/attach/reject';
    let id = this.state.targetRecord.id;
    let json = {id};
    isApprove || (json.comments = comments);
    netKit.postFetch({
      url,
      data: [json],
      success: successHandler,
      error: this.errorHandler
    });
  }

  getDropdownOptionsFetch = () => {
    let successHandler = (response) => {
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let {datas} = response;
        this.setState({
          orgs: datas,
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/org/established/dropdown';
    netKit.getFetch({
      url,
      data: {},
      success: successHandler,
      error: this.errorHandler
    });
  }

  getCategoryTreeFetch = ({orgId}) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        let disabledItem = (arr) => {
          arr.forEach((item) => {
            item.disableCheckbox = true;
            let sons = item.children;
            sons && disabledItem(sons);
          });
        };
        disabledItem(datas);
        this.setState({
          categorySource: datas,
          checkedKeys: this.state.targetRecord.categorys,
        });
      } else {
        errorNotice(msg);
      }
    };

    let url = '/category/tree';
    netKit.getFetch({
      url,
      data: {
        orgId,
        //后端要求，此时传空值
        sysPid: ''
      },
      success: successHandler,
      error: this.errorHandler
    });
  }

   fileDownFetch = ({isImg, id}) => {
    if(isImg){
      let successHandler = (blobResponse) => {
        this.setState({
          previewImage: window.URL.createObjectURL(blobResponse),
          previewVisible: true,
        });
      };
      let url = '/turnover/attach/download';
      netKit.getFetch({
        url,
        data: {id},
        dataType: 'stream',
        success: successHandler,
        error: this.errorHandler
      });
    } else {
      let url = cKit.makeUrl('/turnover/attach/download', {
        id,
        'x-auth-token': userStore.getSessionId()
      });
      window.open(url);
    }
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <CustomModal
        title="移交审批"
        visible={this.props.visible}
        onCancel={this.onCancel}
        afterClose={this.afterClose}
        width={520}
        operate={
          !this.props.isView && (
            this.state.currentAction == 'reject' ?
            <Button type="primary" onClick={this.rejectSubmit}>
              确定
            </Button> :
            <div>
              <Button type="primary" onClick={this.setComments}>
              驳回
              </Button>
              <Button type="primary" onClick={this.editSubmit}>
              同意
              </Button>
            </div>
          )
        }
      >
        <div className="access-apply-form" ref="accessApplyForm">
          {this.state.currentAction == 'reject' ?
            <Form>
              <ValidatePopover validatePoppoverId="comments"
                               validateErrors={this.validateErrors}>
                {getFieldDecorator('comments', {
                  rules: [{
                    required: true,
                    message: '请输入驳回意见'
                  }]
                })(
                  <Input type="textarea" placeholder="请输入驳回意见" />
                )}
              </ValidatePopover>
            </Form> :
            <Form>
              <ValidatePopover validatePoppoverId="orgId"
                             validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label required-item">移交单位</label>
                  <FormItem>
                    {getFieldDecorator('orgId', {
                      initialValue: String(this.state.targetRecord.orgId || ''),
                    })(
                      <CustomSelect
                        disabled={true}
                        getPopupContainer={(trigger) => this.refs.accessApplyForm}
                        className="form-element"
                        dataSource={this.state.orgs}
                      />
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="turnoverType"
                               validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label required-item">移交类型</label>
                  <FormItem>
                      {getFieldDecorator('turnoverType', {
                        initialValue: String(this.state.targetRecord.turnoverType || ''),
                        rules: [{
                          required: true,
                          message: '请输入移交类型',
                        }],
                      })(
                        <CustomSelect
                          getPopupContainer={(trigger) => this.refs.accessApplyForm}
                          disabled={true}
                          className="form-element"
                          dataSource={[{
                            value: '10',
                            label: '对内移交'
                          }, {
                            value: '20',
                            label: '对外移交'
                          }]}
                        />
                      )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="receiveDept"
                               validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label required-item">接收部门</label>
                  <FormItem>
                    {getFieldDecorator('receiveDept', {
                      initialValue: this.state.targetRecord.receiveDept,
                      rules: [{
                        required: true,
                        message: '请输入接收部门',
                      }, {
                        max: 40,
                        message: '输入长度最大为40',
                      }, {
                        validator: this.checkWord_chinese
                      }],
                    })(
                      <Input
                        className="form-element"
                        placeholder="请输入接收部门"
                        disabled={true}
                      />
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="receiver"
                               validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label required-item">接收人</label>
                  <FormItem>
                    {getFieldDecorator('receiver', {
                      initialValue: this.state.targetRecord.receiver,
                      rules: [{
                        required: true,
                        message: '请输入接收人',
                      }, {
                        max: 20,
                        message: '输入长度最大为20',
                      }, {
                        validator: this.checkWord_chinese
                      }],
                    })(
                      <Input
                        className="form-element"
                        placeholder="请输入接收人"
                        disabled={true}
                      />
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="reason"
                               validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label required-item">移交原因</label>
                  <FormItem>
                      {getFieldDecorator('reason', {
                        initialValue: this.state.targetRecord.reason,
                        rules: [{
                          required: true,
                          message: '请输入移交原因',
                        }, {
                          max: 50,
                          message: '输入长度最大为50',
                        }, {
                          validator: this.checkWord_chinese
                        }],
                      })(
                        <Input
                          className="form-element"
                          placeholder="请输入移交原因"
                          disabled={true}
                        />
                      )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="attaches"
                             validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label vt" >添加附件</label>
                  <FormItem>
                    <Upload
                      className="form-element-readonly upload-attachment attachment-readonly"
                      listType="picture-card"
                      disabled={true}
                      fileList={this.state.fileList}
                      onPreview={(file) => {
                        this.fileDownFetch(file);
                      }}
                      onRemove={this.uploadRemove}
                      multiple={true}
                      customRequest={() => {}}
                    />
                    <CustomModal
                      visible={this.state.previewVisible}
                      operate={false}
                      onCancel={() => {
                        this.setState({
                          previewVisible: false
                        });
                      }}
                    >
                      <img alt="example" style={{width:'100%'}} src={this.state.previewImage}/>
                    </CustomModal>
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="categorys"
                             validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label vt">移交目录</label>
                  <FormItem>
                    {getFieldDecorator('categorys', {
                      initialValue: this.state.checkedKeys,
                      rules: [{
                        required: true,
                        message: '请输入移交目录',
                      }],
                    })(
                      <CustomTree
                        disabled={true}
                        checkable
                        titleMark="object.categoryName"
                        checkedKeys={this.state.checkedKeys}
                        className="form-element-readonly category-tree"
                        dataSource={this.state.categorySource}
                      />
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
              <ValidatePopover validatePoppoverId="yearDate"
                             validateErrors={this.validateErrors}>
                <InputGroup className="common-has-label" compact>
                  <label className="common-head-label required-item">档案期间</label>
                  <FormItem>
                    {getFieldDecorator('yearDate', {
                      rules: [{
                        required: true,
                        message: '请输入档案期间',
                      }],
                    })(
                      <content>
                        <CustomSelect
                          disabled={true}
                          getPopupContainer={(trigger) => this.refs.accessApplyForm}
                          value={this.state.targetRecord.yearFrom}
                          placeholder="开始年"
                          className="form-element-half"
                          //dataSource={this.state.yearFromDataSource}
                        />
                        ~
                        <CustomSelect
                          disabled={true}
                          getPopupContainer={(trigger) => this.refs.accessApplyForm}
                          value={this.state.targetRecord.yearTo}
                          placeholder="结束年"
                          className="form-element-half"
                          //dataSource={this.state.yearToDataSource}
                        />
                      </content>
                    )}
                  </FormItem>
                </InputGroup>
              </ValidatePopover>
            </Form>
          }
        </div>
      </CustomModal>
    );
  }
}

EditTransferApproval = Form.create({})(EditTransferApproval);
export default EditTransferApproval;