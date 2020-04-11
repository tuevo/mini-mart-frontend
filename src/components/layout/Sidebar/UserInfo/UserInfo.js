import React, { Component } from 'react';
import { Avatar } from 'antd';
import './UserInfo.style.scss';
import USER_ROLE from '../../../../constants/user-role.constant';

export default class UserInfo extends Component {

  render() {
    const user = this.props.user;
    const userRoleName = USER_ROLE[user.role].name;
    let userRoleStyle;
    switch (user.role) {
      case USER_ROLE.CASHIER.type: userRoleStyle = '__wallpaper__role--cashier'; break;
      case USER_ROLE.IMPORTER.type: userRoleStyle = '__wallpaper__role--importer'; break;
      case USER_ROLE.MANAGER.type: userRoleStyle = '__wallpaper__role--manager'; break;
      default: break;
    }

    return (
      <div className="user-info animated fadeIn">
        <div className="__wallpaper" style={{backgroundImage: `url(${user.avatar})`}}>
          <div className="__wallpaper__dark-bg"></div>
          <div className={`__wallpaper__role ${userRoleStyle} animated fadeInRight`}>
            <span>{userRoleName}</span>
          </div>
          <div className="__wallpaper__info">
            <div className="__wallpaper__info__fullname"><span>{user.fullname || ''}</span></div>
            <span className="__wallpaper__info__email">{user.email || ''}</span>
          </div>
        </div>
        <div className="__avatar">
          <Avatar size={58} src={user.avatar} className="__avatar__image" />
        </div>
      </div>
    )
  }
}
