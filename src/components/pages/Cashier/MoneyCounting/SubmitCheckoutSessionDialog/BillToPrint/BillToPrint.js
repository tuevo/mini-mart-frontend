import React, { Component } from 'react';
import { Row, Col, Divider } from 'antd';
import NumberFormat from 'react-number-format';
import './BillToPrint.style.scss';
import moment from 'moment';
import QRCode from 'qrcode.react';
import { COOKIE_NAMES } from '../../../../../../constants/cookie-name.constant';
import { withCookies } from 'react-cookie';

class BillToPrint extends Component {
  render() {
    const { checkoutSession } = this.props;
    return (
      <div className="money-counting__submit-checkout-session-dialog__bill">
        <div className="money-counting__submit-checkout-session-dialog__bill__header">
          <div className="money-counting__submit-checkout-session-dialog__bill__header__company">
            <img className="money-counting__submit-checkout-session-dialog__bill__header__company__logo" src={require('../../../../../../assets/images/app-logo.png')} alt="logo" />
            <div className="money-counting__submit-checkout-session-dialog__bill__header__company__brand">
              <div className="money-counting__submit-checkout-session-dialog__bill__header__company__brand__name"><span>Mini Mart</span></div>
              <div className="money-counting__submit-checkout-session-dialog__bill__header__company__brand__slogan"><span>Tiện Lợi mà Chất Lượng</span></div>
            </div>
          </div>
        </div>
        <div className="money-counting__submit-checkout-session-dialog__bill__title">
          <span>HÓA ĐƠN THANH TOÁN</span>
        </div>
        <div className="money-counting__submit-checkout-session-dialog__bill__details">
          <Row>
            <Col span={8}>Địa chỉ:</Col>
            <Col span={16}>227 Nguyễn Văn Cừ, Quận 5</Col>
          </Row>
          <Row>
            <Col span={8}>Vào lúc:</Col>
            <Col span={16}>{moment(checkoutSession.submittedAt).format('HH:mm DD-MM-YYYY')}</Col>
          </Row>
          <Row>
            <Col span={8}>Thu ngân:</Col>
            <Col span={16}>{this.props.cookies.get(COOKIE_NAMES.user)._id}</Col>
          </Row>
        </div>
        <Divider />
        <ul className="money-counting__submit-checkout-session-dialog__bill__list-items">
          <li style={{ fontWeight: 'bold', paddingBottom: 10 }}>
            <Row>
              <Col span={10}>Sản phẩm</Col>
              <Col span={7}><center>SL</center></Col>
              <Col span={7}>Thành tiền</Col>
            </Row>
          </li>
          {checkoutSession.soldItems.map(item => (
            <li key={item._id}>
              <Row>
                <Col span={10}>{item.product.name}</Col>
                <Col span={7}><center>{item.quantity}</center></Col>
                <Col span={7}>
                  <NumberFormat
                    value={Number(item.product.price * item.quantity)}
                    displayType="text"
                    thousandSeparator={true}
                  />
                </Col>
              </Row>
            </li>
          ))}
        </ul>
        <Divider />
        <div className="money-counting__submit-checkout-session-dialog__bill__price-total">
          <Row>
            <Col span={10}>Tổng tiền</Col>
            <Col span={7}></Col>
            <Col span={7}>
              <NumberFormat
                value={Number(checkoutSession.priceTotal)}
                displayType="text"
                thousandSeparator={true}
                suffix={' VNĐ'}
              />
            </Col>
          </Row>
        </div>
        <div className="money-counting__submit-checkout-session-dialog__bill__qrcode">
          <QRCode
            value={checkoutSession._id}
            fgColor={'gray'}
          />
        </div>
      </div>
    )
  }
}
export default withCookies(BillToPrint);