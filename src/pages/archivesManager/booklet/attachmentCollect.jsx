import React from 'react';
import $ from 'jquery'
import moment from 'moment'
import {Form, Input, Icon, Upload, Modal, Popover, Button, DatePicker, Checkbox} from 'antd';
import CustomSelect from '../../../components/CustomSelect';
import cKit from '../../../utils/base/coreKit';
import netKit from '../../../utils/base/networkKit';
import '../../../less/common.less';
import '../../../less/archivesManager/attachmentCollect.less';
import ScrollValidatePopover from '../../../components/scrollValidatePopover';
import CustomModal from '../../../components/customModal/CustomModal';
import {notice, errorNotice} from '../../../components/Common';
import {Validator}  from '../../../utils/base/validator';
import {secretLevel, srcType} from '../../../utils/common/commonOptions'
import word from '../../../images/filestyle/word.png'
import pdf from '../../../images/filestyle/pdf.png'
import ppt from '../../../images/filestyle/ppt.png'
import txt from '../../../images/filestyle/txt.png'
import excel from '../../../images/filestyle/excel.png'
let InputGroup = Input.Group;
let FormItem = Form.Item;

class AttachmentCollect extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    fileList: [],
    validateErrors: [],
    cameraDisabled: false,
    downloadConfirmVisible: false,
    isMerged: false,
    submitBtn: {
      loading: false
    }
  };

  addSubmit = () => {
    const thiz = this;
    this.props.form.validateFields((err, fields) => {
      //每次表单验证，重置错误信息
      const fileBaseData = this.props.fileBaseData;
      fields.categoryId = fileBaseData.categoryId;
      fields.accountYear = fileBaseData.accountYear;
      fields.accountMonth = fileBaseData.accountMonth;
      fields.pid = fileBaseData.currentFileId || 0;
      let validateErrors = this.validateErrors = {};
      if (err) {
        for (let i in err) {
          validateErrors[err[i].errors[0].field] = {
            visible: true,
            message: err[i].errors[0].message,
            className: 'validator-popover-error'
          };
        }
        this.validateErrors = validateErrors;
      } else {
        let successHandler = function (response) {
          if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
            notice(response.msg)
            for(let i in response.datas){
              response.datas[i].level = fileBaseData.currentFileLevel + 1;
            }
            if(fileBaseData.currentFileId){
              thiz.props.onOk(response.datas,fileBaseData.currentFileId);
            }else {
              thiz.props.onOk(response.datas);
            }

          } else {
            errorNotice(response.msg)
          }
        }
        let errorHandler = function (error) {
          errorNotice(error)
        }
        let completeHandler = function () {
          thiz.setState({
            submitBtn:{
              loading: false
            }
          })
        }
        let postBody = new FormData();
        for(let i in fields){
          /*if(i === 'docDate'){
            fields[i] = fields[i].format('YYYY-MM-DD');
          }*/
          postBody.append(i,fields[i])
        }
        postBody.append('isMerged', this.state.isMerged);
        const fileList = this.state.fileList;
        for(let i in fileList){
          postBody.append('uploadfiles',fileList[i].originFileObj, this.pad(i,4) + '_'+ fileList[i].name)
        }
        let url = cKit.makeUrl('/file/add?current_org_id=' + fileBaseData.current_org_id);
        let action = new netKit.FormCorsPostAction(null, url, postBody, successHandler, errorHandler, completeHandler);
        this.setState({
          submitBtn:{
            loading: true
          }
        })
        action.submit();
      }
    });
  }

  //补零算法
  pad = (num, n) => {
    let len = num.toString().length;
    while(len < n) {
      num = "0" + num;
      len++;
    }
    return num;
  }

  afterClose = () => {
    this.validateErrors = [];
    this.setState({
      fileList: [],
      isMerged: false
    });
    let fn = this.props.afterClose;
    fn && fn();
  }

  handleCancel = () => this.setState({previewVisible: false})

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleChange = ({fileList}) => {
    let totalSize = 0;
    for (let i in fileList) {
      let fileItem = fileList[i];
      totalSize += fileList[i].size
      if(totalSize > 50 * 1024 * 1024){
        errorNotice('上传的附件大小总和不可超过50M');
        return;
      }
      let url = fileItem.name;
      if (/\.(jpg|jpeg|png|JPG|PNG|JPEG|bmp|BMP)$/.test(url)) {

      } else if (/\.(pdf|PDF)$/.test(url)) {
        fileItem.thumbUrl = pdf;
      } else if (/\.(doc|docx|DOC|DOCX)$/.test(url)) {
        fileItem.thumbUrl = word;
      } else if (/\.(xls|xlsx|XLS|XLSX)$/.test(url)) {
        fileItem.thumbUrl = excel;
      /*} else if (/\.(ppt|pptx|PPT|PPTX)$/.test(url)) {
        fileItem.thumbUrl = ppt;*/
      } else if (/\.(txt|TXT)$/.test(url)) {
        fileItem.thumbUrl = txt;
      } else {
        errorNotice('附件格式不支持')
        return;
      }
      fileItem.status = 'done';
      fileItem.uid = i * (-1);
    }
    this.setState({fileList})
    let { setFieldsValue } = this.props.form;
    if(fileList.length > 0){
      setFieldsValue({
        'pages': ""
      });
    }
  }

  localFilesAdd = (e) => {
    e.stopPropagation();
    $('.attachment-upload').find('input').trigger('click');
  }

  cameraAdd = (e) => {
    e.stopPropagation();
    if (this.state.cameraDisabled) {
      return
    } else {
      console.log('camera')
      this.checkUpload();
    }
  }

  switchCamera = (e) => {
    const thiz = this;
    thiz.setState({
      cameraDisabled: true
    })
    $.ajax({
      async: true,
      cache: false,
      type: 'GET',
      timeout: 5000, //超时时间设置，单位毫秒
      header: {
        "Access-Control-Allow-Origin": "*"
      },
      url: 'http://127.0.0.1:23432/checkstatus',
      success: function (data) {
        data = JSON.parse(data);
        if (data.code == '0000') {
          thiz.switching();
        } else {

        }
      },
      error: function (xhr, textStatus, errorThrown) {
        thiz.scanYouDownload();
        thiz.setState({
          cameraDisabled: false
        })
      },
      complete: function (XMLHttpRequest, status) {
        if (status == 'timeout') {
          console.log('timeout');
        }
      }
    });
  }

  checkUpload = () => {
    const thiz = this;
    thiz.setState({
      cameraDisabled: true
    })
    $.ajax({
      async: true,
      cache: false,
      type: 'GET',
      timeout: 5000, //超时时间设置，单位毫秒
      header: {
        "Access-Control-Allow-Origin": "*"
      },
      url: 'http://127.0.0.1:23432/checkstatus',
      success: function (data) {
        data = JSON.parse(data);
        if (data.code == '0000') {
          thiz.scannning();
        } else {
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        thiz.scanYouDownload();
        thiz.setState({
          cameraDisabled: false
        })
      },
      complete: function (XMLHttpRequest, status) {
        if (status == 'timeout') {
          console.log('timeout');
        }
      }
    });
  }

  scanYouDownload = () => {
    console.log('download scanYou');
    this.setState({
      downloadConfirmVisible: true
    })
  }

  downloadCancel = () => {
    console.log('downloadConfirm close')
    this.setState({
      downloadConfirmVisible: false
    })
  }

  scannning = () => {
    let thiz = this;
    $.ajax({
      url: "http://127.0.0.1:23432/v1/twain/scan",
      type: "post",
      data: JSON.stringify({
        "token": '123',
        "bTwainUI": true,
        "fPiexlType": 0,
        "resolution": 300
      }),
      processData: false,
      contentType: false,
      success: function (data) {
        data = JSON.parse(data);
        if (data.code == '0000') {
          let fileList = thiz.state.fileList;
          fileList.push(thiz.solvedFile(data.name, data.datas.imgData, data.contentType))
          let totalSize = 0;
          for(let i in fileList){
            totalSize += fileList[i].size;
            if(totalSize > 50 * 1024 * 1024){
              errorNotice('上传的附件大小总和不可超过50M');
              return;
            }
          }
          thiz.setState({
            fileList: fileList
          })
          let { setFieldsValue } = thiz.props.form;
          if(fileList.length > 0){
            setFieldsValue({
              'pages': ""
            });
          }
        } else {
        }
      },
      error: function (e) {
      },
      complete: function () {
        thiz.setState({
          cameraDisabled: false
        })
      }
    });
  }

  switching = () => {
    let thiz = this;
    $.ajax({
      url: "http://127.0.0.1:23432/v1/twain/select",
      type: "GET",
      processData: false,
      contentType: false,
      success: function (data) {
        //do nothing
      },
      error: function (e) {
      },
      complete: function () {
        thiz.setState({
          cameraDisabled: false
        })
      }
    });
  }

  solvedFile = (filename, base64Data, contentType) => {
    return {
      name: filename,
      originFileObj: cKit.b64toBlob(base64Data, contentType),
      thumbUrl: 'data:' + contentType + ';base64,' + base64Data,
      type: contentType,
      uid: Math.random() * (-1)
    }
  }

  checkWord_chinese = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.WORD_CHINESE(value) || (mes = '请输入字母、数字或汉字') );
    callback(mes);
  }
  checkLetterNumber = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.ALLLETTERNUMBER(value) || (mes = '请输入字母或数字') );

    callback(mes);
  }
  checkNumber = (rule, value, callback) => {
    //cKit.isString(value) && (value = value.trim());
    let mes;
    value && ( Validator.POSITIVE_INTEGER_NONZERO(value) || (mes = '请输入正整数') );

    callback(mes);
  }

  isMergedChange = (e) => {
    this.setState({
      isMerged: `${e.target.checked}`
    })
  }

  render() {
    const {previewVisible, previewImage, fileList} = this.state;
    const {getFieldDecorator} = this.props.form;
    const fileBaseData = this.props.fileBaseData;
    const content = (
      <div className="upload-popover-btns">
        <a className="upload-file-icon" onClick={ (e) => this.localFilesAdd(e) }><Icon type="plus"/><span>&nbsp;添加本地文件</span></a>
        <a disabled={this.state.cameraDisabled} className="upload-file-icon" onClick={ (e) => this.cameraAdd(e) }><Icon type="camera-o"/><span>&nbsp;拍照扫描文件</span></a>
        <a disabled={this.state.cameraDisabled} className="upload-file-icon" onClick={ (e) => this.switchCamera(e) }><Icon type="swap" /><span>&nbsp;切换扫描设备</span></a>
      </div>
    );
    const uploadButton = (
      <div>
        <Popover placement="right" content={content} trigger="hover">
          <div className="ant-upload-text">
            <Icon title="添加本地文件" type="plus" className="add-btn-icon" onClick={ (e) => this.localFilesAdd(e) }/>
            &nbsp;
            <Icon title="拍照扫描文件" type="camera-o" className="camera-btn-icon" onClick={ (e) => this.cameraAdd(e) }
                  disabled={this.state.cameraDisabled}/>
          </div>
        </Popover>
      </div>
    );
    return (
      <CustomModal
        title="附件采集"
        visible={this.props.visible}
        onCancel={this.state.submitBtn.loading ? null : this.props.onCancel}
        afterClose={this.afterClose}
        onOk={this.addSubmit}
        width={800}
        footer={null}
        maskClosable={false}
        onOkLoading={this.state.submitBtn.loading}
      >
        <div>
          <Form className="collection-form">
            <div className="form-left">

                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">目录</label>
                  <FormItem className="form-item">
                    <Input value={fileBaseData.categoryName} disabled/>
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="categoryId" validateErrors={this.validateErrors}/>
                </InputGroup>

                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">题名</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('title', {
                      initialValue: "",
                      rules: [{
                        required: true, message: '请输入题名',
                      }, {
                        max: 20, message: '不得超过20字符!'
                      }],
                    })(
                      <Input autoComplete="off" placeholder="请输入附件题名"/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="title" validateErrors={this.validateErrors}/>
                </InputGroup>


                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">所属日期</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('docDate', {
                      rules: [
                        {
                          required: true, message: '请选择日期'
                        }
                      ],
                    })(
                      <DatePicker
                        onChange={() => {}}
                        placeholder="请选择附件所属日期"
                        disabledDate={
                          (currentDate) => {
                            return currentDate > moment(Date.now())
                          }
                        }
                        format='YYYY-MM-DD'
                      />
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="docDate" validateErrors={this.validateErrors}/>
                </InputGroup>


                <InputGroup compact>
                  <label className="common-head-label collection-head-label required-item">密级</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('secretLevel', {
                      initialValue: "1",
                      rules: [
                        {
                          required: true, message: '请选择密级',
                        }],
                    })(
                      <CustomSelect placeholder="请选择密级" dataSource={secretLevel}/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="secretLevel" validateErrors={this.validateErrors}/>
                </InputGroup>

                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">页数</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('pages', {
                      initialValue: "",
                      rules: [
                        {
                          max: 3, message: '页数过大'
                        },
                        {
                          validator: this.checkNumber
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder={this.state.fileList.length > 0 ? "采集页数由系统生成" : "请输入附件页数"} disabled={this.state.fileList.length > 0}/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="pages" validateErrors={this.validateErrors}/>
                </InputGroup>
            </div>
            <div className="form-right">

                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">文号</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('fileNo', {
                      initialValue: "",
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入文号"/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="fileNo" validateErrors={this.validateErrors}/>
                </InputGroup>

                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">关键词</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('keywords', {
                      initialValue: "",
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入关键词"/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="keywords" validateErrors={this.validateErrors}/>
                </InputGroup>

                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">摘要</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('abstracts', {
                      initialValue: "",
                      rules: [
                        {
                          max: 60, message: '不得超过60字符!'
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入附件摘要"/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="abstracts" validateErrors={this.validateErrors}/>
                </InputGroup>

                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">责任人</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('owner', {
                      initialValue: "",
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        },
                        {
                          validator: this.checkWord_chinese
                        }
                      ],
                    })(
                      <Input autoComplete="off" placeholder="请输入企业联系人"/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="owner"validateErrors={this.validateErrors}/>
                </InputGroup>

                <InputGroup compact>
                  <label className="common-head-label collection-head-label com-register-head-label">来源</label>
                  <FormItem className="form-item">
                    {getFieldDecorator('srcType', {
                      initialValue: "2",
                      rules: [
                        {
                          max: 20, message: '不得超过20字符!'
                        },
                        {
                          validator: this.checkWord_chinese
                        }
                      ],
                    })(
                      <CustomSelect disabled dataSource={srcType}/>
                    )}
                  </FormItem>
                  <ScrollValidatePopover validatePoppoverId="srcType" validateErrors={this.validateErrors}/>
                </InputGroup>
            </div>
            <div className="upload-area">
              <p>储存形式：{this.state.fileList.length > 0 ? "电子 + 纸质" : "纸质"}</p>
              <Upload
                className="attachment-upload"
                disabled={true}
                listType="picture-card"
                fileList={fileList}
                onPreview={this.handlePreview}
                onChange={this.handleChange}
                multiple={true}
                customRequest={() => {
                }}
                ref={(node) => this.upload = node}
              >
                {uploadButton}
              </Upload>
              <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{width: '100%'}} src={previewImage}/>
              </Modal>
            </div>
            <Checkbox className="merged-item" onChange={this.isMergedChange}>图片合并&nbsp;(仅支持图片与图片合并)</Checkbox>
          </Form>
        </div>
        <Modal
          title={'扫描插件下载'}
          key={1}
          visible={this.state.downloadConfirmVisible}
          closable={false}
          width={300}
          footer={(
            <div>
              <Button onClick={() => {
                window.open(cKit.makeUrl('/plugins/setup_32.exe'))
              }}>32位下载</Button>
              <Button onClick={() => {
                window.open(cKit.makeUrl('/plugins/setup_64.exe'))
              }}>64位下载</Button>
              <Button onClick={this.downloadCancel}>取消</Button>
            </div>
          )}
          maskClosable={false}
        >
          <p>请根据操作系统下载安装插件</p>
          {/*<p style={{color: 'red'}}>注意：安装路径不能为中文路径</p>*/}
        </Modal>
        <CustomModal
          style={{
            marginTop: 242
          }}
          width={200}
          visible={this.state.submitBtn.loading}
          closable={false}
          operate={false}
          contentStyle={{
            marginTop: 0
          }}
        >
          <div className="booklet-auto-completing">
            <Icon type="loading"/>&nbsp;正在上传……
          </div>
        </CustomModal>
      </CustomModal>
    );
  }
}

AttachmentCollect = Form.create({})(AttachmentCollect);
export default AttachmentCollect;