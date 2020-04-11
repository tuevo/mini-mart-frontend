import React from 'react';
import { withCookies } from 'react-cookie';
import { Button, Modal, Input, Table, Empty, Dropdown, Menu, Form, Divider, message } from 'antd';
import { RocketOutlined, SearchOutlined, EditOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './SupplierDialog.style.scss';
import moment from 'moment';
import EditSupplierDialog from './EditSupplierDialog/EditSupplierDialog';
import * as _ from 'lodash';
import PageBase from '../../../../utilities/PageBase/PageBase';
import { connect } from 'react-redux';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import * as actions from '../../../../../redux/actions';
import { API } from '../../../../../constants/api.constant';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
const { confirm } = Modal;

class SupplierDialog extends PageBase {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      suppliers: [],
      filteredSuppliers: [],
      supplierSearchText: '',
      isFrmAddSupplierShown: false,
      selectedSupplier: {}
    }

    this.frmAddSupplierRef = React.createRef();
  }

  resetAllStates() {
    this.setState({
      isVisible: false,
      suppliers: [],
      filteredSuppliers: [],
      supplierSearchText: ''
    })
  }

  componentDidMount() {
    let { suppliers } = this.props;
    if (suppliers.length === 0)
      return;

    suppliers = suppliers
      .map(s => ({ ...s, key: s._id, checked: false }))
      .filter(s => s._id !== 'ALL')
      .map((s, i) => ({ ...s, order: i + 1 }));

    this.setState({ suppliers, filteredSuppliers: [...suppliers] });
  }

  setDialogVisible(isVisible) {
    this.setState({ isVisible });
  }

  async submitFrmAddSupplier(values) {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Importer.ProductManagement.addSupplier,
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

    const { supplier } = res.data;
    let { suppliers } = this.state;
    suppliers.push({ ...supplier, key: supplier._id, order: suppliers.length + 1 });
    this.onChangeSearchInput(this.state.supplierSearchText, [...suppliers]);
    this.props.addToListSuppliers(supplier);
    this.setState({ suppliers });

    if (this.frmAddSupplierRef.current) {
      this.frmAddSupplierRef.current.resetFields();
    }

    message.success(res.messages[0]);
  }

  onChangeSearchInput(text, suppliers) {
    this.setState({ supplierSearchText: text });

    let { filteredSuppliers } = this.state;
    if (!text) {
      filteredSuppliers = [...suppliers];
    } else {
      filteredSuppliers = suppliers.filter(s => {
        const keys = Object.keys(s).filter(k => ['name', 'phone', 'address'].includes(k));
        for (const k of keys) {
          if (s[k].toLowerCase().includes(text.toLowerCase()))
            return true;
        }
        return false;
      })
    }

    this.setState({ filteredSuppliers });
  }

  toggleFrmAddSupplier() {
    if (this.frmAddSupplierRef.current) {
      this.frmAddSupplierRef.current.resetFields();
    }
    this.setState({ isFrmAddSupplierShown: !this.state.isFrmAddSupplierShown });
  }

  openRemoveSupplierDialog(supplierID) {
    const that = this;
    const supplier = this.state.suppliers.find(s => s._id === supplierID);
    confirm({
      title: `Bạn muốn xóa nhà cung cấp ${supplier.name}?`,
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      async onOk() {
        that.props.setAppLoading(false);
        const res = await (
          await fetch(
            API.Importer.ProductManagement.removeSupplier.replace('{supplierID}', supplier._id),
            {
              method: 'DELETE',
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'token': that.props.cookies.get(COOKIE_NAMES.token)
              },
              signal: that.abortController.signal
            }
          )
        ).json();

        that.props.setAppLoading(false);
        if (res.status !== 200) {
          message.error(res.errors[0]);
          return;
        }

        let { suppliers } = that.state;
        suppliers = suppliers
          .filter(s => s._id !== supplier._id)
          .map((s, i) => {
            s.order = i + 1;
            return s;
          });
        that.onChangeSearchInput(that.state.supplierSearchText, suppliers);
        that.props.removeFromListSuppliers(supplier);
        that.setState({ suppliers });
        message.success(res.messages[0]);
      },
      onCancel() { },
    });
  }

  updateSupplierInList(supplier) {
    const { suppliers } = this.state;
    const index = _.findIndex(suppliers, s => s._id === supplier._id);
    if (index < 0)
      return;
    suppliers[index] = { ...supplier, order: index + 1, key: supplier._id };
    this.onChangeSearchInput(this.state.supplierSearchText, suppliers);
    this.props.updateProductSupplier({ ...suppliers[index] });
    this.setState({ suppliers });
  }

  handleSelectSupplier(supplier) {
    this.setState({ selectedSupplier: this.state.suppliers.find(s => s._id === supplier._id) });
  }

  render() {
    const { filteredSuppliers } = this.state;
    const columns = [
      {
        title: (<center>STT</center>),
        dataIndex: 'order',
        key: 'order',
        width: 80,
        render: order => (<center>{order}</center>)
      },
      {
        title: 'Tên thương hiệu',
        dataIndex: 'name',
        key: 'name',
        width: 200
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        width: 150
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        width: 150
      },
      {
        title: 'Cập nhật lần cuối',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (updatedAt) => `Lúc ${moment(updatedAt).format('HH:mm DD-MM-YYYY')}`,
        width: 170
      },
      {
        title: '',
        dataIndex: '',
        key: '',
        render: (value, supplier) => (
          <Dropdown overlay={
            <Menu className="product-management__supplier-dialog__content__suppliers__item__menu">
              <Menu.Item key="EDIT">
                <EditSupplierDialog
                  supplier={supplier}
                  updateSupplierInList={supplier => this.updateSupplierInList(supplier)}
                />
              </Menu.Item>
              <Menu.Item key="REMOVE">
                <Button
                  type="link"
                  style={{ color: 'rgba(0,0,0,0.65)' }}
                  onClick={() => this.openRemoveSupplierDialog(supplier._id)}>
                  Xóa</Button>
              </Menu.Item>
            </Menu>
          }>
            <EditOutlined className="product-management__supplier-dialog__content__suppliers__item__btn-drop-menu" />
          </Dropdown>
        )
      }
    ];

    return (
      <div className="product-management__supplier-dialog">
        <Button
          icon={<RocketOutlined />}
          className="product-management__supplier-dialog__btn-open animated fadeIn"
          onClick={() => this.setDialogVisible(true)}
        >
          <span className="product-management__supplier-dialog__btn-open__text">Nhà cung cấp</span>
        </Button>

        <Modal
          className="product-management__supplier-dialog__content"
          title={
            <div className="product-management__supplier-dialog__content__title">
              <div className="product-management__supplier-dialog__content__title__icon-wrapper">
                <RocketOutlined className="product-management__supplier-dialog__content__title__icon-wrapper__icon" />
              </div>
              <span className="product-management__supplier-dialog__content__title__text">Nhà cung cấp sản phẩm</span>
            </div>
          }
          visible={this.state.isVisible}
          onCancel={() => {
            this.setDialogVisible(false);
            this.setState({ isFrmAddSupplierShown: false });
          }}
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <div className="product-management__supplier-dialog__content__toolbar">
            <Input
              prefix={<SearchOutlined style={{ marginRight: 3 }} />}
              placeholder="Tìm kiếm theo tên, điện thoại, địa chỉ..."
              onChange={e => this.onChangeSearchInput(e.target.value, this.state.suppliers)}
            />
            <Button
              shape="circle"
              icon={<PlusOutlined />}
              className="product-management__supplier-dialog__content__toolbar__btn-open-add-supplier-form"
              onClick={() => this.toggleFrmAddSupplier()}
            />
          </div>

          {this.state.isFrmAddSupplierShown ? (
            <div style={{ overflow: 'hidden', marginTop: 10 }}>
              <div className="product-management__supplier-dialog__content__frm-add-supplier animated fadeIn">
                <Divider
                  orientation="left"
                  className="product-management__supplier-dialog__content__frm-add-supplier__title">
                  Nhà cung cấp mới
                </Divider>
                <Form
                  {...layout}
                  ref={current => { this.frmAddSupplierRef.current = current; }}
                  onFinish={values => this.submitFrmAddSupplier(values)}
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
                  <Form.Item {...tailLayout}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="product-management__supplier-dialog__content__frm-add-supplier__btn-submit"
                    >
                      Thêm
                </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          ) : <></>}

          <div className="product-management__supplier-dialog__content__suppliers">
            <Table
              dataSource={[...filteredSuppliers]}
              columns={columns}
              pagination={false}
              scroll={{ y: 300 }}
              locale={{ emptyText: (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />) }}
              onRow={(supplier) => {
                return {
                  onClick: () => this.handleSelectSupplier(supplier)
                }
              }}
            />
          </div>

        </Modal>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(SupplierDialog));
