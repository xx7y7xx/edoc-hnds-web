/**
 * Created by zhaolongwei on 2017/5/7
 * 自定义Icon
 */
import React from 'react';
import cKit from '../../utils/base/coreKit';

import './customIcon.less'

export default class CustomIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
      let {
        onClick,
        type,
        originProps
      } = this.props;

      if(cKit.isVirtualDom(originProps)){
        throw 'CustomIcon.originProps must be plain object';
      }

      originProps = originProps || {};

      originProps.onClick = onClick;
      originProps.className = type + ' '+ (originProps.className || '');
    return (
      <i {...originProps}></i>
    )
  }
}