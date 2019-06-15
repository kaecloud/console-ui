import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button, Modal, Form, Select, Input
} from 'antd';

import {Provider, connect} from 'react-redux';
import store from '../models/Store';
import * as AppApi from '../models/apis/Apps';
import {processApiResult} from '../Utils';
import * as AppActions from '../models/actions/Apps';

const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 30 },
    sm: { span: 18 }
  }
};

class RegisterAppModal extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        processApiResult(AppApi.create(values.appname, values.git, values.type), 'CreateApp')
          .then(data => {
            this.props.config.destroy();
            const {dispatch} = this.props;
            dispatch(AppActions.list());
          }).catch(v => {});
      }
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
        <Modal
          title="Create APP"
          visible={true}
          onCancel={this.props.config.destroy}
          footer={null}
       >
          <Form style={{marginTop: '20px'}} onSubmit={this.handleSubmit}>
              <FormItem
                  {...formItemLayout}
                  label="Appname"
              >
                  {getFieldDecorator('appname', {
                      rules: [{ required: true, message: 'Please input your appname!' }],
                  })(
                      <Input placeholder="Appname"/>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Git"
              >
                  {getFieldDecorator('git', {
                    rules: [{required: true, message: 'Please input your git!' }],
                  })(
                      <Input placeholder="Git"/>
                  )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="Type"
                >
                {getFieldDecorator('type', {
                  initialValue: "web",
                  rules: [{ message: 'Please select App type!' }],
                })(
                  <Select style={{ width: 100}}>
                    <Option value="web">web</Option>
                    <Option value="worker">worker</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Comments"
              >
                  {getFieldDecorator('comments')(
                      <TextArea rows={4} />
                  )}
              </FormItem>
              <Button type="primary" htmlType="submit" className="create-job-button">
                  Create App
              </Button>
          </Form>
      </Modal>
    );
  }
};

export function showRegisterAppModal(config) {
  let div = document.createElement('div');
  document.body.appendChild(div);

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }
  config.destroy = destroy;
  let WrapperModal = Form.create()(RegisterAppModal);
  let MyModal = connect((state) => state.apiCalls)(WrapperModal);
  ReactDOM.render(<Provider store={store}><MyModal config={config}>{config.children}</MyModal></Provider>, div);
}
