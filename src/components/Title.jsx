import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router';
import menuStore from "../stores/menuStore"
/**
 @页标题(此为纯函数式组件)
 @return {Component} 返回Title组件
 */

export const Title = () => {
    const titleStyle = {
        marginBottom: 12
    };

    let createBreadcrumb = function () {
        let breadcrumbs = menuStore.getBreadcrumbs();
        return breadcrumbs.map(function (value, index) {
            if(value.route){
                return (<Breadcrumb.Item key={index}><Link to={value.route}>{value.breadcrumbName}</Link></Breadcrumb.Item>)
            }else {
                return (<Breadcrumb.Item key={index}>{value.breadcrumbName}</Breadcrumb.Item>)
            }
        })
    }
    return (
        <div style={titleStyle}>
            <Breadcrumb separator=">">
                { createBreadcrumb() }
            </Breadcrumb>
        </div>
    )
}
        