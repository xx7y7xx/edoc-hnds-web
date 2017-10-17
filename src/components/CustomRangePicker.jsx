/**
 * Created by zhaolongwei on 2017/7/6
 * 目前解决第一次选择时，开始时间可能大于结束时间的问题
 */
import React from 'react';
import {DatePicker} from 'antd';
//import 'moment/locale/zh-cn';
//moment.locale('zh-cn');
const { RangePicker } = DatePicker;

export default class CustomRangePicker extends React.Component{
    constructor(props) {
      super(props);
      this.state = {}
    }

    onChange = (moments, strings) => {
      if(moments.length && moments[0].isAfter(moments[1])){
        moments.reverse();
        strings.reverse();
      }
      let fn = this.props.onChange;
      fn && fn(moments, strings);
    }

    render() {
      let CustomProps = {...this.props};
      CustomProps.onChange = this.onChange;

      return (
        <RangePicker {...CustomProps} />
      );
    }
}
