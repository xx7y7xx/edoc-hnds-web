/*
 * zhaolongwei 2017-06-26
 * tip:
 */
import React from 'react';
import {Form, Alert} from 'antd';
import cKit from '../../utils/base/coreKit';
import './customForm.less';

export default class CustomForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    let {
      validateErrors,
      originProps,
      children,
    } = this.props;

    console.log(validateErrors)

    let customProps = {

    };
    return (
      <Form className="custom-form">
        {children}
      </Form>
    )
  }
}