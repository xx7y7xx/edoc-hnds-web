import React from 'react';
import {Form, Modal, Tree, Button} from 'antd';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';

import '../../less/common.less';
import '../../less/rolesManager/addRoles.less';

import {notice, errorNotice} from '../../components/Common';

const TreeNode = Tree.TreeNode;

class Accredit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalKey: Math.random(),

        };
        this.globalVar = {}
    }

    afterClose = () => {
        this.setState({
            modalKey: Math.random(),
        })
        this.props.afterClose();
    }

    // 角色授权
    onCheck = (checkedKeys, info) => {
        let checkedKeyObj = [];
        for (let i in checkedKeys) {
            checkedKeyObj.push(JSON.parse(checkedKeys[i]))
        }
        for (let i in info.halfCheckedKeys) {
            checkedKeyObj.push(JSON.parse(info.halfCheckedKeys[i]))
        }
        console.log('onChecked', info);
        this.globalVar.checkedKeys = checkedKeyObj

    }
    onSelect = (checkedKeys, info) => {
        console.log('onSelect', info);
        //this.onCheck(checkedKeys)
    }

    accreditSubmit = () => {
        const thiz = this;
        //预制角色不能授权
        if(this.props.record.isSystem == 'Y'){
            thiz.props.onCancel();
            return;
        }

        let successHandler = (response) => {
            let {msg} = response;
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                notice(msg)
                thiz.props.onCancel()
            } else {
                errorNotice(response.msg);
            }
        };

        let errorHandler = (error) => {
            errorNotice(error);
        };

        let url = cKit.makeUrl('/role/permtree');
        let postBody = {
            roleId: this.props.record.id,
            perms: this.globalVar.checkedKeys
        }
        let action = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
        action.submit();
    }

    render() {
        const checkedKeys = this.props.checkedKeys;
        let checkedKeyObj = [];
        for (let i in checkedKeys) {
            checkedKeyObj[i] = JSON.parse(checkedKeys[i])
        }
        this.globalVar.checkedKeys = checkedKeyObj;
        const record = this.props.record;
        const currentPermTree = this.props.currentPermTree;
        const loop = data => data.map((item) => {
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode key={JSON.stringify(
                        {
                            id: item.id,
                            type: item.type
                        }
                    )} title={item.name} disabled={record.isSystem == 'Y'}
                    >
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={JSON.stringify(
                {
                    id: item.id,
                    type: item.type
                }
            )} title={item.name} disabled={record.isSystem == 'Y'}/>;
        });
        return (

            <Modal
                title="角色授权"
                style={{top: 60}}
                key={this.state.modalKey}
                visible={this.props.visible}
                onCancel={this.props.onCancel}
                afterClose={this.afterClose}
                width={400}
                footer={null}
                maskClosable={false}
            >
                <div className="add-user-form clearFloat">
                    <div style={{height: 300,overflowY: 'auto'}}>
                        <Tree
                            className='menu-perm-tree'
                            //showLine
                            checkable
                            onCheck={this.onCheck}
                            onSelect={this.onSelect}
                            showIcon={true}
                            defaultCheckedKeys={checkedKeys}
                            defaultExpandedKeys={checkedKeys}
                        >
                            {loop(currentPermTree)}
                        </Tree>
                    </div>
                    <Button type="primary" onClick={this.accreditSubmit} className="submit-btn">
                        确定
                    </Button>
                </div>
            </Modal>
        );
    }
}

Accredit = Form.create({})(Accredit);
export default Accredit;