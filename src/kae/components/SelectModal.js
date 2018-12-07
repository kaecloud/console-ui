import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Modal, Row, Col, Input, Select} from 'antd';

const Option = Select.Option;

class SelectModal extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setState({
      value: this.props.config.current
    });
  }
  componentWillReceiveProps(nextProps) {
  }

  handleChange(newValue) {
    this.setState({
      value: newValue
    });
  }

  handleSubmit() {
    this.props.config.handler(this.state.value, this.props.config.destroy);
  }

  render() {
    let self = this,
        {current, data} = this.props.config;
    return (
        <Modal
          title={this.props.config.title}
          visible={true}
          onCancel={this.props.config.destroy}
          footer={[
              <Button key="login" type="primary" onClick={self.handleSubmit.bind(self)}>
              确定
            </Button>,
          ]}
        >
      Container: <Select value={current} style={{ width: 100}}
      onChange={self.handleChange.bind(self)}>
        { data.map(name => <Option key={name}>{name}</Option>) }
      </Select>
      </Modal>
    );
  }
};

function showSelectModal(config) {
  let div = document.createElement('div');
  document.body.appendChild(div);

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }
  config.destroy = destroy;
  ReactDOM.render(<SelectModal config={config}/>, div);
}

export default showSelectModal;
