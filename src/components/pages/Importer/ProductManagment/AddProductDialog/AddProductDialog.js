import React from 'react';
import './AddProductDialog.style.scss';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import * as actions from '../../../../../redux/actions';
import { Button, Modal, Form, Input, InputNumber, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImageUploader from '../../../../utilities/ImageUploader/ImageUploader';
import { API } from '../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class AddProductDialog extends PageBase {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false
    }

    this.formRef = React.createRef();
  }

  setDialogVisible(isVisible) {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
    this.setState({ isVisible });
  }

  async onOK() {
    document.getElementById('product-management-add-product-dialog-btn-submit').click();
  }

  async onFinish(values) {
    this.props.setAppLoading(true);
    const params = {
      image: values.image,
      name: values.name,
      supplierID: values.supplier,
      categoryID: this.props.selectedCategory._id,
      price: values.price,
      availableQuantity: values.availableQuantity
    }
    const res = await (
      await fetch(
        API.Importer.ProductManagement.addProduct,
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

    this.props.setAppLoading(false);
    if (res.status !== 200) {
      message.error(res.errors[0]);
      return;
    }

    const { product } = res.data;
    this.setDialogVisible(false);
    this.props.addToListProducts({ ...product });
    message.success(res.messages[0]);
  }

  render() {
    const { selectedCategory } = this.props;
    return (
      <div className="product-management__add-product-dialog">
        <Button
          shape="circle"
          icon={<PlusOutlined />}
          className="product-management__add-product-dialog__btn-open animated bounceIn"
          onClick={() => this.setDialogVisible(true)}
        />

        <Modal
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{`Danh mục: ${selectedCategory.name} | Sản phẩm mới`}</span>}
          visible={this.state.isVisible}
          onOk={() => this.onOK()}
          onCancel={() => this.setDialogVisible(false)}
          okText="Thêm"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >
          <div className="product-management__add-product-dialog__content">
            <div className="product-management__add-product-dialog__content__img-uploading">
              <ImageUploader
                width={150}
                height={150}
                tooltipTitle="Nhấn để thay đổi ảnh"
                tooltipPlacement="bottom"
                onFinish={imageUrl => this.formRef.current.setFieldsValue({ image: imageUrl })}
                clearImage={!this.state.isVisible}
              />
            </div>
            <Form
              {...layout}
              ref={current => {
                this.formRef.current = current;
                if (this.formRef.current) {
                  this.formRef.current.setFieldsValue({ supplier: this.props.suppliers[0]._id })
                }
              }}
              className="product-management__add-product-dialog__content__form"
              onFinish={values => this.onFinish(values)}
              onFinishFailed={() => message.error('Thông tin sản phẩm chưa đầy đủ, vui lòng kiểm tra lại.')}
            >
              <Form.Item name="image" rules={[{ required: true }]} style={{ display: 'none' }}>
                <Input />
              </Form.Item>

              <Form.Item style={{ display: 'none' }}>
                <Button id="product-management-add-product-dialog-btn-submit" htmlType="submit" />
              </Form.Item>

              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Tối đa 50 kí tự" />
              </Form.Item>

              <Form.Item
                name="supplier"
                label="Nhà cung cấp"
                rules={[{ required: true }]}
              >
                <Select>
                  {this.props.suppliers.map(s => (
                    <Select.Option value={s._id} key={s._id}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="price"
                label="Giá bán (VNĐ)"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập giá bán'
                  }
                ]}
              >
                <InputNumber
                  placeholder="Tối thiểu là 0"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                name="availableQuantity"
                label="Số lượng hiện có"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập số lượng hiện có'
                  }
                ]}
              >
                <InputNumber
                  placeholder="Tối thiểu là 0"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>

            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(AddProductDialog));


