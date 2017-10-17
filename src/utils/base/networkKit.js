/**
 * Created by tandajun on 2017/1/9.
 * 定义有关net work的方法
 */
import userStore from '../../stores/userStore';
import browserHistory from '../../libs/browserHistory';

import ckit from './coreKit';
import _ from 'underscore';

require('es6-promise').polyfill(); //支持一些 原本不支持fetch的浏览器
require('isomorphic-fetch');
let fetchJsonp = require('fetch-jsonp');

let ACTION_TYPE = {
  GET: 1,
  POST: 2,
  CROSDOMAINGET: 3,
  CROSDOMAINPOST: 4,
  JSONP: 5,
  FORMCORSPOST: 6,
  BLOBPOST: 7,
  BLOBGET: 8
};

let commonHeaders = {
  'Content-Type': 'application/json;charset=utf-8'
};

let CommonFetchAction = (function () {
  function CommonFetchAction(actionType, self, url, successHandler, errorHandler, completeHandler) {
    this.actionType = actionType || 'GET';
    this.self = self;
    this.url = url;
    this.headers = new Headers(commonHeaders);
    this.successHandler = successHandler;
    if (!_.isFunction(errorHandler)) {
      console.warn('SimplePostAction: errorHandler should be a function!');
      this.errorHandler = CommonFetchAction.DEFAULT_ERROR_HANDLER;
    } else {
      this.errorHandler = errorHandler;
    }
    this.completeHandler = typeof completeHandler == "function" ? completeHandler : () => {
    }
  }

  CommonFetchAction.prototype.setHeaders = function (headers) {
    this.headers = new Headers(headers);
  };
  CommonFetchAction.prototype.appendHeaders = function (header) {
    for (let key in header) {
      this.headers.append(key, header[key]);
    }
  };

  CommonFetchAction.prototype.buildUrl = function () {
    return this.url;
  };

  CommonFetchAction.prototype.handleSuccess = function (Response) {
    this.successHandler.call(this, this.self, Response);
  };

  CommonFetchAction.prototype.handleError = function (Response) {
    let cb = this.errorHandler;
    if (_.isFunction(cb)) {
      cb.call(this, this.self, Response);
    }
  };

  CommonFetchAction.prototype.submit = function () {
    this.appendHeaders({
      'x-auth-token': userStore.getSessionId()
    })
    switch (this.actionType) {
      case ACTION_TYPE.GET:
        fetchGetExecute(this);
        break;
      case ACTION_TYPE.POST:
        fetchPostExecute(this);
        break;
      case ACTION_TYPE.CROSDOMAINGET:
        fetchCorsGetExecute(this);
        break;
      case ACTION_TYPE.CROSDOMAINPOST:
        fetchCorsPostExecute(this);
        break;
      case ACTION_TYPE.JSONP:
        fetchJsonpExecute(this);
        break;
      case ACTION_TYPE.BLOBPOST:
        //this.setHeaders({});
        /*this.appendHeaders({
          'x-auth-token': userStore.getSessionId(),
          'Content-type': 'application/x-download'
        })*/
        blobPostExecute(this);
        break;
      case ACTION_TYPE.BLOBGET:
        //this.setHeaders({});
        /*this.appendHeaders({
          'x-auth-token': userStore.getSessionId(),
          'Content-type': 'application/x-download'
        })*/
        blobGetExecute(this);
        break;
      case ACTION_TYPE.FORMCORSPOST:
        //清空header
        this.setHeaders({});
        this.appendHeaders({
          'x-auth-token': userStore.getSessionId()
        })
        FormCorsPostExecute(this);
        break;
      default:
        throw 'unknown action type!';

    }
  };
  return CommonFetchAction;
})();

CommonFetchAction.DEFAULT_ERROR_HANDLER = function (self, Response) {
  if (Response === 'error') {
    alert("电脑上网有问题，可以尝试打开别的网站确认下上网是否正常！");
  } else if (Response === 'timeout') {
    alert("你好，系统读取数据有点缓慢，如果连续多次出现此提示，请联系技术支持！");
  } else {
    let code = Response.status ? 'status: ' + Response.status + '\nreadyState: ' + Response.statusText : '';
    alert('这个操作在服务器端出现问题，请联系技术人员！ \n' + code + '\ntext: ' + Response + '\nurl: ' + this.url);
  }
};

/**
 * fetch execute 此方法只支持json返回
 * @param self
 */
function fetchGetExecute(self) {
  const request = new Request(self.url, {
    method: 'GET',
    headers: self.headers,
    cache: 'no-store',
    mode: 'same-origin',
    credentials: 'same-origin'
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.json()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler()
  });
}

/**
 * cors get fetch execute 此方法只支持json返回
 * @param self
 */
function fetchCorsGetExecute(self) {
  const request = new Request(self.url, {
    method: 'GET',
    headers: self.headers,
    cache: 'no-store',
    mode: 'cors',
    //credentials: 'include'
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.json()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler()
  });
}

/**
 * jsonp fetch execute 此方法只支持json返回
 * @param self
 */
function fetchJsonpExecute(self) {
  const requestConfig = {
    //jsonpCallback: 'callback',
    timeout: 5000
  };
  fetchJsonp(self.url, requestConfig).then(function (response) {
    if (response.ok) {
      return response.json();
    } else {
      let error = new Error();
      error.response = response;
      throw error
    }
  }).then(function (json) {
    let res = _.isFunction(json) ? json() : json;
    self.successHandler(res);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler()
  });
}

/**
 * cors post fetch execute
 * @param self
 */
function fetchPostExecute(self) {
  const request = new Request(self.url, {
    method: 'POST',
    headers: self.headers,
    cache: 'no-store',
    mode: 'same-origin',
    credentials: 'same-origin',
    body: JSON.stringify(self.body)
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.json()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler()
  });
}

/**
 * form cors post fetch execute
 * @param self
 */
function FormCorsPostExecute(self) {
  const request = new Request(self.url, {
    method: 'POST',
    headers: self.headers,
    cache: 'no-store',
    mode: 'cors',
    body: self.body
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.json()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler()
  });
}

function fetchCorsPostExecute(self) {
  const request = new Request(self.url, {
    method: 'POST',
    headers: self.headers,
    cache: 'no-store',
    mode: 'cors',
    //credentials: 'include',
    body: JSON.stringify(self.body)
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.json()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler();
  });
}
function blobPostExecute(self) {
  const request = new Request(self.url, {
    method: 'POST',
    headers: self.headers,
    cache: 'no-store',
    mode: 'cors',
    //credentials: 'include',
    body: JSON.stringify(self.body)
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.blob()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler();
  });
}

function blobGetExecute(self) {
  const request = new Request(self.url, {
    method: 'GET',
    headers: self.headers,
    cache: 'no-store',
    mode: 'cors',
    //credentials: 'include',
  });
  fetch(request).then(function (response) {
    let status = response.status;
    if (status >= 200 && status < 300 || status == 304) {
      processResponse(response);
      return response
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error
    }
  }).then(function (response) {
    return response.blob()
  }).then(function (response) {
    if (!sessionWork(response.code)) {
      return
    }
    self.successHandler(response);
  }).catch(function (error) {
    self.errorHandler(error);
    console.error('request failed', error);
  }).then(function () {
    self.completeHandler();
  });
}

/**
 *
 * @param response
 */
function processResponse(response) {
  //存储sessionid from x-auth-token
  if (response.status == '200' && response.headers.get('x-auth-token')) {
    console.log(response.headers.get('x-auth-token'));
    userStore.setSessionId(response.headers.get('x-auth-token'));
  }
}

function sessionWork(code) {
  if (code == '4005') {
    userStore.removeUser();
    userStore.removeSessionId();
    browserHistory.push('/login');
    return false;
  }
  return true;
}

/**
 * simple get
 * @constructor
 */
let SimpleGetAction = (function (_super) {
  ckit.__extends(SimpleGetAction, _super);

  function SimpleGetAction(self, url, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.GET, self, url, successHandler, errorHandler, completeHandler);
  }

  return SimpleGetAction;
})(CommonFetchAction);

/**
 * cors get
 * @constructor
 */
let CorsGetAction = (function (_super) {
  ckit.__extends(CorsGetAction, _super);

  function CorsGetAction(self, url, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.CROSDOMAINGET, self, url, successHandler, errorHandler, completeHandler);
  }

  return CorsGetAction;
})(CommonFetchAction);

/**
 * jsonp
 * @constructor
 */
let JsonpAction = (function (_super) {
  ckit.__extends(JsonpAction, _super);

  function JsonpAction(self, url, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.JSONP, self, url, successHandler, errorHandler, completeHandler);
  }

  return JsonpAction;
})(CommonFetchAction);

/**
 * simple post
 * @constructor
 */
let SimplePostAction = (function (_super) {
  ckit.__extends(SimplePostAction, _super);

  function SimplePostAction(self, url, body, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.POST, self, url, successHandler, errorHandler, completeHandler);
    this.body = body;
  }

  return SimplePostAction;
})(CommonFetchAction);

/**
 * simple post
 * @constructor
 */
let CorsPostAction = (function (_super) {
  ckit.__extends(SimplePostAction, _super);

  function SimplePostAction(self, url, body, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.CROSDOMAINPOST, self, url, successHandler, errorHandler, completeHandler);
    this.body = body;
  }

  return SimplePostAction;
})(CommonFetchAction);

/**
 * FormCorsPostAction
 */
let FormCorsPostAction = (function (_super) {
  ckit.__extends(FormCorsPostAction, _super);

  function FormCorsPostAction(self, url, body, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.FORMCORSPOST, self, url, successHandler, errorHandler, completeHandler);
    this.body = body;
  }

  return FormCorsPostAction;
})(CommonFetchAction);


/**
 * BlobPostAction
 */
let BlobPostAction = (function (_super) {
  ckit.__extends(BlobPostAction, _super);

  function BlobPostAction(self, url, body, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.BLOBPOST, self, url, successHandler, errorHandler, completeHandler);
    this.body = body;
  }

  return BlobPostAction;
})(CommonFetchAction);

/**
 * BlobGetAction
 */
let BlobGetAction = (function (_super) {
  ckit.__extends(BlobGetAction, _super);

  function BlobGetAction(self, url, successHandler, errorHandler, completeHandler) {
    _super.call(this, ACTION_TYPE.BLOBGET, self, url, successHandler, errorHandler, completeHandler);
  }

  return BlobGetAction;
})(CommonFetchAction);

/**
 * get请求
 * tip: 传param参数无效，请使用data
 *  opt.urlAppend:
 *   用于处理类似 /file/detail/{fileName}/{fileType} 的接口，[fileName, fileType]
 */
let getFetch = function (opt = {}) {
  opt.type = 'get';
  return commonFetch(opt);
};

/**
 * post请求
 * tip:
 *  opt.data: json数据用
 *  opt.param: 拼接在url上的参数，{page: 1, size: 10} -> ?page=1&size=10
 *  opt.urlAppend:
 *   用于处理类似 /file/detail/{fileName}/{fileType} 的接口，[fileName, fileType]
 */
let postFetch = function (opt = {}) {
  opt.type = 'post';
  return commonFetch(opt);
};

let commonFetch = function (opt = {}) {
  let type = opt.type || 'get';
  let data = opt.data || {};
  let param = opt.param || {};
  let srcUrl = opt.url || '';
  let emptyFn = () => {
  };
  let urlAppend = opt.urlAppend || []
  let success = opt.success || emptyFn;
  let error = opt.error || emptyFn;
  let complete = opt.complete || emptyFn;
  let self = opt.self || null;
  let dataType = opt.dataType || 'json';

  let isGet = type == 'get';
  isGet && (param = data);

  for (let i = 0; i < urlAppend.length; i++) {
    srcUrl += '/' + urlAppend[i];
  }

  let url = ckit.makeUrl(srcUrl, param);
  let action;
  if (isGet) {
    let actionConstractor;
    if(dataType == 'stream'){
      actionConstractor = BlobGetAction;
    } else {
      actionConstractor = CorsGetAction;
    }
    action = new actionConstractor(self, url, success, error, complete);
  } else {
    let actionConstractor;
    if(dataType == 'stream'){
      actionConstractor = BlobPostAction;
    } else {
      actionConstractor = ckit.isFormData(data) ? FormCorsPostAction : CorsPostAction;
    }
    action = new actionConstractor(self, url, data, success, error, complete);
  }

  return {
    action,
    submit: action.submit()
  };
}


export default {
  getFetch,
  postFetch,
  SimpleGetAction: SimpleGetAction,
  SimplePostAction: SimplePostAction,
  CorsPostAction: CorsPostAction,
  CorsGetAction: CorsGetAction,
  JsonpAction: JsonpAction,
  FormCorsPostAction: FormCorsPostAction,
  BlobPostAction: BlobPostAction,
  BlobGetAction: BlobGetAction
};
