import React from 'react';

import {Button, Checkbox, Modal, Select, Form, Input, InputNumber} from 'antd';

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

class DeployModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        visible: true,
        config: this.props.config,
        initialValue: this.props.initialValue
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
    this.setState({value: newValue});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let data = {
          tag: this.state.initialValue.tag,
          cluster: values.cluster_name,
          app_yaml_name: values.app_yaml_name,
          use_newest_config: values.use_newest_config
        };

        if (values.replicas > 0) {
          data.replicas = values.replicas;
        }
        this.state.config.handler(data);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
        <Modal
          title={this.state.config.title}
          visible={this.state.visible}
          onCancel={this.state.config.destroy}
          footer={null}
        >
          <Form style={{marginTop: '20px'}} onSubmit={this.handleSubmit.bind(this)}>
            <FormItem
              {...formItemLayout}
              label="Tag(readOnly)"
            >
              {getFieldDecorator('tag', {
                  initialValue: this.state.initialValue.tag
              })(
                  <Input readOnly={true} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="Cluster"
            >
              {getFieldDecorator('cluster_name', {
                initialValue: this.state.initialValue.currentClusterName
              })(
                <Select>
                  { this.state.initialValue.clusterNameList.map(name => <Option key={name}>{name}</Option>) }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="App Yaml"
            >
              {getFieldDecorator('app_yaml_name', {
                initialValue: "default"
              })(
                  <Select>
                  { this.state.initialValue.yamlNameList.map(name => <Option key={name}>{name}</Option>) }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="容器数量："
            >
              {getFieldDecorator('replicas', {
                  initialValue: this.state.initialValue.replicas
              })(
                  <InputNumber min={0} max={100} />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="使用最新配置"
            >
                {getFieldDecorator('use_newest_config', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(
                    <Checkbox />
                )}
            </FormItem>
            <Button type="primary" htmlType="submit" className="create-job-button">
                Submit
            </Button>
        </Form>
        </Modal>
    );
  }
}

export default Form.create()(DeployModal);
