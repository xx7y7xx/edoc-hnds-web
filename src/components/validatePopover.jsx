/**
 * Created by APP on 2017/5/11.
 */
import React from 'react';
import { Popover } from 'antd';
import $ from 'jquery';

export default class ValidatePopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisable: true
    }
    this.timer = null;

    this.triggerNode = null;
  }

  static noScrolling = true
  static scrollTarget = null;
  static modalContent = null;
  static validateErrors = null;

  static autoScroll = () => {
    let scrollTarget = ValidatePopover.scrollTarget;
    let modalContent = ValidatePopover.modalContent;

    if(scrollTarget && modalContent){
      let contentRect = modalContent.getBoundingClientRect();
      let targetRect = scrollTarget.getBoundingClientRect();
      if(!ValidatePopover.needShow(targetRect, contentRect)){
        modalContent.scrollTop = modalContent.scrollTop - contentRect.top + targetRect.top;
        ValidatePopover.scrollTarget = null;
      }
    }
  }

  static needShow = (node, wrap) => {//目前只计算垂直方向
    let vertical = node.bottom > wrap.top && node.top < wrap.bottom;
    //let horizontal = rect1.left > rect2.right || rect1.right < rect2.left;
    return vertical;
  }

  componentDidMount() {
  }
  componentDidUpdate() {

  }

  dealAutoShow = (node) => {
    let item = $(node);
    let modalWrap = item.closest('.custom-modal-content')
    let modalWrapDom = modalWrap[0];
    if(modalWrapDom){//在CustomModal里
      let wrapRect = modalWrapDom.getBoundingClientRect();
      let nodeRect = node.getBoundingClientRect();

      ValidatePopover.modalContent = modalWrapDom;

      this.setState({
        isVisable: ValidatePopover.needShow(nodeRect, wrapRect)
      });
      modalWrap.scroll(() => {
        let nodeRect = node.getBoundingClientRect();
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          ValidatePopover.noScrolling = false;
          this.setState({
            isVisable: ValidatePopover.needShow(nodeRect, wrapRect)
          });
        }, 50);
      });
    } else {
      this.setState({
        isVisable: true
      });
    }
  }

  render() {
    let validateErrors = this.props.validateErrors || {};
    let validatePopoverId = this.props.validatePoppoverId;
    let errorInfo = validateErrors[validatePopoverId] || {};
    let visible = errorInfo.visible || false;

    let overClass = (!this.state.isVisable && 'hidden') || errorInfo.className || '';

    if(ValidatePopover.noScrolling){//非滚动触发更新
      let target = ValidatePopover.scrollTarget;
      if(!visible && target === this.triggerNode){
        ValidatePopover.scrollTarget = null;
      } else if(visible && !target){
        ValidatePopover.scrollTarget = this.triggerNode;
      }


      if(ValidatePopover.validateErrors !== validateErrors){
        ValidatePopover.validateErrors = validateErrors;
        setTimeout(() => {
          ValidatePopover.autoScroll();
        }, 10);
      }
    } else {//滚动触发更新
      setTimeout(() => {
        ValidatePopover.noScrolling = true;
      }, 10);
    }
    return (
      <Popover
        style={{
          display: 'none'
        }}
        getPopupContainer={(triggerNode) => {
          this.triggerNode = triggerNode;
          this.dealAutoShow(triggerNode);
          return document.body;
        }}
        placement="rightTop"
        overlayClassName={overClass}
        content={
          errorInfo.message || ''
        }
        visible={visible}
      >
        { this.props.children }
      </Popover>
    )
  }
}