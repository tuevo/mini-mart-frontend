import React, { Component } from 'react';
import { Avatar, Row, Col } from 'antd';
import './RequestDetails.style.scss';
import IMPORTING_REQUEST_CONSTANT from '../../../../../constants/importing-request.constant';
import moment from 'moment';

export default class RequestDetails extends Component {
  render() {
    const { details } = this.props;
    return (
      <div className="importing-request__container__block__body__request-details">
        <div
          className="importing-request__container__block__body__request-details__btn-open animated fadeIn"
        >
          {details.status === IMPORTING_REQUEST_CONSTANT.STATUS.PENDING.type ? (
            <Row gutter={10} style={{ width: '100%', height: '100%' }}>
              <Col span={4}>
                <Avatar
                  className="importing-request__container__block__body__request-details__btn-open__avatar"
                  src={details.sender.avatar} size={24} />
              </Col>
              <Col span={20}>
                <div className="importing-request__container__block__body__request-details__btn-open__details">
                  <span className="importing-request__container__block__body__request-details__btn-open__details__title">
                    {details.sender.fullname}
                  </span>
                  <span className="importing-request__container__block__body__request-details__btn-open__details__time">
                    Vào lúc {moment(details.createdAt).format('HH:mm DD-MM-YYYY')}
                  </span>
                  <p className="importing-request__container__block__body__request-details__btn-open__details__products">
                    {details.requiredProducts.map(rp => rp.product.name).join(', ')}.
                  </p>
                </div>
              </Col>
            </Row>
          ) : <></>}
        </div>
      </div>
    )
  }
}
