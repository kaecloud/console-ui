import React from 'react';
import ReactDOM from 'react-dom';

import {
  Button, Modal, Row, Form, Select, Input, InputNumber,
  Checkbox
} from 'antd';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/xcode';

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


class CreateJobModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      yamlValue: '',
      isForm: this.props.config.isForm,
      value: this.props.config.initialValue,
      config: this.props.config
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onAceEditorChange(newValue) {
    this.setState({
      yamlValue: newValue
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const {isForm} = this.state;

    this.props.form.validateFields((err, values) => {
      if (!err) {
        let job;
        if(isForm) {
          if(values.gpus === 0) {
            job = {
              jobname: values.jobname,
              git: values.git,
              commit: values.commitId,
              autoRestart: values.autoRestart,
              image: values.image,
              command: values.command,
              shell: values.shell
            };
          }else {
            job = {
              jobname: values.jobname,
              git: values.git,
              commit: values.commitId,
              autoRestart: values.autoRestart,
              image: values.image,
              command: values.command,
              shell: values.shell
            };
          }
        } else {
          job = {
            specs_text: this.state.yamlValue
          };
        }
        this.props.config.hander(job);
      }
    });
  }

  changeFormType(newValue) {
    if(newValue === 'form') {
      this.setState({
        isForm: true
      });
    }else {
      this.setState({
        isForm: false
      });
    }
  }

  render() {
    const {isForm} = this.state;
    const {getFieldDecorator} = this.props.form;
    let formSelectVal = isForm? "form": "yaml";

      const modalContent = isForm ? (
          <Form style={{marginTop: '20px'}} onSubmit={this.handleSubmit.bind(this)}>
              <FormItem
                  {...formItemLayout}
                  label="Jobname"
              >
                  {getFieldDecorator('jobname', {
                      rules: [{ required: true, message: 'Please input your jobname!' }],
                  })(
                      <Input placeholder="Jobname"/>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Git"
              >
                  {getFieldDecorator('git', {
                      rules: [{ message: 'Please input your git!' }],
                  })(
                      <Input placeholder="Git"/>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="GPUs"
              >
                  {getFieldDecorator('gpus', {
                      initialValue: 0,
                  })(
                      <InputNumber min={0} max={10} />
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="autoRestart"
              >
                  {getFieldDecorator('autoRestart', {
                      valuePropName: 'checked',
                      initialValue: false,
                  })(
                      <Checkbox></Checkbox>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="shell"
              >
                  {getFieldDecorator('shell', {
                      valuePropName: 'checked',
                      initialValue: false,
                  })(
                      <Checkbox></Checkbox>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Command"
              >
                  {getFieldDecorator('command', {
                      rules: [{ required: true, message: 'Please input your command!' }],
                  })(
                      <TextArea rows={4} />
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Image"
              >
                  {getFieldDecorator('image', {
                      rules: [{ required: true, message: 'Please input your image!' }],
                  })(
                      <Input/>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Commit id"
              >
                  {getFieldDecorator('commitId')(
                      <Input/>
                  )}
              </FormItem>
              <FormItem
                  {...formItemLayout}
                  label="Branch"
              >
                  {getFieldDecorator('branch')(
                      <Input/>
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
                  Create Job
              </Button>
          </Form>
      ) : (
          <div>
              <AceEditor
                  mode="yaml"
                  theme="xcode"
                  onChange={this.onAceEditorChange.bind(this)}
                  name="yaml"
                  fontSize={18}
                  width="450px"
                  height="600px"
                  editorProps={{$blockScrolling: true}}
              />
              <Button type="primary" className="create-job-button" onClick={this.handleSubmit.bind(this)}>
                  Create Job
              </Button>
          </div>
      )
    return (
      <Modal
        title="Create Job"
        visible={this.state.visible}
        onCancel={this.props.config.destroy}
        footer={null}
      >
        <span>选择创建方式：</span>
        <Select defaultValue={formSelectVal} style={{ width: 80 }} onChange={this.changeFormType.bind(this)}>
          <Option value="form">Form</Option>
          <Option value="yaml">yaml</Option>
        </Select>
        {modalContent}
      </Modal>
    );
  }
}

export default Form.create()(CreateJobModal);
