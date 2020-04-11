import React from 'react';
import { Modal, Table, Button, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import './ImportingRequestDialog.style.scss';
import { connect } from 'react-redux';
import * as actions from '../../../../../redux/actions';
import { withCookies } from 'react-cookie';
import { API } from '../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';

class ImportingRequestDialog extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false
    }
  }

  componentWillReceiveProps(props) {
    const { isVisible } = props;
    this.setDialogVisible(isVisible);
  }

  setDialogVisible(isVisible) {
    this.setState({ isVisible });
  }

  async sendImportingRequest() {
    const params = {
      products: this.props.lackingItems.map(item => item.product._id)
    }

    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Cashier.Checkout.createImportingRequest,
        {
          method: 'POST',
          body: JSON.stringify(params),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'token': this.props.cookies.get(COOKIE_NAMES.token)
          },
          signal: this.abortController.signal
        }
      )
    ).json();

    this.props.setAppLoading(false);
    if (res.status !== 200) {
      message.error(res.errors[0]);
      return;
    }

    message.success(res.messages[0]);
    this.setDialogVisible(false);
    this.props.setLackingItemsDialogVisible(false);
  }

  render() {
    let { lackingItems } = this.props;
    lackingItems = lackingItems.map(item => ({ ...item, key: item.product._id }));
    const columns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'productName',
        key: 'productName',
        render: (value, record) => (
          <div>
            <img src={record.product.image} alt="" />
            <span>{record.product.name}</span>
          </div>
        )
      },
      {
        title: <center>SL yêu cầu</center>,
        dataIndex: 'requiredQuantity',
        key: 'requiredQuantity',
        width: 100,
        render: value => <center>{value}</center>
      },
      {
        title: <center>SL hiện có</center>,
        dataIndex: 'availableQuantity',
        key: 'availableQuantity',
        width: 100,
        render: value => <center>{value}</center>
      },
    ];

    return (
      <div className="importing-request-dialog">
        <Modal
          className="importing-request-dialog__content"
          title={
            <div className="importing-request-dialog__content__title">
              <ExclamationCircleFilled className="importing-request-dialog__content__title__icon" />
              <span className="importing-request-dialog__content__title__text">Sản phẩm không đủ</span>
            </div>
          }
          visible={this.state.isVisible}
          footer={null}
          onCancel={() => {
            this.setDialogVisible(false);
            this.props.setLackingItemsDialogVisible(false);
          }}
          maskClosable={false}
        >
          <Table
            dataSource={lackingItems}
            columns={columns}
            pagination={false}
            scroll={{ y: 300 }}
          />
          <div className="importing-request-dialog__content__btn-send-request">
            <Button
              className="importing-request-dialog__content__btn-send-request__btn"
              type="primary"
              shape="round"
              onClick={() => this.sendImportingRequest()}
            >
              Gửi yêu cầu nhập hàng
            </Button>
          </div>
        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(ImportingRequestDialog));