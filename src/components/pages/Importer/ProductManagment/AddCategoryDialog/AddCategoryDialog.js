import React from 'react';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import * as actions from '../../../../../redux/actions';
import './AddCategoryDialog.style.scss';
import { Modal, Form, Input, Button, message } from 'antd';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import { API } from '../../../../../constants/api.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class AddCategoryDialog extends PageBase {
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
    document.getElementById('add-category-dialog-btn-submit').click();
  }

  async onFinish(values) {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Importer.ProductManagement.addCategory,
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

    this.props.addToListCategories(res.data.category);
    this.setDialogVisible(false);
    message.success(res.messages[0]);
  }

  render() {
    return (
      <div className="product-management__add-category-dialog">
        <div className="product-management__add-category-dialog__btn-open-wrapper">
          <Button
            className="product-management__add-category-dialog__btn-open-wrapper__btn animated fadeIn"
            onClick={() => this.setDialogVisible(true)}
          >Thêm danh mục</Button>
        </div>

        <Modal
          className="product-management__add-category-dialog__content"
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>Danh mục mới</span>}
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOk()}
          onCancel={() => {
            this.setDialogVisible(false);
            if (this.formRef.current) {
              this.formRef.current.resetFields();
            }
          }}
          okText="Thêm"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >
          <Form
            {...layout}
            ref={current => this.formRef.current = current}
            onFinish={values => this.onFinish(values)}
            onFinishFailed={() => message.error('Chưa nhập đầy đủ thông tin, vui lòng kiểm tra lại.')}
          >
            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
            >
              <Input placeholder="Tối đa 30 kí tự" autoFocus={true} />
            </Form.Item>
            <Form.Item style={{ display: 'none' }}>
              <Button id="add-category-dialog-btn-submit" htmlType="submit" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(AddCategoryDialog));