import React from 'react';
import { withCookies } from 'react-cookie';
import { EditOutlined } from '@ant-design/icons';
import { Row, Col, Select, Form, Modal, Input, message, DatePicker, Button } from 'antd';
import './UpdateStaffDialog.style.scss';
import USER_ROLES from '../../../../../constants/user-role.constant';
import USER_SEX from '../../../../../constants/user-sex';
import moment from 'moment';
import * as _ from 'lodash';
import { API } from '../../../../../constants/api.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import ImageUploader from '../../../../utilities/ImageUploader/ImageUploader';

const { Option } = Select;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class UpdateStaffDialog extends PageBase {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false
    }

    this.formRef = React.createRef();
  }

  setDialogVisible(isVisible) {
    this.setState({ isVisible });
  }

  loadSelectedStaffProfile() {
    const { selectedStaff } = this.props;
    let formInitialValues = {};
    if (selectedStaff) {
      const keys = Object.keys(selectedStaff)
        .filter(k => ['fullname', 'role', 'sex', 'dateOfBirth', 'username', 'email', 'phone', 'address', 'avatar'].includes(k));

      for (const k of keys) {
        let value = selectedStaff[k];

        if (k === 'dateOfBirth') {
          value = value.split('-');
          const date = new Date(Number(value[2]), Number(value[1]) - 1, Number(value[0]));
          value = moment(date);
        }

        formInitialValues[k] = value;
      }
    }

    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({ ...formInitialValues });
    }
  }

  onOk() {
    document.getElementById('update-staff-dialog-btn-submit').click();
  }

  onCancel() {
    this.setDialogVisible(false);
  }

  onFinish = async (values) => {
    let params = { ...values };
    params.dateOfBirth = moment(params.dateOfBirth).format('DD-MM-YYYY');
    params.sex = _.find(USER_SEX, s => s.name === params.sex).type;

    const res = await (
      await fetch(
        API.Manager.StaffManagement.updateStaffProfile.replace('{updatedUserID}', this.props.selectedStaff._id),
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

    if (res.status !== 200) {
      message.error(res.errors[0]);
      return;
    }

    this.props.reloadStaffs(res.data.user);
    this.setDialogVisible(false);
    message.success(res.messages[0]);
  }

  render() {
    const { selectedStaff } = this.props;
    return (
      <div>
        <div>
          <Row align="middle">
            <Col span={2}>
              <EditOutlined className="staff-management__body__staffs__sidebar__staff-features__feature__icon" />
            </Col>
            <Col
              span={22}
              className="staff-management__body__staffs__sidebar__staff-features__feature__info"
              onClick={() => this.setDialogVisible(true)}
            >
              <span className="staff-management__body__staffs__sidebar__staff-features__feature__info__name">
                Chỉnh sửa thông tin</span>
            </Col>
          </Row>

          <Modal
            className="staff-management__body__staffs__content__list-staffs__header__dialogs__update-staff-dialog__content"
            title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{selectedStaff.fullname} | Thông tin cá nhân</span>}
            centered
            visible={this.state.isVisible}
            onOk={() => this.onOk()}
            onCancel={() => this.onCancel()}
            okText="Lưu thay đổi"
            cancelText="Hủy bỏ"
            okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
          >

            <Form
              {...layout}
              ref={ref => {
                this.formRef.current = ref;
                this.loadSelectedStaffProfile();
              }}
              className="staff-management__body__staffs__content__list-staffs__header__dialogs__update-staff-dialog__form"
              onFinish={e => this.onFinish(e)}
              onFinishFailed={() => { message.error('Vui lòng kiểm tra lại thông tin'); }}
            >
              <Form.Item style={{ display: 'none' }}>
                <Button type="primary" htmlType="submit" id="update-staff-dialog-btn-submit" />
              </Form.Item>

              <div className="staff-management__body__staffs__content__list-staffs__header__dialogs__update-staff-dialog__form__img-uploader">
                <ImageUploader
                  width={100}
                  height={100}
                  isAvatar={true}
                  onFinish={imageUrl => {
                    if (this.formRef.current) {
                      this.formRef.current.setFieldsValue({ avatar: imageUrl });
                    }
                  }}
                  defaultImageUrl={selectedStaff.avatar}
                  tooltipTitle="Nhấp để tải ảnh lên"
                  tooltipPlacement="bottom"
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
                <Input placeholder="Tối đa 30 kí tự" />
              </Form.Item>

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
                  <Option value={USER_SEX.MALE.name}>{USER_SEX.MALE.name}</Option>
                  <Option value={USER_SEX.FEMALE.name}>{USER_SEX.FEMALE.name}</Option>
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

            </Form>

          </Modal>

        </div>
      </div>
    )
  }
}
export default withCookies(UpdateStaffDialog);