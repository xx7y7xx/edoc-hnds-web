/**
 * Created by APP on 2017/4/24.
 */
import {
  Message
} from './l10n'

import _ from 'underscore';

export let Validator = {
  Utils: {
    // 将数字和字符串转换为字符串
    toString: function toString(text) {
      if (_.isNumber(text)) {
        return '' + text;
      } else if (_.isString(text)) {
        return text;
      } else {
        return '';
      }
    },
    // 生成ValidatorResult
    createValidatorResult: function(result, message) {
      return {
        result: result,
        message: message
      };
    }
  }
};


Validator.create = function create(message, v) {
  if (_.isUndefined(message)) {
    throw ('Incorrect validator message!');
  }

  let va = function Validator() {
    return v.apply(this, arguments);
  };
  va.message = message;

  return va;
};

//只用正则创建validate
Validator.createWithRegEx = function createWithRegEx(message, regex) {
  let _regex = regex;
  return Validator.create(message, function(text) {
    if (text) {
      return _regex.test(text);
    }

    return false;
  });
};

// 可为空的验证器
Validator.createEmptyWithRegEx = function createWithRegEx(message, regex) {
  let _regex = regex;
  return Validator.create(message, function(text) {
    if (text) {
      return _regex.test(text);
    }
    return true;
  });
};
//与数字有关的验证器
Validator.createWithNumericRegEx = function createWithNumericRegEx(message, regex) {
  let _regex = regex;
  return Validator.create(message, function(text) {
    if (text || text === 0) {
      return (regex.test(text) || (text == '0'));
    }

    return false;
  });
};

// 自定义
Validator.DEFINE = Validator.create;

// 非空验证器('null')
Validator.RadioGroupNONEMPTY = Validator.create(Message.nonemptyValidator,
  function(text) {
    return text != "null";
  }
);
//非0验证器
Validator.NONZERO = Validator.create(Message.nonzeroValidator,
  function(text) {
    if (parseFloat(text) === 0) {
      return false;
    }
    return true;
  });

//最多能输入两位小数
Validator.PERCENTAGE_NUMERIC_2DECIMAL = Validator.create(Message.percentageNumeric2decimal,
  function(text) {
    let str = Validator.Utils.toString(text);
    let reg = /^[0-9]+(\.[0-9]{1,2}){0,1}$/;
    if (str) {
      if (reg.test(str)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
);
//最多能输入两位小数正负都可以
Validator.PERCENTAGE_NUMERIC_2DECIMALV2 = Validator.create(Message.percentageNumeric2decimal,
  function(text) {
    let str = Validator.Utils.toString(text);
    let reg = /^[-+]?[0-9]+(\.[0-9]{1,2}){0,1}$/;
    if (str) {
      if (reg.test(str)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }

  }
);
// 密码验证器
Validator.PASSWORD = Validator.create(Message.passwordValidator,
  function(text) {
    let str = Validator.Utils.toString(text);
    let regx = /^(?=.*[a-zA-Z].*)([a-zA-Z0-9]{6,16})$/;
    if (regx.test(str)) {
      return true;
    } else {
      return false;
    }
  }
);
//微信验证器  第一位为字母 6-20位数字字母下划线减号组成
Validator.WEIXIN = Validator.create(Message.loginNamValidatorWeixin,
  function(text) {
    let str = Validator.Utils.toString(text);
    let regx = /(^[a-zA-Z]{1})([a-zA-Z0-9_-]{5,19})/g;
    if (str == "" || regx.test(str)) {
      return true;
    } else {
      return false;
    }
  }
);
// 登录名证器
Validator.LOGIN_NAME = Validator.create(Message.loginNamValidator,
  function(text) {
    let str = Validator.Utils.toString(text);
    let regx = /^(?=.*[a-zA-Z].*)([a-zA-Z0-9]{4,20})$/;
    if (regx.test(str)) {
      return true;
    } else {
      return false;
    }
  }
);

/* 范围验证器
 * @param min 数字 范围最小值
 * @param max 数字 范围最大值
 * 假设x为能过验证的数字 min <= x <= max
 * 当min不需要时，用null代替
 */
Validator.RANGE = function(min, max, step) {
  if (min !== null && (min === undefined || !_.isNumber(min))) {
    throw ('Params should be numbers!');
  }
  if (min === null && (max === null || max === undefined)) {
    throw ('At least one param required!');
  }
  if (!_.isUndefined(max) && !_.isNumber(max)) {
    throw ('Params should be numbers!');
  }
  let errorMessage = '';
  if (min === null) {
    errorMessage = Message.rangeValidatorFormatString1.format('' + max);
  } else if (max === null || max === undefined) {
    errorMessage = Message.rangeValidatorFormatString2.format('' + min);
  } else {
    errorMessage = Message.rangeValidatorFormatString3.format('' + min, '' + max);
  }
  return Validator.create(errorMessage,
    function(text) {
      let value = parseFloat(text)

      if (min === null) {
        return value <= max;
      } else if (max === null || max === undefined) {
        return value >= min;
      } else {
        return value >= min && value <= max;
      }
      return false;
    }
  );
}


//字母 数字 特殊字符
Validator.SPECIAL_CHARACTER = Validator.createWithNumericRegEx(Message.allNumberValidator,
  /^[\w`~!@#$%^&*()\-+=]+$/i);
//全数字、字母、下划线
Validator.WORD = Validator.createWithNumericRegEx(Message.allNumberValidator,
  /^\w+$/i);
//全数字、字母、下划线、汉字
Validator.WORD_CHINESE = Validator.createWithNumericRegEx(Message.allNumberValidator,
  /^[\u4e00-\u9fa5\w]+$/i);
//全数字和字母验证
Validator.ALLLETTERNUMBER = Validator.createWithNumericRegEx(Message.allNumberValidator,
  /^[0-9a-z]+$/i);
//有简体中文验证（不包含中文字符）
Validator.HASCHINESE = Validator.createWithNumericRegEx(Message.allNumberValidator,
  /[\u4e00-\u9fa5]+/);
//全数字验证
Validator.ALLNUMBER = Validator.createWithNumericRegEx(Message.allNumberValidator,
  /^\d+$/);
// 小数验证器（可为负）
Validator.NUMERIC = Validator.createWithNumericRegEx(Message.numericValidator,
  /^[-+]?[0-9]+(\.[0-9]+)?$/);
// 小数验证器（0和正数）
Validator.POSITIVE_NUMERIC = Validator.createWithNumericRegEx(Message.positiveNumericValidator,
  /^[0-9]+(\.[0-9]+)?$/);
// 可为空小数验证器（0和正数）
Validator.EMPTY_POSITIVE_NUMERIC = Validator.createEmptyWithRegEx(Message.positiveNumericValidator,
  /^[0-9]+(\.[0-9]+)?$/);
// 整数验证器（可为负）
Validator.INTEGER = Validator.createWithNumericRegEx(Message.integerValidator,
  /^[-+]?[1-9]+[0-9]*$/);
// 正整数验证器（0和正整数）
Validator.POSITIVE_INTEGER = Validator.createWithNumericRegEx(Message.positiveIntegerValidator,
  /^[1-9]+[0-9]*$/);
// 可为空的整数验证器（0和正整数）
Validator.EMPTY_POSITIVE_INTEGER = Validator.createEmptyWithRegEx(Message.positiveIntegerValidator,
  /^([1-9]+[0-9]*)|0$/);
// 正整数验证器(可空，非0)
Validator.POSITIVE_INTEGER_NONZERO = Validator.createEmptyWithRegEx(Message.positiveIntegerValidator,
  /^[1-9]+[0-9]*$/);
//URL验证器
Validator.URL = Validator.createEmptyWithRegEx('输入正确的url', /(^http:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?)|(^https:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?)/);
// EMAIL验证器
Validator.EMAIL = Validator.createWithRegEx(Message.emailValidator,
  /^[_A-Za-z0-9-]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/);
// 身份证号验证器
Validator.IDENTITYCARDNUMBER = Validator.createEmptyWithRegEx(Message.identityCardNumberValidator,
  /(^$)|(^((\d{15})|(\d{17}([0-9]|X)))$)/);
//TODO 正小数验证器
//固定电话验证器
Validator.TEL_NUMBER = Validator.createWithRegEx(Message.mobileValidator,
  /^(\d{3,4}-?)?\d{7,8}$/);
  //手机号验证器
Validator.MOBILE = Validator.createWithRegEx(Message.mobileValidator,
  /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/);
// 固话和手机
Validator.PHONE_NUMBER = Validator.createWithRegEx(Message.phoneNumberValidator,
  /^(([0-9]{3,4}-?([0-9]{7,8}))|(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8}))$/);
//最大长度字符串
Validator.STRING_MAX_LENGTH = function(max) {
  let errorMessage = Message.stringMaxLengthFormatString.format(max);

  return Validator.create(errorMessage,
    function(text) {
      if (!text) {
        return true;
      }

      if (text.length > max) {
        return false;
      }

      return true;
    }
  );
};
// 非空验证器(null,'','NONE','-1')
Validator.NONEMPTY = Validator.create(Message.nonemptyValidator,
  function(text) {
    return !_.isEmpty(text);
  }
);

export default {
  Validator
};
