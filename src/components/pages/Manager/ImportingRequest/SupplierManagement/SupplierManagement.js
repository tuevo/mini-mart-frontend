import React from 'react';
import { Row, Col, Input, Empty, Button, Divider, List, message, Modal } from 'antd';
import { SearchOutlined, DeleteOutlined, EnvironmentTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import './SupplierManagement.style.scss';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import * as actions from '../../../../../redux/actions';
import PageBase from '../../../../utilities/PageBase/PageBase';
import { API } from '../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import * as _ from 'lodash';
import AddSupplierDialog from './AddSupplierDialog/AddSupplierDialog';
import GoogleMap from '../../../../utilities/GoogleMap/GoogleMap';
import EditSupplierDialog from './EditSupplierDialog/EditSupplierDialog';

class SupplierManagement extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      suppliersDataSource: [],
      filteredSuppliers: [],
      selectedSupplier: {},
      supplierSearchText: ''
    }
  }

  componentDidMount() {
    this.loadSuppliers();
  }

  openRemoveSupplierConfirmDialog(supplierID) {
    const that = this;
    let { suppliersDataSource } = this.state;
    const supplier = suppliersDataSource.find(s => s._id === supplierID);
    Modal.confirm({
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
            API.Manager.SupplierManagment.removeSupplier.replace('{supplierID}', supplierID),
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

        suppliersDataSource = suppliersDataSource.filter(s => s._id !== supplierID);
        that.onSupplierSearchInputChange(that.state.supplierSearchText, suppliersDataSource);
        that.setState({ suppliersDataSource });
        message.success(res.messages[0]);
      }
    });
  }

  async loadSuppliers() {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Manager.SupplierManagment.getSuppliers,
        {
          method: 'GET',
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

    const { suppliers } = res.data;
    this.onSupplierSearchInputChange(this.state.supplierSearchText, suppliers);
    this.setState({ suppliersDataSource: suppliers });
  }

  onSupplierSearchInputChange(text, suppliersDataSource, defaultSelectedSupplier) {
    let { filteredSuppliers } = this.state;
    if (!text) {
      filteredSuppliers = [...suppliersDataSource];
    } else {
      filteredSuppliers = suppliersDataSource.filter(s => {
        const searchKeys = Object.keys(s).filter(k => ['name'].includes(k));
        for (const k of searchKeys) {
          if (s[k].toLowerCase().includes(text.toLowerCase()))
            return true;
        }
        return false;
      })
    }

    this.setState({
      filteredSuppliers,
      selectedSupplier: defaultSelectedSupplier || (filteredSuppliers.length > 0 ? filteredSuppliers[0] : {}),
      supplierSearchText: text
    });
  }

  handleSelectSupplier(_id) {
    const selectedSupplier = _.find(this.state.suppliersDataSource, s => s._id === _id);
    this.setState({ selectedSupplier });
  }

  addToSuppliersDataSource(supplier) {
    let { suppliersDataSource } = this.state;
    suppliersDataSource.push(supplier);
    this.onSupplierSearchInputChange(this.state.supplierSearchText, suppliersDataSource);
    this.setState({ suppliersDataSource });
  }

  updateSuppliersDataSource(supplier) {
    const { suppliersDataSource } = this.state;
    const index = _.findIndex(suppliersDataSource, s => s._id === supplier._id);

    if (index < 0)
      return;

    suppliersDataSource[index] = { ...supplier };
    this.onSupplierSearchInputChange(this.state.supplierSearchText, suppliersDataSource, { ...supplier });
    this.setState({ suppliersDataSource });
  }

  render() {
    const { filteredSuppliers, selectedSupplier } = this.state;
    return (
      <div className="importing-request__container__suppliers">
        <div className="importing-request__container__suppliers__header">
          <span className="importing-request__container__suppliers__header__title">
            Nhà cung cấp sản phẩm
          </span>
        </div>
        <div className="importing-request__container__suppliers__toolbar">
          <Row style={{ width: '100%' }}>
            <Col span={21}>
              <Input
                prefix={<SearchOutlined style={{ marginRight: 5 }} />}
                placeholder="Tìm kiếm theo tên, địa chỉ, điện thoại..."
                onChange={e => this.onSupplierSearchInputChange(e.target.value, this.state.suppliersDataSource)}
              />
            </Col>
            <Col span={3} align="center">
              <AddSupplierDialog
                addToSuppliersDataSource={supplier => this.addToSuppliersDataSource(supplier)}
              />
            </Col>
          </Row>
        </div>
        <div className="importing-request__container__suppliers__list">
          <List
            size="small"
            dataSource={filteredSuppliers}
            renderItem={s => (
              <List.Item
                onClick={() => this.handleSelectSupplier(s._id)}
                className={`importing-request__container__suppliers__list__item animated fadeIn 
                  ${selectedSupplier._id === s._id ? '--selected' : ''}
                `}
                key={s._id}>
                {s.name}
              </List.Item>
            )}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" /> }}
          />
        </div>
        <div className="importing-request__container__suppliers__details">
          <div className="importing-request__container__suppliers__details__header">
            <span className="importing-request__container__suppliers__details__header__title">
              Thông tin liên hệ
                    </span>
            <div className="importing-request__container__suppliers__details__header__toolbar">
              <EditSupplierDialog
                supplier={{ ...selectedSupplier }}
                updateSuppliersDataSource={supplier => this.updateSuppliersDataSource(supplier)}
              />

              <Button
                shape="circle"
                icon={<DeleteOutlined />}
                className="importing-request__container__suppliers__details__header__toolbar__btn"
                onClick={() => this.openRemoveSupplierConfirmDialog(selectedSupplier._id)}
              />
            </div>
          </div>
          <Divider />
          <div className="importing-request__container__suppliers__details__content">
            <Row style={{ width: '100%' }}>
              <Col span={6}>
                <span className="importing-request__container__suppliers__details__content__label">
                  Thương hiệu
                        </span>
              </Col>
              <Col span={18}>{selectedSupplier.name}</Col>
            </Row>
            <Row style={{ width: '100%' }}>
              <Col span={6}>
                <span className="importing-request__container__suppliers__details__content__label">
                  Số điện thoại
                        </span>
              </Col>
              <Col span={18}>{selectedSupplier.phone}</Col>
            </Row>
            <Row style={{ width: '100%' }}>
              <Col span={6}>
                <span className="importing-request__container__suppliers__details__content__label">
                  Địa chỉ
                        </span>
              </Col>
              <Col span={18}>
                <p style={{ minHeight: 35, maxHeight: 35 }}>
                  {selectedSupplier.address}
                </p>
              </Col>
            </Row>

            <div className="importing-request__container__suppliers__details__content__map">
              <GoogleMap
                width={'100%'}
                height={200}
                address={selectedSupplier.address}
                locationIcon={
                  <EnvironmentTwoTone
                    twoToneColor="#ff8220"
                    style={{ fontSize: 24 }}
                  />
                }
              />
            </div>

          </div>
        </div>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(SupplierManagement));