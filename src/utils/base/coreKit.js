/**
 * Created by tandajun on 2017/1/9.
 * 定义有关核心工具方法
 *
 * last update:
 * zhaolongwei 20170629 把checkFileType移到此处;
 */

import moment from 'moment';

import wordFile from '../../images/filestyle/word.png';
import pdfFile from '../../images/filestyle/pdf.png';
import pptFile from '../../images/filestyle/ppt.png';
import txtFile from '../../images/filestyle/txt.png';
import excelFile from '../../images/filestyle/excel.png';

//根据环境变量
let Config = require('./config')

let __extends = function(d, b) {
  for (let p in b)
    if (b.hasOwnProperty(p)) d[p] = b[p];

  function __() {
    this.constructor = d;
  };
  __.prototype = b.prototype;
  d.prototype = new __();
};

/**
 * url 相关的工具
 * @type {{getRequest: getRequest, setRequest: setRequest, getPathname: getPathname}}
 */
let UrlUtils = {
  // 获取当前页面的url带有的各种参数
  getRequest: function() {
    /* eslint-disable no-restricted-globals*/
    let url = location.search; //获取url中'?'符后的字串
    /* eslint-enable no-restricted-globals*/
    let theRequest = {};
    if (url.indexOf('?') != -1) {
      let str = url.substr(1);
      let strs = str.split('&');
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = decodeURIComponent(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  },
  setRequest: function(url, request) {
    if (typeof url !== 'string') {
      request = url;
      url = '';
    }
    let count = 0;
    for (let index in request) {
      if (request.hasOwnProperty(index)) {
        if (count === 0) {
          url += ('?' + index + '=' + encodeURIComponent(request[index]));
          count++;
        } else {
          url += ('&' + index + '=' + encodeURIComponent(request[index]));
        }
      }
    }
    return url;
  },
  getPathname: function() {
    let url = location.pathname; //pathname 属性是一个可读可写的字符串，可设置或返回当前 URL 的路径部分。

    if (url.indexOf('.html') != -1) {
      let str = url.substring(0, url.length - 5);
      return str.split("/");
    }
  }
};

/**
 * 用来存储接口返回code库
 * @type {{}}
 */
let ResponseCode = {
  SUCCESS_CODE: "0000",
  ERROR: "9999"
};

/**
 * 判断环境是否为生产环境
 * @type {{Protocal: string, IP: string, Port: number}}
 */
let autoSwitchConfig = Config.Develop
if (process.env.NODE_ENV === 'production') {
  autoSwitchConfig = Config.Release
}

/**
 * 返回API地址的根路径。
 * @returns {string} API地址的根路径，结尾没有“/”
 */
let getApiBaseUrl = function() {
  return autoSwitchConfig.Protocal + '://' + autoSwitchConfig.IP + ':' + autoSwitchConfig.Port + autoSwitchConfig.Context

}

let mockApiBaseUrl = function() {
  let mock = Config.Mock
  return mock.Protocal + '://' + mock.IP + ':' + mock.Port + autoSwitchConfig.Context
}

/**
 * 如果没有传递参数，则只返回根路径。
 * @param url
 * @returns {string}
 */
let makeUrl = function(url, oParam = {}) {
  let baseUrl = getApiBaseUrl();
  url = baseUrl + (url || '');

  oParam.t = Date.now();

  let and = url.indexOf('?') == -1 ? '?' : '&';
  let sParam = json2url(oParam);
  sParam && (url += and + sParam);

  return url;
}

let makeMockUrl = function(url) {
  return mockApiBaseUrl() + (url || '');
}

/*
 * 格式化时间数据
 * tip: 如果传入参数为字符串，且没有“时”，则hour为8而非0
 */
let date2json = (dateObj = new Date()) => {
  if(isArray(dateObj)){
    return dateObj.map((item) => {
      return date2json(item);
    });
  }
  if(isMoment(dateObj)){
    dateObj = dateObj.toString();
  }
  dateObj = isString(dateObj) ? new Date(dateObj) : dateObj;
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let date = dateObj.getDate();

  let day = dateObj.getDay();
  day = (day || 7); //当为0（周日）时，改为7

  let hour = dateObj.getHours();
  let minute = dateObj.getMinutes();
  let second = dateObj.getSeconds();

  let sMonth = toDoubleNumString(month);
  let sDate = toDoubleNumString(date);
  let sHour = toDoubleNumString(hour);
  let sMinute = toDoubleNumString(minute);
  let sSecond = toDoubleNumString(second);
  let short = year + '-' + sMonth + '-' + sDate;
  let long = short + ' ' + sHour + ':' + sMinute + ':' + sSecond;

  return {
    year,
    month,
    date,
    day,
    hour,
    minute,
    second,
    short,
    long,
    sMonth,
    sDate,
    sHour,
    sMinute,
    sSecond,
    sDay: day + '',
    sYear: year + '',
  }
}

//复制（深度）复杂数据，主要用于json和array
let copyJson = (json) => {
  return JSON.parse(JSON.stringify(json));
};

let isVirtualDom = (obj) => {
  return isObject(obj) && obj.$$typeof != null;
};

let isObject = isThisType('Object');
let isString = isThisType('String');
let isNumber = isThisType('Number');
let isFunction = isThisType('Function');
let isFormData = isThisType('FormData');
let isArray = Array.isArray;
let isMoment = (obj) => {
  return obj instanceof moment
};

function isThisType(type) {
  return function(obj) {
    return {}.toString.call(obj) === '[object ' + type + ']';
  }
}

function json2url(obj) {
  let arr = [];
  for (let attr in obj) {
    arr.push(attr + '=' + encodeURIComponent((obj[attr] || '')));
  }
  return arr.join('&');
}

function toDoubleNumString(num){
  return (num < 10 ? '0' + num : num) + '';
}

function getCookie(name) {
  let arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
  if(arr=document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}

function rememberMe(username) {
  if(username && isString(username)){
    let exp = new Date();
    exp.setTime(exp.getTime() + 30*24*3600000); //30天有效期
    document.cookie = "KJDA-REMEMBER-ME="+username+";expires="+exp.toGMTString();
  }else {
    let exp = new Date();
    exp.setTime(exp.getTime() -1 ); //立即失效
    document.cookie = "KJDA-REMEMBER-ME='';expires="+exp.toGMTString();
  }
}

function getRememberUsername() {
  return getCookie('KJDA-REMEMBER-ME');
}

function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  let byteCharacters = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    let slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  let blob = new Blob(byteArrays, {type: contentType});
  return blob;
}


/**
 @上传文件类型
 @return 文件类型信息
 */
let checkFileType = (file) => {
  let re = {isImg: false};
  let name = file.name
  if (/\.(jpg|jpeg|png|bmp)$/i.test(name)) {
    re.img = file.thumbUrl;
    re.isImg = true;
  } else if (/\.(pdf)$/i.test(name)) {
    re.img = pdfFile;
  } else if (/\.(doc|docx)$/i.test(name)) {
    re.img = wordFile;
  } else if (/\.(xls|xlsx)$/i.test(name)) {
    re.img = excelFile;
  // } else if (/\.(ppt|pptx)$/i.test(name)) {
  //   re.img = pptFile;
  } else if (/\.(txt)$/i.test(name)) {
    re.img = txtFile;
  } else {
    return null;
  }
  re.ext = RegExp.$1;

  return re;
}

export default {
  isObject,
  isString,
  isFunction,
  isNumber,
  isArray,
  json2url,
  isFormData,
  isVirtualDom,
  isMoment,
  date2json,
  copyJson,
  b64toBlob,
  checkFileType,
  UrlUtils: UrlUtils,
  ResponseCode: ResponseCode,
  makeMockUrl: makeMockUrl,
  makeUrl: makeUrl,
  __extends: __extends,
  rememberMe: rememberMe,
  getRememberUsername: getRememberUsername
};
