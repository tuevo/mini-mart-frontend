import React from 'react';
import { Button, Modal, Tooltip, message, notification } from 'antd';
import { RightOutlined, PrinterOutlined } from '@ant-design/icons';
import './SubmitCheckoutSessionDialog.style.scss';
import PageBase from '../../../../utilities/PageBase/PageBase';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import * as actions from '../../../../../redux/actions';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import moment from 'moment';
import BillToPrint from './BillToPrint/BillToPrint';
import ReactToPrint from 'react-to-print';
import { API } from '../../../../../constants/api.constant';
import * as _ from 'lodash';

class SubmitCheckoutSessionDialog extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      checkoutSession: {}
    }
  }

  openNotification = (message, description, placement) => {
    notification['warning']({
      message,
      description,
      placement,
      duration: null
    });
  };

  setDialogVisible(isVisible) {
    this.setState({ isVisible });
  }

  onOK() {
    document.getElementById('money-counting-submit-checkout-session-dialog-btn-print-bill').click();
  }

  async submitCheckoutSession() {
    const { checkoutSessionID, checkedOutProducts } = this.props;
    const params = { products: checkedOutProducts.map(p => p._id) };
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Cashier.Checkout.submitCheckoutSession.replace('{checkoutSessionID}', checkoutSessionID),
        {
          method: 'PUT',
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
      if (res.status === 404 && res.data) {
        const { notExistedProductIDs } = res.data;
        let notExistedProducts = checkedOutProducts
          .filter(p => _.findIndex(notExistedProductIDs, id => id === p._id) >= 0);
        notExistedProducts = _.uniqBy(notExistedProducts, '_id');
        this.notifyNotExistedProducts(notExistedProducts, res.errors[0]);
        return;
      }

      if (res.status === 400 && res.data) {
        this.props.loadLackingItems(res.data.lackingItems);
        this.props.setLackingItemsDialogVisible(true);
        return;
      }

      message.error(res.errors[0]);
      return;
    }

    const { checkoutSession } = res.data;
    this.setState({ checkoutSession });
    this.props.setCheckoutDoneScreenVisible(true);
    this.props.setMainPanelOnWorking(false);
    this.setDialogVisible(true);
  }

  notifyNotExistedProducts(products, message) {
    this.openNotification(
      message,
      <ul style={{ paddingLeft: 18 }}>
        {products.map(p => (
          <li key={p._id}>{p.name}</li>
        ))}
      </ul>,
      'bottomRight'
    )
  }

  render() {
    const { checkedOutProducts } = this.props;
    const { checkoutSession } = this.state;
    return (
      <div className="money-counting__submit-checkout-session-dialog">
        <Button
          className="money-counting__submit-checkout-session-dialog__btn-open"
          type="primary"
          disabled={checkedOutProducts.length === 0}
          onClick={() => this.submitCheckoutSession()}
        >
          <span style={{ marginRight: 5 }}>Hoàn tất tính tiền</span>
          <RightOutlined />
        </Button>

        <Modal
          className="money-counting__submit-checkout-session-dialog__content"
          title={
            <span style={{ color: '#ff8220', fontWeight: 'bold' }}>
              Hóa đơn bán hàng | Lúc {moment(checkoutSession.submittedAt).format('HH:mm DD-MM-YYYY')}
            </span>
          }
          visible={this.state.isVisible}
          onOk={() => this.onOK()}
          onCancel={() => this.setDialogVisible(false)}
          okText="In hóa đơn"
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          maskClosable={false}
        >
          {Object.keys(checkoutSession).length > 0 ? (
            <div className="money-counting__submit-checkout-session-dialog__content__bill">
              <div className="money-counting__submit-checkout-session-dialog__content__bill__toolbar">
                <Tooltip title="In hóa đơn" placement="left">
                  <Button
                    className="money-counting__submit-checkout-session-dialog__content__bill__toolbar__item"
                    shape="circle"
                    icon={<PrinterOutlined />}
                    onClick={() => this.onOK()}
                  />
                </Tooltip>
              </div>
              <div className="money-counting__submit-checkout-session-dialog__content__bill__wrapper">
                <ReactToPrint
                  trigger={() => (
                    <Button style={{ display: 'none' }} id="money-counting-submit-checkout-session-dialog-btn-print-bill" />
                  )}
                  content={() => this.componentToPrintRef}
                />
                <BillToPrint
                  ref={el => (this.componentToPrintRef = el)}
                  checkoutSession={{ ...checkoutSession }}
                />
              </div>
            </div>
          ) : <></>}
        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(SubmitCheckoutSessionDialog));