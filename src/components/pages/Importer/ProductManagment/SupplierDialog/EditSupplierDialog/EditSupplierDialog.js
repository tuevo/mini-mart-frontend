import React from 'react';
import { withCookies } from 'react-cookie';
import './EditSupplierDialog.style.scss';
import { Modal, Button, Form, Input, message } from 'antd';
import PageBase from '../../../../../utilities/PageBase/PageBase';
import { API } from '../../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../../constants/cookie-name.constant';
import { connect } from 'react-redux';
import * as actions from '../../../../../../redux/actions';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 24 },
};

class EditSupplierDialog extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false
    }
    this.formRef = React.createRef();
  }

  setVisible(isVisible) {
    this.setState({ isVisible });
  }

  onOk() {
    this.formRef.current.submit();
  }

  async submitForm(values) { 
    this.props.setAppLoading(false);
    const res = await (
      await fetch(
        API.Importer.ProductManagement.updateSupplier.replace('{supplierID}', this.props.supplier._id),
        {
          method: 'PUT',
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

    this.props.updateSupplierInList({ ...res.data.supplier });
    this.setVisible(false);
    message.success(res.messages[0]);
  }

  render() {
    const { supplier } = this.props;
    return (
      <div className="product-management__supplier-dialog__editing-dialog">
        <Button
          type="link"
          className="product-management__supplier-dialog__editing-dialog__btn-open"
          onClick={() => this.setVisible(true)}
        >Chỉnh sửa</Button>
        <Modal
          className="product-management__supplier-dialog__editing-dialog__content"
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{`Nhà cung cấp: ${supplier.name} | Sửa thông tin`}</span>}
          visible={this.state.isVisible}
          centered
          onOk={() => this.onOk()}
          onCancel={() => this.setVisible(false)}
          okText="Lưu thay đổi"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >
          <Form
            {...layout}
            ref={current => {
              if (!this.formRef.current) {
                this.formRef.current = current;
                this.formRef.current.setFieldsValue({ ...supplier });
              }
            }}
            onFinish={values => this.submitForm(values)}
            onFinishFailed={() => message.error('Chưa đầy đủ thông tin, vui lòng kiểm tra lại.')}
          >
            <Form.Item
              name="name"
              label="Tên thương hiệu"
              rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
            >
              <Input placeholder="Tối đa 50 kí tự" autoFocus={true} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Gồm 10 hoặc 11 số" maxLength={11} />
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ liên hệ"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input.TextArea placeholder="Tối đa 200 kí tự" />
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
              <Button htmlType="submit" id="product-management-supplier-dialog-editing-dialog-btn-submit" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(EditSupplierDialog));