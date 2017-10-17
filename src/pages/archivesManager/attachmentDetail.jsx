/**
 * Created by APP on 2017/6/5.
 */
import React from 'react'
import {Icon, Row, Col, Input, Button, Tooltip} from 'antd';
import cKit from '../../utils/base/coreKit';
import pKit from '../../utils/base/permissionKit';
import netKit from '../../utils/base/networkKit';
import CustomModal from '../../components/customModal/CustomModal';
import CustomTable from '../../components/customTable/CustomTable';
import {errorNotice} from '../../components/Common';

import { secretLevelObj, storeTypeObj, srcTypeObj } from '../../utils/common/commonOptions';

import ExternalOffer from '../archivesSearch/externalOffer';

import '../../less/common.less';
import '../../less/archivesManager/booklet.less';
import '../../less/archivesManager/attachmentDetail.less';

import 'animate.css'
import $ from 'jquery'

const Search = Input.Search;

export default class AttachmentDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,

      filePic: '',
      picSize: 0,

      record: {},

      page: 0,
      total: 0,
      fileId: '',

      expandedRowKeys: [],
      srcRecords: [],
      srcExpandedKeys: [],
      records: [],
      externalOfferVisible: false,
    }


    this.orgId = this.props.orgId;

    this.noGetRecords = true;

    this.timer = null;

    this.picClassList = ['pic-width-430' ,'pic-width-600' ,'pic-width-800' ,'pic-width-1000'];
  }

  componentDidUpdate(props){
    if(this.props.visible && this.noGetRecords){
      this.noGetRecords = false;
      this.getRecordsFetch();
      this.getFileDetailFetch();
      this.getFileFetch();
    }
  }

  onChange = (e) => {
    let val = e.target.value.trim();

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      let records, ids;
      let srcRecords = cKit.copyJson(this.state.srcRecords);
      if(val){
        let result = this.filterRecords(val, srcRecords);
        ids = result.ids;
        records = result.records;
      } else {
        ids = this.state.srcExpandedKeys;
        records = srcRecords;
      }

      this.setState({
        records,
        expandedRowKeys: ids
      });
    }, 500);
  }

  filterRecords = (str, arr) => {//题名、文号、关键词、日期、责任人
    let records = [];
    let ids = [];
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let isTarget = this.filterProps(str, item);
      let sons = item.children;
      delete item.children;
      if(sons){//空数组已被删除过
        let newJson  = this.filterRecords(str, sons);
        if(newJson.records.length){
          isTarget = true;
          ids = ids.concat(newJson.ids);
          item.children = newJson.records;
        }
      }

      if(isTarget){
        ids.push(item.id);
        records.push(item);
      }
    }

    return {
      ids,
      records
    };
  }

  filterProps = (str, json) => {
    let props = ['title', 'fileNo', 'keywords', 'docDate', 'owner'];
    for (let i = 0; i < props.length; i++) {
      if((json.object[props[i]] || '').indexOf(str) != -1){
        return true;
      }
    }
    return false;
  }

  delEmptySons = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let sons = item.children;
      if(sons){
        if(!sons.length){
          delete item.children;
        } else {
          this.delEmptySons(sons);
        }
      }
    }
  }

  getRecordsFetch = () => {
    this.setState({
      loading: true
    });
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let records = [response.datas];
        let srcRecords = records;

        let srcExpandedKeys = srcRecords.map((item) => {
          return item.id;
        });

        let expandedRowKeys = cKit.copyJson(srcExpandedKeys);

        this.delEmptySons(srcRecords);


        this.setState({records, srcRecords, expandedRowKeys, srcExpandedKeys});
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/family';
    netKit.getFetch({
      url,
      data: {
        current_org_id: this.orgId
      },
      urlAppend: [this.fileId],
      success: successHandler,
      error: this.errorHandler,
      complete: () => {
        this.setState({
          loading: false,
        });
      }
    });
  }

  getFileFetch = (page = 1, fileId = this.fileId) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        let filePic = 'data:image/png;base64,' + datas.imgData;
        let total = datas.total;
        this.setState({
          filePic,
          page,
          total,
          fileId,
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/preview/file';
    netKit.getFetch({
      url,
      data: {
        page,
        current_org_id: this.orgId,
      },
      urlAppend: [fileId],
      success: successHandler,
      error: this.errorHandler,
    });
  }

  getFileDetailFetch = (fileId = this.fileId) => {
    let successHandler = (response) => {
      if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
        let datas = response.datas;
        this.setState({
          record: datas
        });
      } else {
        errorNotice(response.msg);
      }
    };

    let url = '/file/info';
    netKit.getFetch({
      url,
      data: {
        current_org_id: this.orgId,
      },
      urlAppend: [fileId],
      success: successHandler,
      error: this.errorHandler,
    });
  }

  favouriteOperate = (isCollected) => {
    let fileId = this.state.record.id;
    let successHandler = (response) => {
      let {datas, code, msg} = response;
      if (code == cKit.ResponseCode.SUCCESS_CODE ||
          (isCollected && code == '1004') ||
          (!isCollected && code == '1002')
      ) {
        let record = this.state.record;
        record.collected = isCollected;
        this.setState({record});

        let fn = this.props.favoriteChange;
        fn && fn(fileId, isCollected);
      } else {
        errorNotice(msg)
      }
    }

    let url = isCollected ? '/favorite/add' : '/favorite/cancel';
    netKit.postFetch({
      url,
      data: {fileId},
      success: successHandler,
      error: this.errorHandler,
    });
  }

  afterClose = () => {
    this.noGetRecords = true;
    this.setState({
      expandedRowKeys: [],
      srcRecords: [],
      records: [],
      page: 0,
      total: 0,
      filePic: '',
      picSize: 0,
      externalOfferVisible: false,
    });
  }

  onRowClick = (record) => {
    let id = record.id;
    this.getFileDetailFetch(id);
    this.getFileFetch(1, id);
  }

  changePic = (action) => {
    let {page, total} = this.state;
    action == 'next' ? page++ : page--;
    if(page < 1 || page > total) {
      return;
    }
    this.getFileFetch(page, this.state.fileId)
  }

  externalOffer = () => {
    this.setState({
      externalOfferVisible: true
    });
  }

  offExternalOffer = () => {
    this.setState({
      externalOfferVisible: false
    });
  }

  slideDown = (seletor) => {
    //$(seletor).show().css({visibility: 'visible'}).animateCss('slide-up-enter slide-up-enter-active');
    $(seletor).show().animateCss('slide-up-enter slide-up-enter-active');
  }

  slideUp = (seletor) => {
    $(seletor).animateCss('slide-up-leave slide-up-leave-active', function(){
      //$(this).hide().css({visibility: 'hidden'});
      $(this).hide();
    });
  }

  errorHandler = (error) => {
    errorNotice(error || '未知错误');
  }

  render() {
    this.fileId = this.props.fileId;

    let record = this.state.record || {};

    return (
      <CustomModal
        className="booklet-customModal-wrap"
        title={
          <div
            className="booklet-table-wrap"
            style={{
              textAlign:'center',
              position: 'relative'
            }}
          >
            <span style={{
              position: 'absolute',
              left: 0,
              fontSize: 20
            }}>
              <Icon
                type="bars"
                style={{
                  color: '#12bce7'
                }}
                onClick={() => {
                  this.slideDown('#layoutSearch');
                }}
              />
              <div
                className="elastic-layout-search"
                id="layoutSearch"
              >
                <header className="title-block">
                  <span
                    className="icon"
                    onClick={() => {
                      this.slideUp('#layoutSearch');
                    }}
                  >
                    <Icon type="close" />
                  </span>
                  <span className="text">
                    <Search
                      width="100"
                      placeholder="表内支持模糊查询"
                      onChange={this.onChange}
                    />
                  </span>
                </header>
                <div className="content">
                  <CustomTable
                    expandedRowKeys={this.state.expandedRowKeys}
                    onExpandedRowsChange={(expandedRowKeys) => {
                      this.setState({expandedRowKeys});
                    }}
                    operate={false}
                    loading={this.state.loading}
                    onRowClick={this.onRowClick}
                    fixedWidth={350}
                    columns={[{
                        width: '60%',
                        title: '题名',
                        dataIndex: 'object.title',
                        key: 'object.title',
                    }, {
                        title: '文号',
                        dataIndex: 'object.fileNo',
                        key: 'object.fileNo',
                    }]}
                    dataSource={this.state.records}
                  />
                </div>
              </div>
            </span>
          附件详情</div>
        }
        visible={this.props.visible}
        onCancel={this.props.onClose}
        afterClose={this.afterClose}
        width={720}
        trigger="click"
        operate={false}
      >
        <Row type="flex" justify="space-between" className="attachment-detail-wrap">
          <Col className="left" span={15}>
            <div className="iconBox">
              <div className="buttons-content">
                <Icon
                  type="left-circle"
                  className={this.state.page <= 1 && 'disabled'}
                  onClick={() => {
                    this.changePic('pre');
                  }}
                />
                <Icon
                  className={this.state.page >= this.state.total && 'disabled'}
                  type="right-circle"
                  onClick={() => {
                    this.changePic('next')
                  }}
                />
                <Icon
                  type="minus-circle"
                  className={this.state.picSize <= 0 && 'disabled'}
                  onClick={() => {
                    let picSize = this.state.picSize;
                    if(picSize > 0){
                      this.setState({
                        picSize: picSize - 1
                      });
                    }
                  }}
                />
                <Icon
                  type="plus-circle"
                  className={this.state.picSize >= 3 && 'disabled'}
                  onClick={() => {
                    let picSize = this.state.picSize;
                    if(picSize < 3){
                      this.setState({
                        picSize: picSize + 1
                      });
                    }
                  }}
                />
              </div>
              <div className="picBox">
                <div
                  style={{position: 'relative'}}
                >
                  <img
                    alt="文件预览"
                    className={this.picClassList[this.state.picSize]}
                    //src="http://192.168.52.80/cloudrecord-web/image/867562168476430336"
                    src={this.state.filePic}
                    ref={(node) => this.img = node}
                  />
                  {/*<div
                      className="prePic"
                      style={{
                        visibility: this.state.page <= 1 && 'hidden',
                      }}
                      onClick={() => this.changePic('pre')}
                    />
                    <div
                      className="nextPic"
                      style={{
                        visibility: this.state.page >= this.state.total && 'hidden',
                      }}
                      onClick={() => this.changePic('next')}
                    />*/}
                </div>
              </div>

            </div>

          </Col>
          <Col className="right" span={9}>
            <Row className="row">
              <Col className="tit" span={7}>题名</Col>
              <Col className="info" span={17}>{record.title}</Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>文号</Col>
              <Col className="info" span={17}>{record.fileNo}</Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>关键词</Col>
              <Col title={record.keywords} className="info" span={17}>
                {record.keywords}
              </Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>摘要</Col>
              <Col title={record.abstracts} className="info" span={17}>
                {record.abstracts}
              </Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>责任人</Col>
              <Col className="info" span={17}>{record.owner}</Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>日期</Col>
              <Col className="info" span={17}>{record.docDate}</Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>密级</Col>
              <Col className="info" span={17}>
                {secretLevelObj[record.secretLevel]}
              </Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>页数</Col>
              <Col className="info" span={17}>
                {record.pages ? this.state.page + '/' + record.pages : '0/0'}
              </Col>
            </Row>
            <Row className="row">
              <Col className="tit" span={7}>来源</Col>
              <Col className="info" span={17}>{srcTypeObj[record.srcType]}</Col>
            </Row>
            <Row className="row lastRow">
              <Col className="tit" span={7}>存储形式</Col>
              <Col className="info" span={17}>
                {storeTypeObj[record.storeType]}
              </Col>
            </Row>
            {
              this.props.operate && pKit.hasPermission('REC_ARCHIVESEARCH_PROVIDEOUTER')
              &&
              <Row className="operateRow">
                <Tooltip title="收藏">
                  <Icon
                    type={record.collected ? 'heart' : 'heart-o'}
                    className="dangerous-icon"
                    onClick={() => this.favouriteOperate(!record.collected)}
                  />
                </Tooltip>
                <Button type="primary" onClick={this.externalOffer}>对外提供</Button>
              </Row>
            }
          </Col>
        </Row>
        <ExternalOffer
          visible={this.state.externalOfferVisible}
          onClose={this.offExternalOffer}
          externalOfferRecords={[this.state.record.id]}
        />
      </CustomModal>
    );
  }
}