import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Modal, Row, Col, Input} from 'antd';

class InfoModal extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    let content = this.props.config.text;
    if (this.props.toHtml) {
      content = (
          <div dangerouslySetInnerHTML={{__html: this.props.config.text}}></div>
      );
    }
    return (
        <Modal
          title={this.props.config.title}
          visible={true}
          onCancel={this.props.config.destroy}
          footer={[
              <Button key="login" type="primary" onClick={this.props.config.destroy}>
              确定
            </Button>,
          ]}
        >
        {content}
      </Modal>
    );
  }
};

function showInfoModal(config, toHtml=true) {
  let div = document.createElement('div');
  document.body.appendChild(div);

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }
  config.destroy = destroy;

  if (toHtml) {
    let text = config.text;
    if (typeof text != 'string') {
      text = JSON.stringify(text, undefined, 2);
    }
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/ /g, '&nbsp;&nbsp;');
    config.text = text;
  }
  ReactDOM.render(<InfoModal config={config} toHtml={toHtml}/>, div);
}

export default showInfoModal;
