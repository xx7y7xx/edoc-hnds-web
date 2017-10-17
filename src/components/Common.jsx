
import React from 'react';
import {Notification} from 'antd';
import cKit from '../utils/base/coreKit';

/**
 @显示提示信息
 @return {Component} 返回Options组件
 */
export const notice = (description, message, type = 'success') => {
  let args;
  if(cKit.isString(description)){
    args = {
      description,
      message: cKit.isString(message) ? message : '提示'
    };
  } else {
    args = description;
    type = args.type || type
  }
  args.duration = args.hasOwnProperty('duration') ? args.duration : (description.length > 10 ? 10 : 5);
  Notification[type](args);
}

/**
 @显示错误提示信息
 @return {Component} 返回Options组件
 */
export const errorNotice = (description, message) => {
  message = cKit.isString(message) ? message : '错误'
  notice(description, message, 'error');
}
/**
 @显示错误提示信息
 @return {Component} 返回Options组件
 */
export const warnNotice = (description, message) => {
  message = cKit.isString(message) ? message : '错误'
  notice(description, message, 'warn');
}
