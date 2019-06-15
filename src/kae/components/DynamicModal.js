import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Modal} from 'antd';

class DynamicModal extends React.Component {
  handleSubmit() {
    this.props.config.handler(this.props.config.destroy);
  }

  render() {
    let self = this;
    let modalWidth = 520;
    if (this.props.config.width) {
      modalWidth = this.props.config.width;
    }
    return (
        <Modal
          title={this.props.config.title}
          width={modalWidth}
          visible={true}
          onCancel={this.props.config.destroy}
          footer={[
              <Button key="login" type="primary" onClick={self.handleSubmit.bind(self)}>
              确定
            </Button>,
          ]}
       >
        {this.props.children}
      </Modal>
    );
  }
};

export function showDynamicModal(config) {
  let div = document.createElement('div');
  document.body.appendChild(div);

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }
  config.destroy = destroy;
  ReactDOM.render(<DynamicModal config={config}>{config.children}</DynamicModal>, div);
}

export function showInfoModal(config, toHtml=true) {
  let div = document.createElement('div');
  document.body.appendChild(div);

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }
  config.destroy = destroy;
  config.handler = destroy;

  let content = config.text;

  if (toHtml) {
    let text = config.text;
    if (typeof text != 'string') {
      text = JSON.stringify(text, undefined, 2);
    }
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/ /g, '&nbsp;&nbsp;');
    content = (
      <div dangerouslySetInnerHTML={{__html: text}}></div>
    );
  }
  ReactDOM.render(<DynamicModal config={config} toHtml={toHtml}>{content}</DynamicModal>, div);
}
