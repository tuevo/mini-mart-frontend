import React from 'react';
import './TransactionHistory.style.scss';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import * as actions from '../../../../redux/actions';
import { HistoryOutlined } from '@ant-design/icons';
import { Timeline, Empty, message } from 'antd';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import { API } from '../../../../constants/api.constant';
import PageBase from '../../../utilities/PageBase/PageBase';

class TransactionHistory extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      checkoutSessions: []
    }
  }

  componentDidMount() {
    this.loadCheckoutSessions();
  }

  async loadCheckoutSessions() {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Cashier.Checkout.getCheckoutSessions,
        {
          method: 'GET',
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

    this.setState({ checkoutSessions: res.data.checkoutSessions });
  }

  render() {
    const { checkoutSessions } = this.state;
    return (
      <div className="transaction-history animated fadeIn">
        <div className="transaction-history__header">
          <div className="transaction-history__header__title">
            <HistoryOutlined className="transaction-history__header__title__icon" />
            <span className="transaction-history__header__title__text">Lịch sử giao dịch</span>
          </div>
        </div>
        <div className="transaction-history__content animated slideInUp">
          <div className="transaction-history__content__timeline">
            {checkoutSessions.length === 0 ? (
              <div className="transaction-history__content__timeline__empty">
                <Empty description="Chưa có ghi nhận nào" />
              </div>
            ) : (
                <Timeline mode="left">
                  {checkoutSessions.map(cs => {
                    return cs.soldItems.length > 0 ? (
                      <Timeline.Item
                        key={cs._id}
                        label={cs.submittedAt ? moment(cs.submittedAt).format('DD-MM-YYYY HH:mm') : moment().format('DD-MM-YYYY HH:mm')}
                        color="#ff8220">
                        <div className="transaction-history__content__timeline__item animated fadeInRight">
                          <p className="transaction-history__content__timeline__item__list-products">
                            {cs.soldItems.map((item, index) => {
                              return index < cs.soldItems.length - 1 ? (
                                <span>{`${item.product.name} x${item.quantity}, `}</span>
                              ) : (
                                  <span>{`${item.product.name} x${item.quantity}.`}</span>
                                )
                            })}
                          </p>
                          <div className="transaction-history__content__timeline__item__price-total">
                            <span className="transaction-history__content__timeline__item__price-total__label">
                              Tổng tiền:
                            </span>
                            <NumberFormat
                              className="transaction-history__content__timeline__item__price-total__number"
                              value={Number(cs.priceTotal)}
                              displayType="text"
                              thousandSeparator={true}
                              suffix=" VNĐ"
                              style={{ fontWeight: 'bold' }}
                            />
                          </div>
                        </div>
                      </Timeline.Item>
                    ) : <></>
                  })}
                </Timeline>
              )}
          </div>
        </div>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(TransactionHistory));