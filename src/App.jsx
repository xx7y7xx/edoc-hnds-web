import React from 'react';
import {observer} from 'mobx-react'
// 引入垫片兼容IE
import 'es5-shim';
import 'console-polyfill';

// Animate.CSS样式 & font-awesome样式
// 居然没有引用antd的样式文件
import 'animate.css/animate.min.css';
import './less/main.less';
import './libs/newTabSessionStorage'

// 配置整体组件
@observer
export default class Init extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div id="main-wrap">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
