import React from 'react';
import './CheckoutPanel.style.scss';
import { Menu, Modal, message } from 'antd';
import {
  QuestionCircleOutlined,
  HistoryOutlined,
  QrcodeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import MoneyCounting from '../MoneyCounting/MoneyCounting';
import TransactionHistory from '../TransactionHistory/TransactionHistory';
import { connect } from 'react-redux';
import { API } from '../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import * as actions from '../../../../redux/actions';
import { withCookies } from 'react-cookie';
import PageBase from '../../../utilities/PageBase/PageBase';

const navbarMenuItems = [
  {
    key: '1',
    title: 'Tính tiền cho khách',
    icon: QrcodeOutlined
  },
  {
    key: '2',
    title: 'Lịch sử yêu cầu nhập hàng',
    icon: QuestionCircleOutlined
  },
  {
    key: '3',
    title: 'Lịch sử giao dịch',
    icon: HistoryOutlined
  }
];

const { confirm } = Modal;

class CheckoutPanel extends PageBase {

  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      selectedMenuItem: { ...navbarMenuItems[0] },
      onWorking: false,
      checkoutSessionID: ''
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  setCheckoutSessionID(id) {
    this.setState({ checkoutSessionID: id });
  }

  handleSelectMenuItem(e) {
    const { key } = e;

    if (key === this.state.selectedMenuItem.key)
      return;

    if (!this.state.onWorking) {
      this.setState({ selectedMenuItem: navbarMenuItems.find(item => item.key === key) });
      return;
    }

    const that = this;
    confirm({
      title: `Đang thao tác, bạn có muốn rời khỏi?`,
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      onOk() {
        that.cancelCheckoutSession(key);
      }
    });
  }

  setOnWorking(onWorking) {
    this.setState({ onWorking });
  }

  async cancelCheckoutSession(key) {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Cashier.Checkout.cancelCheckoutSession.replace('{checkoutSessionID}', this.state.checkoutSessionID),
        {
          method: 'DELETE',
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

    this.setState({
      selectedMenuItem: navbarMenuItems.find(item => item.key === key),
      onWorking: false,
      checkoutSessionID: ''
    });
    message.success(res.messages[0]);
  }

  render() {
    const { selectedMenuItem } = this.state;
    return (
      <div className="checkout-panel">
        <div className="checkout-panel__main-board">
          <div className="checkout-panel__main-board__navbar">
            <Menu
              defaultSelectedKeys={['1']}
              mode="inline"
              theme="dark"
              inlineCollapsed={true}
              onClick={e => this.handleSelectMenuItem(e)}
            >
              {navbarMenuItems.map(item => (
                <Menu.Item key={item.key}
                  className={`checkout-panel__main-board__navbar__item animated bounceIn ${selectedMenuItem.key === item.key ?
                    'checkout-panel__main-board__navbar__item--selected' : ''}`}
                >
                  <item.icon className="checkout-panel__main-board__navbar__item__icon" />
                  <span>{item.title}</span>
                </Menu.Item>
              ))}
            </Menu>
          </div>
          <div className="checkout-panel__main-board__content">
            {selectedMenuItem.key === '1' ? (
              <MoneyCounting
                setCheckoutPanelOnWorking={onWorking => this.setOnWorking(onWorking)}
                setCheckoutPanelCheckoutSessionID={checkoutSessionID => this.setCheckoutSessionID(checkoutSessionID)}
                setMainPanelOnWorking={onWorking => this.setOnWorking(onWorking)}
              />
            ) : <></>}

            {selectedMenuItem.key === '3' ? (
              <TransactionHistory

              />
            ) : <></>}
          </div>
        </div>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(CheckoutPanel));