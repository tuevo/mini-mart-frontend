import React from 'react';
import { PlusOutlined, UserAddOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { Tooltip, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Divider, message } from 'antd';
import './AddStaffDialog.style.scss';
import USER_SEX from '../../../../../constants/user-sex';
import USER_ROLES from '../../../../../constants/user-role.constant';
import moment from 'moment';
import { withCookies } from 'react-cookie';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import { API } from '../../../../../constants/api.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';
import ImageUploader from '../../../../utilities/ImageUploader/ImageUploader';

const { Option } = Select;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class AddStaffDialog extends PageBase {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false
    }

    this.formRef = React.createRef();
  }

  setDialogVisible(isVisible) {
    if (!isVisible) {
      this.formRef.current.resetFields();
    }
    this.setState({ isVisible });
  }

  onOk() {
    document.getElementById('add-staff-dialog-btn-submit').click();
  }

  onCancel() {
    this.setDialogVisible(false);
  }

  onFinish = async (values) => {
    let params = { ...values };
    if (params.password !== params.confirmedPassword) {
      message.error('Nhập lại mật khẩu không chính xác');
      return;
    }

    params.dateOfBirth = moment(params.dateOfBirth).format('DD-MM-YYYY');
    delete params.confirmedPassword;

    const res = await (
      await fetch(
        API.Manager.StaffManagement.addStaff,
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

    if (res.status !== 200) {
      message.error(res.errors[0]);
      return;
    }

    this.props.reloadStaffs(res.data.user);
    this.setDialogVisible(false);
    message.success(res.messages[0]);
  };

  render() {
    return (
      <div className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog">
        <Tooltip placement="bottom" title="Thêm nhân viên">
          <Button
            className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__btn-open"
            shape="circle"
            type="link"
            icon={<PlusOutlined />}
            onClick={() => this.setDialogVisible(true)}
          />
        </Tooltip>

        <Modal
          className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__content"
          title={
            <div>
              <UserAddOutlined style={{ color: '#ff8220', marginRight: 10 }} />
              <span style={{ color: '#ff8220', fontWeight: 'bold' }}>Thêm nhân viên mới</span>
            </div>
          }
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOk()}
          onCancel={() => this.onCancel()}
          okText="Hoàn tất"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >

          <Form
            {...layout}
            ref={current => { this.formRef.current = current; }}
            className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__form"
            onFinish={e => this.onFinish(e)}
            onFinishFailed={() => { message.error('Vui lòng kiểm tra lại thông tin'); }}
          >
            <Form.Item style={{ display: 'none' }}>
              <Button type="primary" htmlType="submit" id="add-staff-dialog-btn-submit" />
            </Form.Item>

            <Row gutter={10}>
              <Col span={10}>
                <h3
                  className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__form__title">
                  <span className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__form__title__icon">
                    <UserOutlined />
                  </span>
                  <span>Thông tin cá nhân</span>
                </h3>

                <div className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__form__img-uploader">
                  <ImageUploader
                    width={100}
                    height={100}
                    isAvatar={true}
                    onFinish={imageUrl => {
                      if (this.formRef.current) {
                        this.formRef.current.setFieldsValue({ avatar: imageUrl });
                      }
                    }}
                    clearImage={!this.state.isVisible}
                  />
                </div>

                <Form.Item
                  label="Họ và tên"
                  name="fullname"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập họ và tên'
                    }
                  ]}
                >
                  <Input placeholder="Tối đa 30 kí tự" autoFocus={true} />
                </Form.Item>

                <Form.Item
                  label="Chức vụ"
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn chức vụ'
                    }
                  ]}
                >
                  <Select
                    placeholder="Chọn chức vụ"
                    allowClear
                  >
                    <Option value={USER_ROLES.CASHIER.type}>{USER_ROLES.CASHIER.name}</Option>
                    <Option value={USER_ROLES.IMPORTER.type}>{USER_ROLES.IMPORTER.name}</Option>
                    <Option value={USER_ROLES.MANAGER.type}>{USER_ROLES.MANAGER.name}</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Giới tính"
                  name="sex"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn giới tính'
                    }
                  ]}
                >
                  <Select
                    placeholder="Chọn giới tính"
                    allowClear
                  >
                    <Option value={USER_SEX.MALE.type}>{USER_SEX.MALE.name}</Option>
                    <Option value={USER_SEX.FEMALE.type}>{USER_SEX.FEMALE.name}</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn ngày sinh'
                    }
                  ]}
                >
                  <DatePicker placeholder="Chọn ngày sinh" format="DD-MM-YYYY" />
                </Form.Item>

                <Form.Item
                  label="E-mail"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập địa chỉ email'
                    },
                    {
                      type: "email",
                      message: 'Địa chỉ email không hợp lệ'
                    }
                  ]}
                >
                  <Input placeholder="abc@gmail.com" />
                </Form.Item>

                <Form.Item
                  label="Điện thoại"
                  name="phone"
                >
                  <Input maxLength={11} placeholder="Gồm 10 hoặc 11 số" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <Input.TextArea placeholder="227 Nguyễn Văn Cừ, Quận 5" />
                </Form.Item>

                <Form.Item
                  label="Ảnh đại diện"
                  name="avatar"
                  style={{ display: 'none' }}
                >
                  <Input placeholder="Dán đường dẫn ảnh vào đây" />
                </Form.Item>
              </Col>
              <Col span={2} style={{ textAlign: 'center' }}><Divider type="vertical" /></Col>
              <Col span={12}>
                <h3
                  className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__form__title">
                  <span className="staff-management__body__staffs__content__list-staffs__header__dialogs__add-staff-dialog__form__title__icon">
                    <KeyOutlined />
                  </span>
                  <span>Tài khoản đăng nhập</span>
                </h3>
                <Form.Item
                  label="Tên tài khoản"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên tài khoản'
                    }
                  ]}
                >
                  <Input placeholder="Tối đa 30 kí tự" />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập mật khẩu'
                    }
                  ]}
                >
                  <Input.Password placeholder="Bao gồm số, kí tự đặc biệt, hoa và thường" />
                </Form.Item>

                <Form.Item
                  label="Nhập lại mật khẩu"
                  name="confirmedPassword"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập lại mật khẩu'
                    }
                  ]}
                >
                  <Input.Password placeholder="Bao gồm số, kí tự đặc biệt, hoa và thường" />
                </Form.Item>

              </Col>
            </Row>
          </Form>

        </Modal>
      </div>
    )
  }
}
export default withCookies(AddStaffDialog);
