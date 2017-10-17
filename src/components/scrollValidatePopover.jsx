/**
 * Created by APP on 2017/5/11.
 */
import React from 'react'

export default class ScrollValidatePopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
  }

  render() {

    let validateErrors = this.props.validateErrors || {};
    let validatePopoverId = this.props.validatePoppoverId;
    let errorInfo = validateErrors[validatePopoverId] || {};
    return (
      <div className="ant-popover validator-popover-error ant-popover-placement-rightTop zoom-big-enter zoom-big-enter-active"
           style={{
             left: '100%',
             right: '-40%',
             display: errorInfo.visible ? 'inline-block' : 'none'
           }}
      >
        <div className="ant-popover-content">
          <div className="ant-popover-arrow"/>
          <div className="ant-popover-inner">
            <div>
              <div className="ant-popover-inner-content">{errorInfo.message}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}