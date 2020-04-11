import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockFilled } from '@ant-design/icons'
import './ChangePassword.style.scss';
import { API } from '../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import { withCookies } from 'react-cookie';
import * as actions from '../../../../redux/actions';
import { connect } from 'react-redux';
import PageBase from '../../../utilities/PageBase/PageBase';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

class ChangePassword extends PageBase {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  onFinish = async (values) => {
    this.props.setAppLoading(true);
    const params = { ...values };
    const res = await (
      await fetch(
        API.User.changePassword,
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
      message.error(res.errors[0]);
      return;
    }

    this.formRef.current.resetFields();
    message.success(res.messages[0]);
  }

  render() {
    return (
      <div className="change-password">
        <div className="change-password__content animated fadeInRight">
          <div className="change-password__content__div-icon">
            <div className="change-password__content__div-icon__icon-wrapper">
              <LockFilled className="change-password__content__div-icon__icon-wrapper__icon" />
            </div>
          </div>
          <Form
            {...layout}
            ref={this.formRef}
            onFinish={values => this.onFinish(values)}
            onFinishFailed={() => message.error('Vui lòng kiểm tra lại thông tin')}
            className="change-password__content__form"
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu hiện tại',
                },
              ]}
            >
              <Input.Password autoFocus={true} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu mới',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Nhập lại mật khẩu"
              name="confirmedNewPassword"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập lại mật khẩu mới',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button htmlType="submit" className="change-password__content__form__btn-submit">
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(ChangePassword));