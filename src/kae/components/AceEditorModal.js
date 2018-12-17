import React from 'react';

import {Button, Modal, Row} from 'antd';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/xcode';

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
    this.setState({value: newValue});
  }

  handleSubmit() {
    this.state.config.handler(this.state.value, this.state.destroy);
  }

  render() {

    return (
      <Modal
          title={this.state.config.title}
          visible={this.state.visible}
          onCancel={this.state.destroy}
          footer={null}
      >
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
                <Button type="primary" onClick={this.handleSubmit} >
                  Submit
                </Button>
            </Row>
      </Modal>
    );
  }
}

export default AceEditorModal;
