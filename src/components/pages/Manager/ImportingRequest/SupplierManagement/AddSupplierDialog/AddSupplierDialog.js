import React from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './AddSupplierDialog.style.scss';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import * as actions from '../../../../../../redux/actions';
import PageBase from '../../../../../utilities/PageBase/PageBase';
import { API } from '../../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../../constants/cookie-name.constant';
import GooglePlacesAutocomplete from '../../../../../utilities/GooglePlacesAutocomplete/GooglePlacesAutocomplete';

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

class AddSupplierDialog extends PageBase {
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

  onOk() {
    if (this.formRef.current) {
      this.formRef.current.submit();
    }
  }

  async onFinish(values) {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Manager.SupplierManagment.addSupplier,
        {
          method: 'POST',
          body: JSON.stringify(values),
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

    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }

    this.props.addToSuppliersDataSource(res.data.supplier);
    this.setDialogVisible(false);
    message.success(res.messages[0]);
  }

  setAddress(placeInfo) {
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({ address: placeInfo.address });
    }
  }

  render() {
    return (
      <div className="importing-request__container__suppliers__toolbar__add-supplier-dialog">
        <Button
          icon={<PlusOutlined />}
          className="importing-request__container__suppliers__toolbar__add-supplier-dialog__btn-open"
          onClick={() => this.setDialogVisible(true)}
        />

        <Modal
          className="importing-request__container__suppliers__toolbar__add-supplier-dialog__content"
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>Nhà cung cấp mới</span>}
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOk()}
          onCancel={() => this.setDialogVisible(false)}
          okText="Thêm"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >
          <Form
            {...layout}
            ref={current => this.formRef.current = current}
            onFinish={values => this.onFinish(values)}
            onFinishFailed={() => message.error('Chưa đầy đủ thông tin, vui lòng kiểm tra lại')}
          >
            <Form.Item
              name="name"
              label="Thương thiệu"
              rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
            >
              <Input maxLength={50} placeholder="Tối đa 50 kí tự" autoFocus={true} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input maxLength={11} placeholder="Bao gồm 10 hoặc 11 số" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập vào chọn địa chỉ' }]}
            >
              <GooglePlacesAutocomplete
                setAddress={placeInfo => this.setAddress(placeInfo)}
              />
            </Form.Item>

            <Form.Item style={{ display: 'none' }}>
              <Button htmlType="submit" />
            </Form.Item>

          </Form>

        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(AddSupplierDialog));
