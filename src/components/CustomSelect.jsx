import React from 'react';
import {Select} from 'antd';

let {Option} = Select;
/**
 @页标题(自定义下拉框)
 @return {Component} 返回Title组件
 */

export default class CustomSelect extends React.Component{
    constructor(props) {
      super(props);
      this.state = {}
    }

    render() {
      let CustomProps = {...this.props};

      let options = (CustomProps.dataSource || []).map(data =>
        <Option
          disabled={data.disabled}
          value={data.value + ""}
          key={data.value + ""}
          title={data.label}
        >
          <ellipsis-select-option>
            {data.label}
          </ellipsis-select-option>
        </Option>
      );
      return (
        <Select {...CustomProps}>
          {options}
        </Select>
      );
    }
}
