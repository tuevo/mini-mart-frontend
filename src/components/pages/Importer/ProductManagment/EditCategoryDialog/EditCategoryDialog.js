import React from 'react';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import { Modal, Form, Input, Button, message } from 'antd';
import './EditCategoryDialog.style.scss';
import * as actions from '../../../../../redux/actions';
import { API } from '../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class EditCategoryDialog extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false
    }
    this.formRef = React.createRef();
  }

  setDialogVisible(isVisible) {
    if (!isVisible && this.formRef.current) {
      this.formRef.current.resetFields();
    }
    this.setState({ isVisible });
  }

  onOk() {
    document.getElementById('edit-category-dialog-btn-submit').click();
  }

  async onFinish(values) {
    this.props.setAppLoading(false);
    const res = await (
      await fetch(
        API.Importer.ProductManagement.updateCategory.replace('{categoryID}', this.props.category._id),
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

    const { category } = this.props;
    category.name = values.name;
    this.props.updateCategoryInList(category);
    this.setDialogVisible(false);
    message.success(res.messages[0]);
  }

  render() {
    const { category } = this.props;
    return (
      <div className="product-management__edit-category-dialog">
        <Button
          type="link"
          className="product-management__edit-category-dialog__btn-open"
          onClick={() => this.setDialogVisible(true)}
        >Chỉnh sửa</Button>
        <Modal
          className="product-management__edit-category-dialog__content"
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{`Danh mục: ${category.name} | Sửa thông tin`}</span>}
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOk()}
          onCancel={() => this.setDialogVisible(false)}
          okText="Lưu thay đổi"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >
          <Form
            {...layout}
            ref={current => {
              this.formRef.current = current;
              if (this.formRef.current) {
                this.formRef.current.setFieldsValue({
                  name: this.props.category.name
                });
              }
            }}
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
              <Button id="edit-category-dialog-btn-submit" htmlType="submit" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(EditCategoryDialog));
