/**
 * Created by zhaolongwei on 2017/5/6
 * 基于antd，用于与其Table控件组合，在Table底部居中显示
 * 分左、中、右三部分
 */
import React from 'react';
import {Pagination} from 'antd'

import './centerPagination.less'

export default class CenterPagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let middleStyle = this.props.middleStyle || {};
    let rightStyle = this.props.rightStyle || {};

    //if(this.props.right){
      middleStyle.textAlign = 'center';
      rightStyle.display = 'block';
    //}

    let pageSizeOptions = this.props.pageSizeOptions || ['10', '20', '50', '100'];
    let noPagination = this.props.pagination === false;
    let simple = this.props.simple === true;

    if(simple){
      //最大显示页数为99999
      middleStyle.width = '118px';
    }

    let pagination = noPagination ? '' : (
      <Pagination
        simple = {simple}
        current = {this.props.current}
        //pageSize={this.props.pageSize}
        defaultPageSize = {Number(pageSizeOptions[0])}
        onChange = {this.props.onChange}
        onShowSizeChange = {this.props.onShowSizeChange}
        total = {this.props.total}
        showSizeChanger = {true}
        showQuickJumper = {true}
        pageSizeOptions = {pageSizeOptions}
      />
    );

    return (
      <div className="my-pagination-box">
        <span className="left" style={this.props.leftStyle}>
          {this.props.left}
        </span>
        {
          noPagination ? '' :
          <span className="mid" style={middleStyle}>
            {pagination}
          </span>
        }
        <span className="right" style={rightStyle}>
          {this.props.right}
        </span>
      </div>
    )
  }
}