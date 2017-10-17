import React from 'react';
import {Form, Button, Icon, Tooltip} from 'antd';
import CustomTable from '../../components/customTable/CustomTable';
import { Title } from '../../components/Title';
import Topbar from '../../components/topBar/Topbar';
import cKit from '../../utils/base/coreKit';
import {notice, errorNotice} from '../../components/Common';
import CustomModal from '../../components/customModal/CustomModal';
import netKit from '../../utils/base/networkKit';
import AddFtp from './addFtp.jsx';
class FtpManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            total: 0,
            page: 1,
            pageList: [],
            size: 10,
            //高级搜索
            keyword: '',
            notBatchOperate: true,
            //选中记录信息（当前页）
            selectedRecords: [],
            record: {},
            //弹窗是否显示
            isAdding: false,


        }
    }

    //高级搜索
    advanceSearch = (keyword) => {
        this.getRecordsFetch({
            keyword,
            page: 1,
        });
    }
    addFtp = ()=> {
        this.setState({
            isAdding: true,
            record: {},
        })
    }

    componentDidMount() {
        this.getRecordsFetch({});
    }
    getRecordsFetch = ({
        keyword = this.state.keyword,
        page = this.state.page,
        size = this.state.size
        }) => {
        //page最小为1
        page <= 0 && (page  = 1);
        this.setState({
            loading: true,
        });

        let successHandler = (response) => {
            if(response.code == cKit.ResponseCode.SUCCESS_CODE){
                let oResult = response.datas;
                this.setState({
                    page,
                    size,
                    keyword,
                    total: oResult.total,
                    pageList: oResult.pageList,
                });
            }else {
                errorNotice(response.msg);
            }
        };

        let url = '/ftp/list';
        netKit.getFetch({
            url,
            data: {keyword, page, size},
            success: successHandler,
            error: this.errorHandler,
            complete: () => {
                this.setState({
                    loading: false
                });
            }
        });
    }

    pageChange = (page, size) => {
        this.getRecordsFetch({
            page,
            size,
        });
        //清空上面操作
        this.setState({
            notBatchOperate: true,
        });
    }
    //删除
    isDeleteRecord = (record) => {//不传值为批量操作
        let isBatch = !record;
        let records = isBatch ? this.state.selectedRecords : [record];
        if (records.length) {
            CustomModal.confirm({
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
            notice('请至少勾选一条记录');
        }
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

        let url = '/ftp/delete';
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
    errorHandler = (error) => {
        errorNotice('未知错误');
    };
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
    modalCancel = () => {
        this.setState({
            isAdding: false,


        })
    }
    afterAddSubmit = () => {
        this.modalCancel();
        this.updateLocalRecords();
    }


    render() {
        const columns = [{
            title: 'ftpIP',
            dataIndex: 'ftpIp',
            key: 'ftpIp',
            width: '13%'
        }, {
            title: 'ftp端口',
            dataIndex: 'ftpPort',
            key: 'ftpPort',
            width: '13%'
        }, {
            title: 'ftp用户',
            dataIndex: 'ftpUser',
            key: 'ftpUser',
            width: '13%'
        },{
            title: 'ftp密码',
            dataIndex: 'ftpPasswd',
            key: 'ftpPasswd',
            width: '13%'
        }, {
            title: '应用ID',
            dataIndex: 'appId',
            key: 'appId',
            width: '13%'
        }, {
            title: '应用秘钥',
            dataIndex: 'appSecret',
            key: 'appSecret',
            width: '13%'
        },{
            title: '操作',
            render: (text, record) => (
                <span>
                    <Tooltip onClick={() => this.isDeleteRecord(record)} title="删除">
                        <Icon type="delete" className="dangerous-icon"/>
                    </Tooltip>
          </span>
            ),
        }];
        // 设置行选择
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
            },
            onSelect: (record, selected, selectedRows) => {
                this.state.selectedRecords = selectedRows;
                this.setState({
                    notBatchOperate: !selectedRows.length
                });
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                this.state.selectedRecords = selectedRows;
                this.setState({
                    notBatchOperate: !selectedRows.length
                });
            },
        };

        const leftBottomRect = (
            <div>
                <Button icon="plus" onClick={() => this.addFtp()} type="primary">新增</Button>
        <span style={{paddingLeft:10}}>
          <Button
              icon="delete"
              disabled={this.state.notBatchOperate}
              onClick={() => this.isDeleteRecord()}
              type="danger"
          >删除</Button>
        </span>
            </div>
        );
        return (<div>
            <Topbar currentSearch={this.advanceSearch} keywordChange={this.advanceSearch} placeholder={"请输入参数名称、参数编码"}/>
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
            <AddFtp
                visible={this.state.isAdding}
                onCancel={this.modalCancel}
                success={this.afterAddSubmit}
            />
        </div>)
    }
}
export default Form.create({})(FtpManager)