import React, { Component } from 'react';
import { Layout, Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import './Sidebar.style.scss';
import UserInfo from './UserInfo/UserInfo';
import { connect } from 'react-redux';
import * as actions from '../../../redux/actions';
import links from '../../../constants/sidebar.constant';
import USER_ROLE from '../../../constants/user-role.constant';

const { Sider } = Layout;

class Sidebar extends Component {
  pageIndex;

  componentWillMount() {
    const { pagesByUserRole } = this.props;
    const href = window.location.href.split('?')[0];
    const position = href.split('/');
    const currentPath = position[position.length - 1];

    pagesByUserRole.forEach((page, index) => {
      if (page.path === `/${currentPath}`) {
        this.pageIndex = index;
        const currentPage = pagesByUserRole[this.pageIndex];
        this.props.setSidebarSelectedIndex(this.pageIndex);
        this.props.setCurrentPageTitle(currentPage.title, currentPage.icon);
      }
    });

    if (!this.pageIndex) {
      this.pageIndex = 0;
      const { title, icon, path } = pagesByUserRole[this.pageIndex];
      this.props.setSidebarSelectedIndex(this.pageIndex);
      this.props.setCurrentPageTitle(title, icon);
      this.props.history.push(path);
    }
  }

  isCommonPage(path) {
    const page = links.find(link => link.role === USER_ROLE.USER.type).pages.find(page => page.path === path);
    if (page)
      return true;
    return false;
  }

  render() {
    const { user, pagesByUserRole } = this.props;
    const { sidebarSelectedIndex } = this.props.app;

    return (
      <Sider className="sidebar">
        <div className="sidebar__header">
          <img className="sidebar__header__company-logo" src={require('../../../assets/images/app-logo.png')} alt="logo" />
          <div className="sidebar__header__company-brand">
            <div className="sidebar__header__company-brand__name"><span>Mini Mart</span></div>
            <div className="sidebar__header__company-brand__slogan"><span>Tiện Lợi mà Chất Lượng</span></div>
          </div>
        </div>
        <UserInfo user={user} />
        <Menu
          theme='light'
          mode='inline'
          selectedKeys={[sidebarSelectedIndex ? sidebarSelectedIndex.toString() : '0']}>
          {pagesByUserRole.map((page, pageIndex) => {
            const Page = { Icon: page.icon };
            return (
              <Menu.Item key={pageIndex} className="animated slideInLeft"
                onClick={() => {
                  this.props.setCurrentPageTitle(page.title, page.icon);
                  this.props.setSidebarSelectedIndex(pageIndex);
                }}>
                <Page.Icon style={{ color: '#ff8220' }} />
                <span className="sidebar__nav-title">{page.title}</span>
                <Link to={page.path} />
              </Menu.Item>
            )
          })}
        </Menu>
      </Sider>
    )
  }
}

const mapStateToProps = state => ({
  app: state.app
});

export default connect(mapStateToProps, actions)(withRouter(Sidebar));