import React from 'react';
import ReactDOM from 'react-dom';

import {Icon, Divider, Collapse, Table, Button, Modal, Row, Col, Select, Form, Input, InputNumber, Menu, Dropdown, Checkbox, notification } from 'antd';
import { Link } from 'react-router-dom';
import {
  getDeployment, getAppCanaryInfo, getReleases, appDeploy, appDeployCanary,
  appDeleteCanary, appSetABTestingRules, appGetABTestingRules, appScale, appRollback,
  appRenew, getCluster, appPostConfigMap, appGetConfigMap, appPostSecret, appGetSecret,
  getAppYamlList, deleteAppYaml, createOrUpdateAppYaml, deleteApp} from 'api';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/xcode';

const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 }
  },
  wrapperCol: {
    xs: { span: 30 },
    sm: { span: 18 }
  },
};

class DeleteConfirmModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      buttonDisabled: true,
      expectValue: this.props.expectValue,
      config: this.props.config,
      handler: this.props.config.handler,
      destroy: this.props.config.destroy
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    var newValue = e.target.value;
    if (this.state.expectValue == newValue) {
      this.setState({buttonDisabled: false});
    } else {
      this.setState({buttonDisabled: true});
    }
  }

  render() {
    return (
        <Modal
      title= "Are you absolutely sure?"
      visible={this.state.visible}
      onCancel={this.state.destroy}
      footer={null}
        >
        <p>
        This action <strong>cannot</strong> be undone. This will permanently delete the <strong>{this.state.expectValue}</strong> app
      </p>
        <p>Please type in the name of the app to confirm.</p>

        <Row>
        <Input name="name" onChange={this.onChange} />
        </Row>
        <div style={{height:"10px"}}></div>
        <Row>
        <Button type="danger" style={{width: '100%'}} disabled={this.state.buttonDisabled} onClick={this.state.handler}>
        I understand the consequences, delete this app
      </Button>
        </Row>
        </Modal>
    );
  }
}


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
            width="450px"
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

class AceEditorModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        visible: true,
        value: this.props.config.initialValue,
        config: this.props.config,
        destroy: this.props.destroy
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
      this.setState({value: newValue})
  }

  handleSubmit(event) {
    event.preventDefault();
    this.state.config.handler(this.state.value, this.state.destroy)
  }

  render() {

    return (
        <Modal
            title={this.state.config.title}
            visible={this.state.visible}
            onCancel={this.state.destroy}
            footer={null}
        >
      <form onSubmit={this.handleSubmit}>
            <AceEditor
                mode={this.state.config.mode}
                value={this.state.value}
                theme="xcode"
                onChange={this.onChange}
                name="json"
                fontSize={18}
                width="450px"
                height="600px"
                readOnly={!! this.state.config.readOnly}
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

class ConfigMapModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        visible: true,
        config: this.props.config,
        initialValue: this.props.initialValue,
        handler: this.props.config.handler,
        destroy: this.props.config.destroy
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
      this.setState({value: newValue})
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.form.validateFields((err, values) => {
        if (!err) {
            console.log(values)
            let cm_data = { }
            cm_data[values.key] = values.data
            console.log(values.replace, cm_data)
          this.state.handler(values.cluster_name, values.replace, cm_data)
        }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
        <Modal
            title="创建ConfigMap"
            visible={this.state.visible}
            onCancel={this.state.destroy}
            footer={null}
        >
            <Form style={{marginTop: '20px'}} onSubmit={this.handleSubmit.bind(this)}>
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
                    label="Key"
                >
                    {getFieldDecorator('key', {
                        initialValue: this.state.initialValue.config_name
                    })(
                        <Input placeholder="the key name in configmap data" />
                    )}
                </FormItem>
        <FormItem
      {...formItemLayout}
      label="replace"
        >
        {getFieldDecorator('replace', {
          valuePropName: 'checked',
          initialValue: false,
        })(
            <Checkbox />
        )}
      </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Data"
                >
                    {getFieldDecorator('data', {
                        initialValue: this.state.initialValue.data,
                        rules: [{required: true, message: 'Please input you config content'}]
                    })(
                        <TextArea rows={8} />
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

class SecretFormModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        visible: true,
        value: this.props.initialValue.secretData,
        initialValue: this.props.initialValue,
        handler: this.props.config.handler,
        destroy: this.props.config.destroy
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onAceEditorChange(newValue) {
      this.setState({value: newValue})
  }

  handleSubmit(event) {
    event.preventDefault();

    event.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let secretData = JSON.parse(this.state.value)
        this.state.handler(values.cluster_name, values.replace, secretData)
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
        <Modal
          title="创建Secret"
          visible={this.state.visible}
          onCancel={this.state.destroy}
          footer={null}
        >
          <form onSubmit={this.handleSubmit}>
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
                label="replace"
              >
                {getFieldDecorator('replace', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(
                    <Checkbox />
                )}
              </FormItem>

        <div style={{height: '5px'}}></div>

        <p>Data:</p>
        <AceEditor
          mode="json"
          value={this.state.value}
          theme="xcode"
          onChange={this.onAceEditorChange.bind(this)}
          name="json"
          fontSize={18}
          width="450px"
          height="600px"
          editorProps={{$blockScrolling: true}}
        />
        <Row>
          <FormItem>
            <Button type="primary" htmlType="submit" > Submit </Button>
          </FormItem>
        </Row>
      </form>
        </Modal>
    );
  }
}

class DeployModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        visible: true,
        config: this.props.config,
        initialValue: this.props.initialValue,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
      this.setState({value: newValue})
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.form.validateFields((err, values) => {
        if (!err) {
            let data = {
              tag: this.state.initialValue.tag,
              cluster: values.cluster_name,
              app_yaml_name: values.app_yaml_name
            }

            if (values.replicas > 0) {
                data.replicas = values.replicas
            }
            console.log(values, data)
            this.state.config.handler(data)
        }
    })
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
            <Button type="primary" htmlType="submit" className="create-job-button">
                Submit
            </Button>
        </Form>
        </Modal>
    );
  }
}

// export Form.create()(DeleteConfirmModal)
export {
  DeleteConfirmModal, AppYamlAddModal, AceEditorModal,
  ConfigMapModal, SecretFormModal, DeployModal
}
