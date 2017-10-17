/*
 * zhaolongwei 2017-06-23
 * tip:
 * 方便数据传入
 *  数据如： let arr = [{
      theId: '123456',
      object:{
        theName: 'name'
      },
      sons: [......]
    }]

    定义DOM如下：
    <CustomTree keyMark="theId" titleMark="object.name" childMark="sons" dataSource={arr}/>
 */
import React from 'react';
import { Tree } from 'antd';
import cKit from '../../utils/base/coreKit';
import './customTree.less';

const TreeNode = Tree.TreeNode;
export default class CustomTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.keyMark = String(this.props.keyMark || 'id');
    this.titleMark = this.props.titleMark;
    this.childMark = this.props.childMark || 'children';

    if(!this.titleMark) {
      console.error('CustomTrss error: 请定义titleMark属性')
    }
  }

  loop = datas => datas.map((item) => {
    if (item.children) {
      return (
        <TreeNode {...item}>
          {this.loop(item.children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        {...item}
      />
    );
  });

  dealDataSource = (dataSource) => {
    let {keyMark, titleMark, childMark} = this;

    return dataSource.map((item) => {
      let [
        key,
        title,
        disabled = false,
        disableCheckbox = false,
        children,
      ] = this.getObjectValue([
        keyMark,
        titleMark,
        'disabled',
        'disableCheckbox',
        childMark,
      ], item);
      let re = {
        key,
        title,
        disabled,
        disableCheckbox,
      };
      if(cKit.isArray(children)){
        re.children = this.dealDataSource(children);
      }
      return re;
    });
  }

  getObjectValue = (keys, obj) => {
    let re = [];
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let tar = obj;
      let arr = key.split('.');
      for (let i = 0; i < arr.length; i++) {
        tar = tar[arr[i].trim()];
      }
      re.push(tar);
    }

    return re;
  }

  render() {
    let dataSource = this.props.dataSource || [];

    dataSource = this.dealDataSource(dataSource);

    return (
      <Tree {...this.props}>
        {this.loop(dataSource)}
      </Tree>
    )
  }
}