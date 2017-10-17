import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import {Button, Icon, Upload, Steps, Row, Col} from 'antd';

import '../../less/common.less';
import '../../less/organization.less';
import {errorNotice} from '../../components/Common';
import CustomModal from '../../components/customModal/CustomModal';

const Step = Steps.Step;

export default class BatchImportOrgs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStep: 0,
      isMessageShow: false,

      fileList: [],
      currentAction: 'operating',
      message: null,
    };
  }

  submitFile = () => {
    let file = this.state.fileList[0];
    if(file){
      let formData = new FormData();
      formData.append('file', file.originFileObj);
      this.uploadFileFetch({
        reqParam: formData,
        success: (data) => {
          this.setState({
            currentStep: 1,
            isMessageShow: true,
            fileList: [],
            message: '校验通过',
            currentAction: 'complete',
          });
        }
      });
    } else {
      file
    }
  }

  goBack = () => {
    this.setState({
      isMessageShow: false,
      currentStep: 0,
      fileList: [],
      currentAction: 'operating',
    });
  }

  complete = () => {
    let fn = this.props.complete;
    fn && fn();
  }

  //上传图片之后
  uploadChange = ({file, fileList}) => {
    let name = file.name
    if (!/\.(xls|xlsx)$/i.test(name)) {
      errorNotice('文件格式不支持');
      return;
    }
    file.status= 'done';
    file.uid= Math.random() * (-1);
    this.setState({fileList});
  }

  afterClose = () => {
    this.validateErrors = {};
    this.setState({
      currentStep: 0,
      fileList: [],
      isMessageShow: false,
      currentAction: 'operating',
    });
    let fn = this.props.afterClose;
    fn && fn();
  }

  uploadFileFetch = ({reqParam, success}) => {
    let successHandler = (response) => {
      let {msg, datas} = response;
      if(response.code == cKit.ResponseCode.SUCCESS_CODE){
        success && success(datas);
      } else {
        this.setState({
          isMessageShow: true,
          message: msg,
          currentAction: 'fail',
        });
        errorNotice(msg);
      }
    };

    let url = '/org/import/excel';
    netKit.postFetch({
      url,
      data: reqParam,
      success: successHandler,
      error: this.errorHandler
    });
  }

  errorHandler = (error) => {
    errorNotice('未知错误');
  };

  render() {
    let operate, action = this.state.currentAction;
    if(action == 'complete'){
      operate = <Button type="primary" onClick={this.complete}>完成</Button>;
    } else if(action == 'fail'){
      operate = <Button type="primary" onClick={this.goBack}>返回</Button>;
    } else {
      operate = <Button
        type="primary"
        disabled={!this.state.fileList.length}
        onClick={this.submitFile}
      >
        下一步<Icon type="right" />
      </Button>
    }

    return (
      <CustomModal
        className="org-manager-wrap"
        title="批量导入"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        afterClose={this.afterClose}
        width={700}
        operate={operate}
      >
        <div>
          <Steps current={this.state.currentStep}>
            <Step title="下载、上传模板"/>
            <Step title="完成上传"/>
          </Steps>
          <Upload
            className="update-wrap"
            name="file"
            //listType="picture-card"
            multiple={true}
            customRequest={() => {}}
            onChange={this.uploadChange}
            fileList={this.state.fileList}
          >
            <div>
              {
                !!this.state.fileList.length ||
                <Row type="flex" align="middle" className="buttons-wrap" >
                  <Col
                    span={12}
                    onClick={
                      (e) => {
                        window.open(cKit.makeUrl('/template/template.xlsx'));
                        e.stopPropagation();
                      }
                    }
                  >
                    <Button icon="download">下载模板</Button>
                  </Col>
                  <Col span={12}>
                      <Button icon="upload">上传模板</Button>
                  </Col>
                </Row>
              }
            </div>
          </Upload>
          {
            this.state.isMessageShow && (
              <div className="update-message">
                {this.state.message}
              </div>
            )
          }
        </div>
      </CustomModal>
    )
  }
}