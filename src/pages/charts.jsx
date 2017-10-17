import React from 'react'
import Topbar from '../components/topBar/Topbar'
import {Title} from '../components/Title'
import echarts from 'echarts'
import cKit from '../utils/base/coreKit';
import netKit from '../utils/base/networkKit';
import {errorNotice} from '../components/Common';
import CustomSelect from '../components/CustomSelect';
import {DatePicker, Icon} from 'antd';
import moment from 'moment';
import '../less/chart.less'
const {MonthPicker} = DatePicker;

export default class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentChart: 0,
      orgList: [],
      orgId: '',
      searchTimesBeginDate: moment().add(-1, 'year'),
      searchTimesEndDate: moment(),
      filesCountBeginDate: moment().add(-1, 'year'),
      filesCountEndDate: moment(),
    }
    this.searchTimesData = {
      categoryList: [],
      monthLine: []
    }
    this.filesCountData = []
  }

  componentDidMount() {
    this.EChartArchiveCount = echarts.init(this.archiveCountsChart);
    this.EChartSearchTimes = echarts.init(this.searchTimesChart);
    this.getOrgList()
    this.chartInit()
  }

  componentDidUpdate() {
    this.EChartArchiveCount = echarts.init(this.archiveCountsChart);
    this.EChartSearchTimes = echarts.init(this.searchTimesChart);
    this.chartInit()
  }

  chartInit = (flag) => {

    if(flag === 'searchTimes'){
      this.drawLine(this.EChartSearchTimes)
    }else if(flag === 'archiveCount'){
      this.drawPie(this.EChartArchiveCount)
    }else {
      this.drawPie(this.EChartArchiveCount)
      this.drawLine(this.EChartSearchTimes)
    }
  }

  getArchiveFilesOption = () => {
    let categoryItems = []
    let categoryList = this.filesCountData;

    for (let i in categoryList) {
      let categoryColor = '';
      if (categoryList[i].rootCategoryPrefix === 'PZ') {
        categoryColor = '#12bce7'
      } else if (categoryList[i].rootCategoryPrefix === 'ZB') {
        categoryColor = '#8863b9'
      } else if (categoryList[i].rootCategoryPrefix === 'BB') {
        categoryColor = '#6aecb9'
      } else {
        categoryColor = '#f76855'
      }
      categoryList[i].itemStyle = {
        normal: {
          color: categoryColor
        }
      }
      categoryItems.push({
        name: categoryList[i].name,
        textStyle: {
          color: categoryColor
        },
        icon: 'none'
      })
    }

    let pieOption = {
      textStyle: {
        color: '#ccc'
      },
      backgroundColor: '#515151',
      title: {
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ccc'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      visualMap: {
        show: false,
        inRange: {
          colorLightness: [0.4, 0.6]
        }
      },
      legend: {
        orient: 'horizontal',
        data: categoryItems,
        textStyle: {
          color: '#ccc'
        },
        x: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: categoryList,
          roseType: 'angle',
          label: {
            normal: {
              textStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }
          },
          labelLine: {
            normal: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.3)'
              },
              smooth: 0.2,
              length: 10,
              length2: 20
            }
          },
          itemStyle: {
            normal: {
              //color: '#c23531',
              shadowBlur: 200,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    return pieOption;
  }

  getSearchTimesOptions = () => {
    let categoryList = this.searchTimesData.categoryList;
    let colorList = [];
    let categoryItems = []
    for (let i in categoryList) {
      let categoryColor = '';
      if (categoryList[i].rootCategoryPrefix === 'PZ') {
        categoryColor = '#12bce7';
        colorList[i] = '#12bce7';
      } else if (categoryList[i].rootCategoryPrefix === 'ZB') {
        categoryColor = '#8863b9';
        colorList[i] = '#8863b9';
      } else if (categoryList[i].rootCategoryPrefix === 'BB') {
        categoryColor = '#6aecb9';
        colorList[i] = '#6aecb9';
      } else {
        categoryColor = '#f76855';
        colorList[i] = '#f76855';
      }
      categoryList[i].type = 'line';
      categoryList[i].stack = '总次数';
      categoryList[i].smooth = true;
      categoryList[i].areaStyle =
        {
          normal: {
            color: categoryColor
          }
        };
      categoryList[i].lineStyle =
        {
          normal: {
            color: categoryColor
          }
        };
      categoryItems.push({
        name: categoryList[i].name,
        textStyle: {
          color: categoryColor
        },
        icon: 'none'
      })
    }
    const searchTimesOption = {
      color: colorList,
      title: {
        text: '',
        textStyle: {
          color: '#ccc'
        }
      },
      textStyle: {
        color: '#ccc'
      },
      backgroundColor: '#515151',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        textStyle: {
          color: '#ccc'
        }
      },
      legend: {
        data: categoryItems,
        textStyle: {
          color: '#ccc'
        },
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: this.searchTimesData.monthLine
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: categoryList
    };
    return searchTimesOption;
  }

  drawPie = (pane) => {
    pane.setOption(this.getArchiveFilesOption());
  }

  drawLine = (pane) => {
    pane.setOption(this.getSearchTimesOptions());
  }

  prev = () => {
    let currentChart = this.state.currentChart;
    if (currentChart <= 0) {
      return
    }
    this.setState({
      currentChart: currentChart - 1
    })
  }

  next = () => {
    let currentChart = this.state.currentChart;
    if (currentChart >= 1) {
      return
    }
    this.setState({
      currentChart: currentChart + 1
    })
  }

  getOrgList = () => {
    let thiz = this;
    let successHandler = function (response) {
      let {datas, code, msg} = response;
      if (code == cKit.ResponseCode.SUCCESS_CODE) {
        if(datas.length <= 0){
          return
        }
        let defaultOrgId = datas[0] ? datas[0].value : '';
        thiz.setState({
          orgId: defaultOrgId,
          orgList: datas,
          filesCountEndDate: datas[0].extend ? moment(datas[0].extend.lastArchiveYear + '-' + datas[0].extend.lastArchiveMonth, 'YYYY-MM') : moment(),
          filesCountBeginDate: datas[0].extend ? moment(datas[0].extend.lastArchiveYear + '-' + datas[0].extend.lastArchiveMonth, 'YYYY-MM').add(-1, 'year') : moment().add(-1, 'year'),
        })
        thiz.getArchiveCountRecord({
          orgId: defaultOrgId,
          filesCountEndDate: datas[0].extend ? moment(datas[0].extend.lastArchiveYear + '-' + datas[0].extend.lastArchiveMonth, 'YYYY-MM') : moment(),
          filesCountBeginDate: datas[0].extend ? moment(datas[0].extend.lastArchiveYear + '-' + datas[0].extend.lastArchiveMonth, 'YYYY-MM').add(-1, 'year') : moment().add(-1, 'year'),
        })
        thiz.getSearchTimesRecord({
          searchTimesBeginDate: thiz.state.searchTimesBeginDate,
          searchTimesEndDate: thiz.state.searchTimesEndDate,
          orgId: defaultOrgId
        })
      } else {
        errorNotice(msg)
      }
    }
    let errorHandler = function (error) {
      errorNotice(error)
    }
    let url = cKit.makeUrl('/stat/org/dropdown');
    let action = new netKit.CorsGetAction(null, url, successHandler, errorHandler);
    action.submit();
  }

  orgChange = (orgId) => {
    let filesCountEndDate = moment()
    let filesCountBeginDate = moment().add(-1, 'year')
    let orgList = this.state.orgList;
    for (let i in orgList) {
      if (orgList[i].value == orgId) {
        if(orgList[i].extend){
          let lastArchiveYear = orgList[i].extend.lastArchiveYear;
          let lastArchiveMonth = orgList[i].extend.lastArchiveMonth;
          filesCountEndDate = moment(lastArchiveYear + '-' + lastArchiveMonth, 'YYYY-MM')
          filesCountBeginDate = moment(lastArchiveYear + '-' + lastArchiveMonth, 'YYYY-MM').add(-1, 'year')
        }
        this.setState({
          filesCountEndDate,
          filesCountBeginDate,
          orgId
        })
        break
      }
    }
    this.getArchiveCountRecord({
      filesCountBeginDate,
      filesCountEndDate,
      orgId
    })
    this.getSearchTimesRecord({
      searchTimesBeginDate: this.state.searchTimesBeginDate,
      searchTimesEndDate: this.state.searchTimesEndDate,
      orgId
    })
  }

  getArchiveCountRecord = (parms) => {
    let thiz = this;
    let successHandler = function (response) {
      let {datas, code, msg} = response;
      if (code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.filesCountData = datas
        thiz.chartInit('archiveCount')
      } else {
        errorNotice(msg)
      }
    }
    let errorHandler = function (error) {
      errorNotice(error)
    }
    let url = cKit.makeUrl('/stat/file');
    let postBody = {
      "condition": [
        {
          "beginAccountYear": parms ? parms.filesCountBeginDate.year() : this.state.filesCountBeginDate.year(),
          "beginAccountMonth": parms ? parms.filesCountBeginDate.month() + 1 : this.state.filesCountBeginDate.month() + 1
        },
        {
          "endAccountYear": parms ? parms.filesCountEndDate.year() : this.state.filesCountEndDate.year(),
          "endAccountMonth": parms ? parms.filesCountEndDate.month() + 1 : this.state.filesCountEndDate.month() + 1
        },
        {
          "orgId": parms.orgId || this.state.orgId
        }
      ]
    }
    if(!postBody.condition[2].orgId){
      return
    }
    let action = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    action.submit();
  }

  getSearchTimesRecord = (parms) => {
    let thiz = this;
    let successHandler = function (response) {
      let {datas, code, msg} = response;
      if (code == cKit.ResponseCode.SUCCESS_CODE) {
        thiz.searchTimesData.categoryList = datas.categoryList;
        thiz.searchTimesData.monthLine = datas.monthLine;
        thiz.chartInit('searchTimes')
      } else {
        errorNotice(msg)
      }
    }
    let errorHandler = function (error) {
      errorNotice(error)
    }
    let url = cKit.makeUrl('/stat/preview');
    let postBody = {
      "condition": [
        {
          "beginYear": parms.searchTimesBeginDate.year() || this.state.searchTimesBeginDate.year(),
          "beginMonth": parms.searchTimesBeginDate.month() + 1 || this.state.searchTimesBeginDate.month() + 1
        },
        {
          "endYear": parms.searchTimesEndDate.year() || this.state.searchTimesEndDate.year(),
          "endMonth": parms.searchTimesEndDate.month() + 1 || this.state.searchTimesEndDate.month() + 1
        },
        {
          "orgId": parms.orgId || this.state.orgId
        }
      ]
    }
    if(!postBody.condition[2].orgId){
      return
    }
    let action = new netKit.CorsPostAction(null, url, postBody, successHandler, errorHandler);
    action.submit();
  }

  changeBeginDate = (date) => {
    if (this.state.currentChart === 0) {
      this.setState({
        searchTimesBeginDate: date
      })
      this.getSearchTimesRecord({
        searchTimesBeginDate: date,
        searchTimesEndDate: this.state.searchTimesEndDate
      })
    } else {
      this.setState({
        filesCountBeginDate: date
      })
      this.getArchiveCountRecord({
        filesCountEndDate: this.state.filesCountEndDate,
        filesCountBeginDate: date,
      })
    }
  }

  changeEndDate = (date) => {
    if (this.state.currentChart === 0) {
      this.setState({
        searchTimesEndDate: date
      })
      this.getSearchTimesRecord({
        searchTimesBeginDate: this.state.searchTimesBeginDate,
        searchTimesEndDate: date
      })
    } else {
      this.setState({
        filesCountEndDate: date
      })
      this.getArchiveCountRecord({
        filesCountEndDate: date,
        filesCountBeginDate: this.state.filesCountBeginDate
      })
    }
  }

  render() {
    return (
      <div>
        <Topbar />
        <div className="main-content main-content-animate">
          { Title() }
          <div className="charts-table">
            <div className="charts-table-top">
              <span className="charts-tab-box">
                <a onClick={this.prev} disabled={this.state.currentChart <= 0}><Icon type="left"/></a>
                {
                  this.state.currentChart === 1
                  &&
                  <span>归档文件数量</span>
                }
                {
                  this.state.currentChart === 0
                  &&
                  <span>档案查询次数</span>
                }
                <a onClick={this.next} disabled={this.state.currentChart >= 1}><Icon type="right"/></a>
              </span>
            </div>
            <div className="charts-bar">
              <CustomSelect
                className="charts-org-select"
                placeholder="选择单位"
                dataSource={this.state.orgList}
                value={this.state.orgId + ""}
                onChange={this.orgChange}
                notFoundContent="无归档单位"
              />
              <div style={{
                width: 250,
                display: 'inline-block',
                marginLeft: 50
              }}>
                <MonthPicker
                  placeholder="开始时间"
                  style={{
                    backgroundColor: '#515151'
                  }}
                  className="charts-date-range"
                  format={'YYYY-MM'}
                  allowClear={false}
                  onChange={this.changeBeginDate}
                  value={this.state.currentChart === 0 ? this.state.searchTimesBeginDate : this.state.filesCountBeginDate}
                  disabledDate={
                    (currentDate) => {
                      return currentDate > (this.state.currentChart === 0 ? this.state.searchTimesEndDate : this.state.filesCountEndDate)
                    }
                  }
                />
                --
                <MonthPicker
                  placeholder="结束时间"
                  style={{
                    backgroundColor: '#515151'
                  }}
                  className="charts-date-range"
                  format={'YYYY-MM'}
                  allowClear={false}
                  onChange={this.changeEndDate}
                  value={this.state.currentChart === 0 ? this.state.searchTimesEndDate : this.state.filesCountEndDate}
                  disabledDate={
                    (currentDate) => {
                      return currentDate < (this.state.currentChart === 0 ? this.state.searchTimesBeginDate : this.state.filesCountBeginDate)
                    }
                  }
                />
              </div>
            </div>
            <div className="charts-content-box clearFloat"
                 style={{
                   display: this.state.currentChart === 1 ? 'block' : 'none'
                 }}
            >
              <div className="chart-pie" ref={(node) => this.archiveCountsChart = node}/>
            </div>
            <div className="charts-content-box clearFloat"
                 style={{
                   display: this.state.currentChart === 0 ? 'block' : 'none'
                 }}
            >
              <div className="chart-pie" ref={(node) => this.searchTimesChart = node}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}