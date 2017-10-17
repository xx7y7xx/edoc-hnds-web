/*
 * zhaolongwei 2017-05
 * tip:
 1.最后一列宽度不填写
 2.兼容：
 1）每列默认加title(非虚拟DOM时)
 2）计算首列宽度
 3）表格默认隐藏（或其它导致列与表头对不齐）时，
 需添加fixedWidth属性（单位是px），保证计算正确
 */
import React from 'react'
import {Table, Pagination} from 'antd'
import cKit from '../../utils/base/coreKit';
import './customTable.less'

import CenterPagination from '../paginationInTable/CenterPagination'

export default class CustomTable extends React.Component {
  constructor(props) {
    super(props);

    let {
      rowSelection,
      onPageChange,
      onPageSizeChange,
      // currentPage,
      // currentSize,
    } = this.props;

    // this.currentPage = currentPage;
    // this.currentSize = currentSize;

    rowSelection = rowSelection || {};
    let onChange = rowSelection.onChange;
    rowSelection.onChange = (selectedRowKeys, selectedRows) => {
      onChange && onChange.apply(this, arguments);
      this.setState({selectedRowKeys})
    }
    this.rowSelection = rowSelection;

    onPageSizeChange = onPageSizeChange || onPageChange;
    this.onPageChange = (page, size) => {
      onPageChange && onPageChange.call(this, page, size);
      this.setState({
        // currentPage: page,
        // pageSize: size,
        selectedRowKeys: []
      })
    }
    this.onPageSizeChange = (page, size) => {
      onPageSizeChange && onPageSizeChange.call(this, page, size);
      this.setState({
        // currentPage: page,
        // pageSize: size,
        selectedRowKeys: []
      })
    }

    this.state = {
      eleId: ('e' + Math.random()).replace('.', ''),

      selectedRowKeys: rowSelection.selectedRowKeys,
      //currentPage: currentPage || 1,
      //pageSize: currentSize || 10,
    }

    this.fixedWidth = this.props.fixedWidth;
  }

  getLevelByUniqueId = (record, level = 1, records = this.dataSource) => {
    let {uniqueId, childMark} = this;
    let fn = this.getLevelByUniqueId;

    for (let i = 0; i < records.length; i++) {
      let item = records[i];
      if (item[uniqueId] === record[uniqueId]) {
        return level
      }
      let sons = item[childMark];
      let res;
      if (sons && (res = fn(record, level + 1, sons)) != -1) {
        return res;
      }
    }

    return -1;
  }

  render() {
    let {
      //记录的标识字段
      uniqueId = 'id',
      childMark = 'children',
      //object/Function(rowIndex, columnIndex, cellStyle, customInfo)
      cellStyle = {},
      selectedRowKeys,
      //操作区（包括分页内容）是否显示
      operate,
      //左侧按钮区
      leftBottom,
      //右侧按钮区（设置之后，分页器居中）
      rightBottom,
      total,
      className,
      pagination,
      columns,
      scroll,
      style,
      height,
      rowKey,
      size,
      loading,
      rowSelection,
      dataSource = [],
      //分页器是否简单显示
      isSimplePagination = document.documentElement.clientWidth < 1280,
      onTableChange,
      onExpand,
      rowClassName,
      expandedRowKeys,
      showHeader,
      originProps,
      pageSizeOptions,
    } = this.props;

    this.dataSource = dataSource;
    this.uniqueId = uniqueId;
    this.childMark = childMark;

    this.rowSelection.selectedRowKeys = selectedRowKeys || this.state.selectedRowKeys;
    let isOperate = operate !== false;
    let paginationDom = isOperate ?
      (
        <CenterPagination
          simple={isSimplePagination}
          pageSize={this.props.currentSize}
          current={this.props.currentPage}
          left={leftBottom}
          right={rightBottom}
          total={total}
          onChange={this.onPageChange}
          onShowSizeChange={this.onPageSizeChange}
          className={className}
          pagination={pagination}
          pageSizeOptions={pageSizeOptions}
        />
      ) : '';

    let clientHeight = document.documentElement.clientHeight;
    let tableWrap = this.tableWrap = document.querySelector('.' + this.state.eleId);

    //把百分比换算成px 需最后一列宽度不填写
    let dealWidth = (columns = []) => {
      let isMultilevel = false;
      for (let i = 0; i < dataSource.length; i++) {
        let item = dataSource[i];
        if (cKit.isArray(item[childMark])) {
          isMultilevel = true;
          break;
        }
      }

      if (this.fixedWidth || tableWrap) {
        let width = this.fixedWidth || parseInt(getComputedStyle(tableWrap, false).width);
        if (width) {
          for (let j = 0, len = columns.length; j < len; j++) {
            let column = columns[j];
            let isFirstColumn = j == 0;
            let w = column.width;
            let arr;
            if (w && (arr = /((\d|\.)+)%$/.exec(w))) {
              w = width * arr[1] / 100;
              //保证最后一列设置宽度无效
              if (j == len - 1) {
                delete column.width;
              } else {
                column.width = w;
              }
            }
            let {srcRender, render} = column;
            column.srcRender = srcRender || render || ((text) => {
                return text;
              });
            render = column.srcRender;

            let level;
            column.render = (text, record, index) => {
              if (isFirstColumn) {
                level = this.getLevelByUniqueId(record);
              }
              let remainWidth;
              let jusifyNum = 16;
              if (isMultilevel && isFirstColumn) {//多层级并且为第一列
                remainWidth = parseInt(w) - level * 30 - jusifyNum;
              } else {
                remainWidth = parseInt(w) - jusifyNum;
              }
              let customInfo = {
                level,
                width: w,
              };

              let oStyle = {};
              if (remainWidth) {
                oStyle.width = customInfo.remainWidth = remainWidth;
              }
              if (cKit.isFunction(cellStyle)) {
                oStyle = cellStyle(index, j, oStyle, customInfo);
              } else if (cKit.isObject(cellStyle)) {
                oStyle = Object.assign(oStyle, cellStyle)
              }

              let showText = render(text, record, index, customInfo);
              let cellDom = cKit.isObject(showText) ? showText : (
                record.isNew ? (<ellipsis-new-item>
                  {showText}
                </ellipsis-new-item>) : <ellipsis-item>
                  {showText}
                </ellipsis-item>
              );
              return (
                <ellipsis style={oStyle} title={cKit.isObject(showText) ? null : showText}>
                  {cellDom}
                </ellipsis>
              );
            }
          }
        }
      }
      return columns;
    }

    let dealHeight = () => {
      if (tableWrap) {
        let rect = tableWrap.getBoundingClientRect();
        return clientHeight - rect.top - 170;
      }
    }

    columns = dealWidth(columns);
    if (isOperate || scroll) {
      scroll = scroll || {y: dealHeight()};
    }

    let oStyle = style || {};
    let divHeight = height;
    divHeight && (oStyle.height = divHeight);
    oStyle.overflow = 'hidden';

    let customProps = {
      columns,
      scroll,
      loading,
      dataSource,
      showHeader,
      onExpand,
      rowClassName,
      pagination: false,
      className: `custom-table-selector ${this.state.eleId}`,
      rowKey: rowKey || (record => record.id),
      size: size || 'small',
      rowSelection: rowSelection == null ? undefined : this.rowSelection,
      onChange: onTableChange,
      expandedRowRender: this.props.expandedRowRender,
      defaultExpandAllRows: this.props.defaultExpandAllRows, //一般不用
      onExpandedRowsChange: this.props.onExpandedRowsChange,
      onRowClick: this.props.onRowClick,
    }
    expandedRowKeys && (customProps.expandedRowKeys = expandedRowKeys);
    return (
      <div style={oStyle}>
        <Table
          {...customProps}
          {...originProps}
        />
        {paginationDom}
      </div>
    )
  }
}