import React from 'react';
import cKit from '../../utils/base/coreKit';
import netKit from '../../utils/base/networkKit';
import Topbar from '../../components/topBar/Topbar';
import {Title} from '../../components/Title';
import {Form, Button, Icon, Tooltip, Modal} from 'antd';

import '../../less/common.less';
import '../../less/organization.less';
import {notice, errorNotice, warnNotice} from '../../components/Common';
import CustomTable from '../../components/customTable/CustomTable';
import CustomIcon from '../../components/customIcon/CustomIcon';
import AddRole from './addRoles'
import EditRole from './editRoles'
import Accredit from './accredit'


class RoleManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            total: 0,
            page: 1,
            size: 10,
            pageList: [],
            record: {},

            //弹窗是否显示
            adding: false,
            editing: false,
            notBatchOperate: true,
            //每次弹窗的key（保证各操作不受影响）
            modalKey: Math.random(),
            currentPermTree: [],
            checkedKeys: [],

            //高级搜索
            keyword: '',
            //选中记录信息（当前页）
            selectedRecords: [],
            //当前操作类型
            operatingName: 'add',
        }

    }

    componentDidMount() {
        this.getRecordsFetch({
            page: 1
        });
    }

    //高级搜索
    advanceSearch = (keyword) => {
        this.getRecordsFetch({
            keyword,
            page: 1,
        });
    }

    add = () => {
        this.state.operatingName = 'add';
        this.setState({
            record: {},
            adding: true,
        })
    }

    edit = (record) => {
        this.state.operatingName = 'edit';
        this.setState({
            record: record,
            editing: true,
        })
    }

    accredit = (record) => {
        this.getPremTree(record);
    }

    getPremTree = (record) => {
        const thiz = this;
        let successHandler = (response) => {
            let {msg, datas} = response;
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                let checkedKeys = [];

                const loop = (data) => {
                    data.forEach((item) => {
                        if (item.children && item.children.length > 0) {
                            loop(item.children)
                        }else {
                            if (item.select) {
                                checkedKeys.push(JSON.stringify({
                                    id: item.id,
                                    type: item.type
                                }))
                            }
                        }
                    });
                };
                loop(datas);
                thiz.setState({
                    currentPermTree: datas,
                    checkedKeys: checkedKeys,
                    accrediting: true,
                    record: record
                })
            } else {
                errorNotice(response.msg);
            }
        };

        let errorHandler = (error) => {
            errorNotice(error);
        };

        let url = cKit.makeUrl('/permission/tree?roleId=' + record.id);
        let action = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
        action.submit();
    }

    modelClose = () => {
        this.setState({
            adding: false,
            editing: false,
            accrediting: false
        })
    }

    afterAddOrEdit = () => {
        this.modelClose();
    }

    //删除
    isDeleteRecord = (record) => {//不传值为批量操作
        let isBatch = !record;
        let records = isBatch ? this.state.selectedRecords : [record];
        if (records.length) {
            Modal.confirm({
                title: '温馨提示',
                content: '确认要删除吗？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    let reqParam = [];
                    for (let i = 0; i < records.length; i++) {
                        let item = records[i];
                        reqParam.push({
                            id: item.id
                        });
                    }
                    this.deleteRecordsFetch({
                        reqParam,
                        success: () => {
                            this.updateLocalRecords(reqParam);
                        }
                    });
                }
            });
        } else {
            warnNotice('请至少勾选一条记录');
        }
    }

    //修改本地数据
    modifyLocalRecords = (modifiedRecords, cb) => {
        let pageList = this.state.pageList;
        let selectedRecords = this.state.selectedRecords;
        modifiedRecords.forEach((modifiedRecord) => {
            pageList.forEach(function (item, i) {
                let modifiedRecordId = modifiedRecord.id;
                if (item.id == modifiedRecordId) {
                    if (cKit.isFunction(cb)) {//执行回调
                        cb(item, modifiedRecord, pageList, modifiedRecords)

                    } else {//直接替换为目标值
                        item = pageList[i] = modifiedRecord;
                    }
                    //已选中的项也更新
                    selectedRecords.forEach((one, ii, arr) => {
                        if (one.id == modifiedRecordId) {
                            arr[ii] = item;
                        }
                    });
                }
            });
        });
        this.setState({pageList});
    }

    //更新本地数据
    updateLocalRecords = (delRecords) => {
        let {page, pageList} = this.state;
        if (delRecords) {
            let selectedRecords = this.state.selectedRecords;
            if (delRecords.length >= pageList.length) {//删除本页所有数据
                selectedRecords.length = 0; //清空选中数据
                page > 1 && page--; //有上一页数据时
            } else {
                //也清空本地数据，否则多次删除时会重复提交数据
                delRecords.forEach((delRecord) => {
                    selectedRecords.forEach((item, i, arr) => {
                        if (item.id == delRecord.id) {
                            arr.splice(i, 1);
                        }
                    });
                });
            }
            this.setState({
                notBatchOperate: !selectedRecords.length
            });
        }
        this.getRecordsFetch({
            page,
        });
    }

    pageChange = (page, size) => {
        this.getRecordsFetch({page, size});

        this.setState({
            notBatchOperate: true,
        });
    }

    getRecordsFetch({
        keyword = this.state.keyword,
        page = this.state.page,
        size = this.state.size
    }) {
        //page最小为1
        page <= 0 && (page = 1);
        this.setState({
            loading: true,
            selectedRecords: [],
        });

        let successHandler = (response) => {
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                let oResult = response.datas;
                this.setState({
                    page,
                    size,
                    keyword,
                    total: oResult.total,
                    pageList: oResult.pageList,
                });
            } else {
                errorNotice(response.msg);
            }
        };

        let url = '/role/list';
        netKit.postFetch({
            url,
            param: {page, size},
            data: {keyword},
            success: successHandler,
            error: this.errorHandler,
            complete: () => {
                this.setState({
                  loading: false
                });
            }
        });
    }

    deleteRecordsFetch = ({reqParam, success}) => {
        this.setState({
            loading: true
        });
        let successHandler = (response) => {
            if (response.code == cKit.ResponseCode.SUCCESS_CODE) {
                let {msg, datas} = response;
                success && success(datas);
                notice(msg);
            } else {
                errorNotice(response.msg);
            }
        };

        let url = '/role/del';
        netKit.postFetch({
            url,
            data: reqParam,
            success: successHandler,
            error: this.errorHandler,
            complete: () => {
                this.setState({
                  loading: false
                });
            }
        });
    }

    isEnableDelBtn = (selectedRows) => { // 删除按钮是否可用
        let len = selectedRows.length;
        for (let i = 0; i < len; i++) {
            if (selectedRows[i].isSystem == 'Y') {
                this.setState({
                    notBatchOperate: true
                });
                break;
            }
        }
    }

    errorHandler = (error) => {
        errorNotice(error);
    };

    render() {
        //const { setFieldsValue, getFieldValue, getFieldDecorator } = this.props.form
        // 设置列
        const columns = [{
            title: '角色编码',
            dataIndex: 'roleCode',
            key: 'roleCode',
            width: '30%'
        }, {
            title: '角色名称',
            dataIndex: 'roleName',
            key: 'roleName',
            width: '20%'
        }, {
            title: '角色描述',
            dataIndex: 'description',
            key: 'description',
            width: '20%'
        }, {
            title: '操作',
            render: (text, record) => (
                <span>
                    <Tooltip onClick={() => this.edit(record)} title="编辑">
                      <Icon type="edit" className="operate-icon"/>
                    </Tooltip>&nbsp;&nbsp;
                    <Tooltip onClick={() => this.isDeleteRecord(record)} title="删除">
                      <Icon type="delete" className="dangerous-icon"/>
                    </Tooltip>&nbsp;&nbsp;
                    <Tooltip overlayClassName='anticon' title="授权">
                        <CustomIcon onClick={() => {
                          this.accredit(record)
                        }} type="accredit"/>
                    </Tooltip>
                </span>
            )
        }];

        // 设置行选择
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {},
            onSelect: (record, selected, selectedRows) => {
                this.state.selectedRecords = selectedRows;
                this.setState({
                    notBatchOperate: !selectedRows.length
                });

                !!selectedRows.length && this.isEnableDelBtn(selectedRows);
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                this.state.selectedRecords = selectedRows;
                this.setState({
                    notBatchOperate: !selectedRows.length
                });

                !!selectedRows.length && this.isEnableDelBtn(selectedRows);
            }
        };

        const leftBottomRect = (
            <div>
                <Button icon="plus" onClick={() => this.add()} type="primary">新增</Button>
                <span style={{paddingLeft: 10}}>
                    <Button
                        icon="delete"
                        disabled={this.state.notBatchOperate}
                        onClick={() => this.isDeleteRecord()}
                        type="danger"
                    >删除</Button>
                </span>
            </div>
        );
        return (
            <div>
                <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入角色编码、角色名称"}/>
                <div className="main-content main-content-animate">
                    { Title() }
                    <CustomTable
                        currentPage={this.state.page}
                        rowKey={record => record.id}
                        loading={this.state.loading}
                        rowSelection={rowSelection}
                        dataSource={this.state.pageList}
                        columns={columns}
                        total={this.state.total}
                        onPageChange={this.pageChange}
                        leftBottom={leftBottomRect}
                    />
                </div>
                <AddRole
                    visible={this.state.adding}
                    afterClose={this.afterAddOrEdit}
                    onCancel={this.modelClose}
                    success={() => {
                        this.updateLocalRecords()
                    }
                    }
                />
                <EditRole
                    visible={this.state.editing}
                    afterClose={this.afterAddOrEdit}
                    onCancel={this.modelClose}
                    record={this.state.record}
                    success={(record) => {
                        this.modifyLocalRecords([record]);
                    }
                    }
                />
                <Accredit
                    visible={this.state.accrediting}
                    afterClose={this.afterAddOrEdit}
                    onCancel={this.modelClose}
                    record={this.state.record}
                    currentPermTree={this.state.currentPermTree}
                    checkedKeys={this.state.checkedKeys}
                />
            </div>
        )
    }
}

export default Form.create({})(RoleManager);