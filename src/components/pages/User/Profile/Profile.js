import React, { Component } from 'react';
import { Avatar, Row, Col } from 'antd';
import { withCookies } from 'react-cookie';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import USER_ROLES from '../../../../constants/user-role.constant';
import './Profile.style.scss';
import * as moment from 'moment';

class Profile extends Component {
  render() {
    const user = this.props.cookies.get(COOKIE_NAMES.user);
    const userFields = Object.keys(user)
      .filter(k => !['fullname', 'avatar', 'role', 'updatedAt', '__v'].includes(k))
      .map(k => {
        switch (k) {
          case '_id': return { index: 0, name: 'ID', value: user[k] };
          case 'dateOfBirth': return { index: 1, name: 'Ngày sinh', value: user[k] };
          case 'sex': return { index: 2, name: 'Giới tính', value: user[k] };
          case 'email': return { index: 3, name: 'Email', value: user[k] };
          case 'phone': return { index: 4, name: 'Số điện thoại', value: user[k] };
          case 'address': return { index: 5, name: 'Địa chỉ', value: user[k] };
          case 'salaryRate': return { index: 6, name: 'Hệ số lương', value: user[k] };
          case 'createdAt': return { index: 7, name: 'Ngày tham gia', value: moment(user[k]).format('DD-MM-YYYY') };
          default: return {};
        }
      })
      .sort((a, b) => a.index - b.index);

    return (
      <div className="profile">
        <div className="profile__main animated fadeInUp">
          <div className="profile__main__header">
            <Avatar
              className="profile__main__header__user-avatar"
              size={65}
              src={user.avatar} />
            <div className="profile__main__header__user-info">
              <div className="profile__main__header__user-info__name"><span>{user.fullname}</span></div>
              <div className="profile__main__header__user-info__role"><span>{USER_ROLES[user.role].name}</span></div>
            </div>
          </div>
          <Row className="profile__main__body">
            <Col span={8}>
              <ul className="profile__main__body__list-user-fields">
                {userFields.map((field, index) => (
                  <li key={index}>{field.name}</li>
                ))}
              </ul>
            </Col>
            <Col span={16}>
              <ul className="profile__main__body__list-user-values">
                {userFields.map((field, index) => (
                  <li key={index} className={`${field.name === 'ID' ? '--highline' : ''}`}>{field.value}</li>
                ))}
              </ul>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default withCookies(Profile);
