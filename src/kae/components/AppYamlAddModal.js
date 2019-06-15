import React from 'react';

import {Button, Modal, Row, Form, Input} from 'antd';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/yaml';
import 'brace/theme/xcode';

const { TextArea } = Input;
const FormItem = Form.Item;

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

class AppYamlAddModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      initialRecord: this.props.record,
      yamlValue: this.props.record.specs_text,
      config: this.props.config,
      destroy: this.props.config.destroy
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
    this.setState({yamlValue: newValue});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        let record = values;
        record.specs_text = this.state.yamlValue;

        this.state.config.handler(record);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
        <Modal
          title= {this.state.config.title}
          width={760}
          visible={this.state.visible}
          onCancel={this.state.destroy}
          footer={null}
        >
        <form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="Name"
          >
            {getFieldDecorator('name', {
              initialValue: this.state.initialRecord.name
            })(
                <Input placeholder="App Yaml Name" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Comment"
              >
              {getFieldDecorator('comment', {
                initialValue: this.state.initialRecord.comment,
                rules: [{required: false, message: 'Comment'}]
              })(
                  <TextArea rows={3} />
              )}
          </FormItem>
          <p>Spec: </p>
          <AceEditor
            mode="yaml"
            value={this.state.yamlValue}
            theme="xcode"
            onChange={this.onChange}
            name="yaml"
            fontSize={18}
            width="700px"
            height="600px"
            editorProps={{$blockScrolling: true}}
          />
          <Row>
            <FormItem>
              <Button type="primary" htmlType="submit" >
                Submit
              </Button>
            </FormItem>
          </Row>
      </form>
        </Modal>
    );
  }
}

export default Form.create()(AppYamlAddModal);
