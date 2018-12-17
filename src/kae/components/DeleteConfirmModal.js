import React from 'react';
import {Alert, Button, Modal, Row, Input} from 'antd';

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
    if (this.state.expectValue === newValue) {
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

        <Alert
      message="Unexpected bad things will happen if you don't read this! "
      type="warning"
        />
        <div style={{marginTop: "15px"}}>
        <p>
        This action <strong>cannot</strong> be undone. This will permanently delete the <strong>{this.state.expectValue}</strong> app
      </p>
        <p>Please type in the name of the app to confirm.</p>
        </div>
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

export default DeleteConfirmModal;
