/*
 * zhaolongwei 2017-05-24
 * tip:
 *
 */
import React from 'react'
import { Input } from 'antd'
import './customTableCell.less'
import cKit from '../../utils/base/coreKit';

import ValidatePopover from '../../components/validatePopover';

export default class CustomTableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,

      eleId: ('e' + Math.random()).replace('.', '')
    }

    this.timer = null;
  }

  onMouseOver = () => {
    this.setState({
      validTipVisible: this.validTipVisible
    });
  }
  onMouseOut = () => {
    clearTimeout(this.timer);
    this.setState({
      validTipVisible: false
    });
  }
  onClick = (e) => {
    let fn = this.props.onClick;
    fn && fn(e);
  }
  onDoubleClick = (e) => {
    let fn = this.props.onDoubleClick;
    fn && fn(e);
  }
  onKeyDown = (e) => {
    let fn = this.props.onKeyDown;
    return fn && fn(e);
  }
  onPressEnter = (e) => {
    let fn = this.props.onPressEnter;
    if(!(fn && fn(e) === false)){
      this.eidtCompleted(this.state.value, 'onPressEnter');
    }
  }
  onBlur = (e) => {
    let fn = this.props.onBlur;
    if(!(fn && fn(e) === false)){
      this.eidtCompleted(this.state.value, 'onBlur');
    }
  }
  onChange = (e) => {
    let fn = this.props.onChange;
    fn && fn(e) === false || this.setState({
      value: e.target.value
    });
  }

  eidtCompleted = (value, eventType) => {
    let fn = this.props.eidtCompleted;
    fn && fn(value, eventType);

    /* 日后考虑 */
    //必须延时，才能让
    // setTimeout(() => {
    //   this.setState({
    //     validTipVisible: this.validTipVisible
    //   });
    // }, 10);
    // this.timer = setTimeout(() => {
    //   this.setState({
    //     validTipVisible: false
    //   });
    // }, 1500);
  }

  render() {
    let value = this.state.value;
    let {
      validTip = {}
    } = this.props;

    let validTipVisible = this.validTipVisible = validTip.visible;
    let validMessage = validTip.message;

    cKit.isFunction(validTipVisible) && (validTipVisible = validTipVisible());

    let iptClass = validTipVisible ? 'error' : '';
    return (
      <div
        style={{
          width: this.props.width
        }}
        onDoubleClick={this.onDoubleClick}
        className="custom-table-cell-wrap"
        title={value}
      >
        {
          !!this.props.isEditing && this.props.canEdit !== false ?
          <ValidatePopover
            validatePoppoverId={this.state.eleId}
            validateErrors={{
              [this.state.eleId]: {
                visible: this.state.validTipVisible,
                message: validMessage,
                className: 'validator-popover-error'
              }
            }}
          >
            <Input
              placeholder="编辑完成可按回车键"
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              ref={(input) => {
                this.editInput = input;
                if(input && this.props.autoFocus){
                  let opt = input.refs.input;
                  opt.focus();
                  opt.setSelectionRange(0, opt.value.length);
                }
              }}
              //className={this.state.eleId}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onPressEnter={this.onPressEnter}
              onBlur={this.onBlur}
              value={value}
              className={iptClass}

              {...this.props.originProps}
            />
          </ValidatePopover> :
          value
        }
      </div>
    )
  }
}