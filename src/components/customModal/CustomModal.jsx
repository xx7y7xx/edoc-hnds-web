import React from 'react'
import {Modal, Icon, Button} from 'antd'
import './customModal.less'
import cKit from '../../utils/base/coreKit';

export default class CustomModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalKey: Math.random()
    }
  }

  componentDidMount() {}

  static confirm = Modal.confirm;
  static success = Modal.success

  buttons = {
    ok: {
      text: '确定',
      onClick: 'onOk',
    },
    next: {
      text: '下一步',
      icon: 'right',
      onClick: 'onNext',
    },
    prev: {
      text: '上一步',
      icon: 'left',
      onClick: 'onPrev',
    },
  }

  getOperateBtns = (operate) => {
    let result = [];
    if(!operate || operate === true){
      result.push(
        <Button type="primary" key="ok" onClick={this.onOk} loading={this.onOkLoading}>
          确定
        </Button>
      );
    } else if(Array.isArray(operate)){
      for (let i = 0; i < operate.length; i++) {
        let item = operate[i];
        if(cKit.isString(item)){
          let btn = this.buttons[item] || {};
          btn.text && result.push(
            <Button key={item} onClick={this[btn.onClick]} type="primary">
              {item != 'prev' && btn.text}<Icon type={btn.icon} />{item == 'prev' && btn.text}
            </Button>
          );
        } else {
          result.push(item);
        }
      }
    } else if(cKit.isObject(operate)){
      result = operate;
    }
    return (
      <div className="custom-modal-operate">
        {result}
      </div>
    );
  };

  afterClose = () => {
    this.setState({
      modalKey: Math.random()
    });

    let fn = this.props.afterClose;
    fn && fn();
  }

  render() {
    let clientHeight = document.documentElement.clientHeight;

    let customProps = {...this.props};
    customProps.hasOwnProperty('footer') || (customProps.footer = null);
    customProps.hasOwnProperty('title') || (customProps.title = null);
    customProps.hasOwnProperty('maskClosable') || (customProps.maskClosable = false);


    let {
      auto = true, //每次弹出，是否自动生成唯一的key
      key,
      className,
      style,
      title,
      visible,
      onCancel,
      onOk,
      onOkLoading,
      onNext,
      onPrev,
      width,
      maskClosable,
      footer,
      operate,
      children,
      originProps,
      closable,
      contentStyle,
    } = customProps;

    if(cKit.isVirtualDom(originProps)){
      throw 'CustomIcon.originProps must be plain object';
    }

    originProps = originProps || {};

    let addHeight = operate === false ? 55 : 0;
    //数值661与CSS中媒体查询对应
    let smallScreen = 661;
    let isSmaller = clientHeight < smallScreen;
    //css中，当屏幕小于661时，会把弹窗向上拉50
    //到可视区顶部与到底部的和
    let num = isSmaller ?  210 : 260;
    let maxHeight = clientHeight - num + addHeight;
    let oStyle = {
      maxHeight,
      marginTop: !!title && 0,
      overflowY: 'auto'
    };
    contentStyle = Object.assign(oStyle, contentStyle);

    this.onOk = onOk;
    this.onOkLoading = onOkLoading;
    this.onNext = onNext;
    this.onPrev = onPrev;

    return (
      <Modal
        key={auto ? this.state.modalKey : key}
        className={className}
        style={style}
        title={title}
        visible={visible}
        onCancel={onCancel}
        afterClose={this.afterClose}
        onOk={onOk}
        width={width}
        maskClosable={maskClosable}
        closable={closable}
        footer={footer}

        {...originProps}
      >
        <div>
          <div
            style={contentStyle}
            className="custom-modal-content"
          >
            {children}
          </div>
          {operate === false || this.getOperateBtns(operate)}
        </div>
      </Modal>
    )
  }
}