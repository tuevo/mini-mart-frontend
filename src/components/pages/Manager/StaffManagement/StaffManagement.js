import React from 'react';
import PageBase from '../../../utilities/PageBase/PageBase';
import './StaffManagement.style.scss';
import { SearchOutlined, UserDeleteOutlined, TeamOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Input, Row, Col, Select, Table, Avatar, message, Skeleton, Modal, Empty } from 'antd';
import { withCookies } from 'react-cookie';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import { API } from '../../../../constants/api.constant';
import { connect } from 'react-redux';
import * as actions from '../../../../redux/actions';
import moment from 'moment';
import USER_ROLES from '../../../../constants/user-role.constant';
import AddStaffDialog from './AddStaffDialog/AddStaffDialog';
import UpdateStaffDialog from './UpdateStaffDialog/UpdateStaffDialog';

const { Option } = Select;
const { confirm } = Modal;

class StaffManagement extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      staffs: [],
      filteredStaffs: [],
      selectedStaff: null,
      searchStaffText: '',
      filteredStaffRole: null
    }
  }

  componentDidMount() {
    this.loadStaffs(null, null);
  }

  loadStaffs = async (role, defaultStaff) => {
    this.props.setAppLoading(true);

    let url = API.Manager.StaffManagement.getListStaffs;
    if (role) {
      url += `?role=${role}`;
    }

    const res = await (
      await fetch(
        url,
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

    if (res.status === 200) {
      const { users } = res.data;
      let { filteredStaffs, selectedStaff } = this.state;

      if (!role) {
        filteredStaffs = [...users];
      } else {
        filteredStaffs = users.filter(u => u.role === role);
      }

      if (filteredStaffs.length > 0) {
        if (defaultStaff) {
          selectedStaff = defaultStaff;
        } else {
          selectedStaff = filteredStaffs[0];
        }
      } else {
        selectedStaff = null;
      }

      this.setState({ staffs: users, filteredStaffs, selectedStaff });
    } else {
      message.error(res.errors[0]);
    }

    this.props.setAppLoading(false);
  }

  onClickListStaffsRow(record) {
    this.setState({ selectedStaff: record });
  }

  filterListStaffsByRole(role) {
    let { filteredStaffs, staffs, selectedStaff } = this.state;

    if (!role) {
      filteredStaffs = [...staffs];
    } else {
      filteredStaffs = staffs.filter(s => s.role === role);
    }

    if (filteredStaffs.length > 0) {
      selectedStaff = filteredStaffs[0];
    } else {
      selectedStaff = null;
    }

    this.setState({ filteredStaffs, filteredStaffRole: role, selectedStaff });
  }

  openRemoveStaffConfirm(staff) {
    const that = this;
    confirm({
      title: `Bạn có muốn xóa ${staff.fullname} khỏi hệ thống?`,
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      async onOk() {
        that.props.setAppLoading(true);

        const staffID = staff._id;
        const res = await (
          await fetch(
            API.Manager.StaffManagement.removeStaff.replace('{deletedUserID}', staffID),
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

        let { staffs, filteredStaffRole, filteredStaffs, selectedStaff } = that.state;
        staffs = staffs.filter(s => s._id !== staffID);
        staffs.sort((a, b) => {
          const time1 = new Date(a.createdAt).getTime();
          const time2 = new Date(b.createdAt).getTime();
          return time2 - time1;
        });

        filteredStaffs = staffs.filter(s => {
          if (filteredStaffRole)
            return s.role === filteredStaffRole;
          return true;
        });
        if (filteredStaffs.length > 0) {
          selectedStaff = filteredStaffs[0];
        } else {
          selectedStaff = null;
        }

        that.setState({ staffs, selectedStaff, filteredStaffs });
        message.success(res.messages[0]);
      },
      onCancel() { },
    });
  }

  onChangeSearchStaffInput(text) {
    this.setState({ searchStaffText: text });

    if (!text) {
      this.filterListStaffsByRole(this.state.filteredStaffRole);
    } else {
      let { filteredStaffs } = this.state;
      filteredStaffs = filteredStaffs
        .filter(s => {
          const keys = [...Object.keys(s)].filter(k => typeof (s[k]) === 'string');
          for (const k of keys) {
            if (s[k].toLowerCase().includes(text.toLowerCase()))
              return true;
          }
          return false;
        });

      this.setState({ filteredStaffs });
    }
  }

  render() {
    let { filteredStaffs, selectedStaff } = this.state;

    filteredStaffs = filteredStaffs.map((s, i) => {
      let staff = JSON.parse(JSON.stringify(s));
      staff.key = i;
      return staff;
    });

    let columns;
    if (filteredStaffs.length === 0) {
      columns = [];
      selectedStaff = null;
    } else {
      if (!selectedStaff) {
        selectedStaff = filteredStaffs[0];
      }

      columns = Object.keys(filteredStaffs[0])
        .filter(k => !['_id', 'avatar', 'updatedAt', '__v', 'key', 'workAssignments'].includes(k));
      columns = columns.map(k => {
        let title, colIndex;
        switch (k) {
          case 'fullname': title = 'Nhân viên'; colIndex = 0; break;
          case 'username': title = 'Tên TK'; colIndex = 1; break;
          case 'role': title = 'Chức vụ'; colIndex = 2; break;
          case 'dateOfBirth': title = 'Ngày sinh'; colIndex = 3; break;
          case 'sex': title = 'Giới tính'; colIndex = 4; break;
          case 'email': title = 'Email'; colIndex = 5; break;
          case 'phone': title = 'Điện thoại'; colIndex = 6; break;
          case 'address': title = 'Địa chỉ'; colIndex = 7; break;
          case 'salaryRate': title = 'HS lương'; colIndex = 8; break;
          case 'createdAt': title = 'Ngày tham gia'; colIndex = 9; break;
          default: break;
        }

        let column = {
          title,
          colIndex,
          dataIndex: k,
          width: 100
        }

        if (k === 'fullname') {
          column.render = (text, record) => (
            <Row align="middle" style={{ width: '100%' }}>
              <Col span={6}><Avatar src={record.avatar} size={24} /></Col>
              <Col span={18}><span style={{ marginLeft: 7, fontWeight: 'bold' }}>{text}</span></Col>
            </Row>
          );
          column.width = 160;
        }

        if (k === 'role') {
          column.render = (text, record) => {
            let className;
            if (text === USER_ROLES.MANAGER.type)
              className = 'staff-management__role-badge staff-management__role-badge--manager';
            if (text === USER_ROLES.CASHIER.type)
              className = 'staff-management__role-badge staff-management__role-badge--cashier';
            if (text === USER_ROLES.IMPORTER.type)
              className = 'staff-management__role-badge staff-management__role-badge--importer';

            return (<span className={className}>{USER_ROLES[text].name}</span>)
          };
          column.width = 120;
        }

        if (k === 'address') {
          column.width = 180;
        }

        if (k === 'email' || k === 'createdAt') {
          column.width = 140;
        }

        if (k === 'salaryRate' || k === 'dateOfBirth' || k === 'phone') {
          column.width = 100;
        }

        if (k === 'sex') {
          column.width = 80;
        }

        if (k === 'createdAt') {
          column.render = text => moment(text).format('DD-MM-YYYY HH:mm');
        }

        return column;
      });

      columns.sort((a, b) => a.colIndex - b.colIndex);
    }

    return (
      <div className="staff-management animated fadeIn">
        <div className="staff-management__body">
          <Row className="staff-management__body__staffs">
            <Col span={4}>
              <div className="staff-management__body__staffs__sidebar">
                <div className="staff-management__body__staffs__sidebar__staff-details">
                  {selectedStaff ? (
                    <Avatar
                      className="staff-management__body__staffs__sidebar__staff-details__avatar"
                      size={50}
                      src={selectedStaff ? selectedStaff.avatar : 'https://cdn.wrytin.com/images/avatar/s/256/default.jpeg'}
                    />
                  ) : (
                      <div className="staff-management__body__staffs__sidebar__staff-details__avatar">
                        <Skeleton.Avatar
                          active={true} size={50}
                          shape="circle"
                        />
                      </div>
                    )}
                  <div className="staff-management__body__staffs__sidebar__staff-details__basic-info">
                    <div className="staff-management__body__staffs__sidebar__staff-details__basic-info__name">
                      <span>
                        {selectedStaff ? selectedStaff.fullname : (
                          <Skeleton.Input style={{ width: 100, height: 20 }} active={true} size="small" />
                        )}
                      </span>
                    </div>
                    <div className="staff-management__body__staffs__sidebar__staff-details__basic-info__role">
                      <span>{selectedStaff ? USER_ROLES[selectedStaff.role].name : ''}</span>
                    </div>
                  </div>
                </div>

                <ul className="staff-management__body__staffs__sidebar__staff-features">
                  <li className="staff-management__body__staffs__sidebar__staff-features__feature">
                    {selectedStaff ? (
                      <UpdateStaffDialog
                        selectedStaff={{ ...selectedStaff }}
                        reloadStaffs={updatedStaff => this.loadStaffs(this.state.filteredStaffRole, updatedStaff)}
                      />
                    ) : (<Skeleton.Input style={{ width: '100%', height: 22 }} active={true} size="small" />)}
                  </li>
                  <li
                    className="staff-management__body__staffs__sidebar__staff-features__feature"
                    onClick={() => this.openRemoveStaffConfirm(selectedStaff)}
                  >
                    {selectedStaff ? (
                      <Row align="middle">
                        <Col span={2}>
                          <UserDeleteOutlined className="staff-management__body__staffs__sidebar__staff-features__feature__icon" />
                        </Col>
                        <Col span={22} className="staff-management__body__staffs__sidebar__staff-features__feature__info">
                          <span className="staff-management__body__staffs__sidebar__staff-features__feature__info__name">
                            Xóa khỏi hệ thống</span>
                        </Col>
                      </Row>
                    ) : (<Skeleton.Input style={{ width: '100%', height: 22 }} active={true} size="small" />)}
                  </li>
                </ul>

              </div>
            </Col>
            <Col span={20}>
              <div className="staff-management__body__staffs__content">
                <div className="staff-management__body__staffs__content__toolbar">
                  <Row style={{ width: '100%' }} align="middle">
                    <Col span={7}>
                      <Input
                        prefix={<SearchOutlined style={{ marginRight: 5 }} />}
                        placeholder="Tìm kiếm nhân viên..."
                        onChange={e => this.onChangeSearchStaffInput(e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
                <div className="staff-management__body__staffs__content__list-staffs">
                  <div className="staff-management__body__staffs__content__list-staffs__header">
                    <div className="staff-management__body__staffs__content__list-staffs__header__dark-bg"></div>
                    <Row>
                      <Col span={6}>
                        <div
                          className="staff-management__body__staffs__content__list-staffs__header__role-selection">
                          <Select
                            defaultValue={null}
                            style={{ width: 200 }}
                            onChange={value => this.filterListStaffsByRole(value)}
                          >
                            <Option value={null}>Tất cả nhân viên</Option>
                            <Option value={USER_ROLES.CASHIER.type}>{USER_ROLES.CASHIER.name}</Option>
                            <Option value={USER_ROLES.IMPORTER.type}>{USER_ROLES.IMPORTER.name}</Option>
                            <Option value={USER_ROLES.MANAGER.type}>{USER_ROLES.MANAGER.name}</Option>
                          </Select>
                          <div className="staff-management__body__staffs__content__list-staffs__header__role-selection__staft-total-by-role">
                            <TeamOutlined style={{ marginRight: 7 }} />
                            <span>{filteredStaffs.length}</span>
                          </div>
                        </div>
                      </Col>
                      <Col span={18}>
                        <div className="staff-management__body__staffs__content__list-staffs__header__dialogs">
                          <AddStaffDialog
                            reloadStaffs={newStaff => this.loadStaffs(this.state.filteredStaffRole, newStaff)}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <Row className="staff-management__body__staffs__content__list-staffs__wrapper">
                    <Table
                      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" /> }}
                      columns={columns}
                      dataSource={filteredStaffs}
                      pagination={false}
                      scroll={{ y: 445 }}
                      onRow={(record) => {
                        return {
                          onClick: () => this.onClickListStaffsRow(record)
                        }
                      }}
                      rowClassName={record => record._id === selectedStaff._id ?
                        'staff-management__body__staffs__content__list-staffs__selected-row' : ''}
                    />
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(StaffManagement));
