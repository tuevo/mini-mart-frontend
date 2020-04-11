import React from 'react';
import { UsergroupAddOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip, message, List, Avatar, Row, Col, Checkbox } from 'antd';
import './BtnAddWorkShiftAssigner.style.scss';
import { withCookies } from 'react-cookie';
import PageBase from '../../../../utilities/PageBase/PageBase';
import USER_ROLES from '../../../../../constants/user-role.constant';
import moment from 'moment';
import { API } from '../../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';

class BtnAddWorkShiftAssigner extends PageBase {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      assigners: [],
      isAllStaffsChecked: false,
      selectedWorkShift: {}
    }
  }

  isWorkShiftAssigner(selectedWorkShift, staff) {
    const assigner = (selectedWorkShift.workAssignments || []).find(wa => wa.assigner._id === staff._id);
    return assigner;
  }

  setModalVisible(isVisible) {
    if (!isVisible) {
      this.setState({
        assigners: [],
        isAllStaffsChecked: false
      });
    }
    this.setState({ isVisible });
  }

  onOK = async () => {
    const { assigners } = this.state;
    if (assigners.length === 0) {
      message.error('Vui lòng chọn nhân viên để phân công');
      return;
    }

    const {
      workSchedules,
      selectedWorkSchedule,
      selectedWorkDay,
      selectedWorkShift
    } = this.props;

    const res = await (
      await fetch(
        API.Manager.WorkAssignment.addWorkAssignments,
        {
          method: 'POST',
          body: JSON.stringify({
            workShift: selectedWorkShift._id,
            assigners
          }),
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

    const { workAssignments } = res.data;
    selectedWorkShift.workAssignments = workAssignments;

    for (let ws of selectedWorkDay.workShifts) {
      if (ws._id === selectedWorkShift._id) {
        ws = selectedWorkShift;
        break;
      }
    }

    for (let wsc of workSchedules) {
      if (wsc._id === selectedWorkSchedule._id) {
        const workShift = wsc.workShifts.find(ws => ws._id === selectedWorkShift._id);
        workShift.workAssignments = workAssignments;
        break;
      }
    }

    this.props.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift);
    this.setModalVisible(false);
    message.success(res.messages[0]);
  }

  onCancel() {
    this.setModalVisible(false);
  }

  onCheckStaff(checked, staffID) {
    const { staffs } = this.props;
    let { assigners } = this.state;

    if (checked) {
      assigners.push(staffID);
    } else {
      assigners = assigners.filter(id => id !== staffID);
    }

    if (assigners.length === staffs.length) {
      this.setState({ isAllStaffsChecked: true });
    } else {
      this.setState({ isAllStaffsChecked: false });
    }

    this.setState({ assigners });
  }

  onCheckAllStaffs(checked) {
    const { staffs } = this.props;

    let { assigners } = this.state;
    if (checked) {
      assigners = staffs.map(staff => staff._id);
    } else {
      assigners = [];
    }

    this.setState({ assigners, isAllStaffsChecked: checked });
  }

  render() {
    const { selectedWorkShift, selectedWorkDay, staffs } = this.props;
    let { assigners } = this.state;

    return (
      <div className="add-work-shift-assigner">
        <Tooltip placement="bottom" title="Thêm nhân viên">
          <Button
            onClick={() => this.setModalVisible(true)}
            className="add-work-shift-assigner__btn-open"
            type="link"
            icon={<UsergroupAddOutlined />}
            disabled={Object.keys(selectedWorkShift).length <= 1}
          />
        </Tooltip>
        <Modal
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{`${selectedWorkDay.workWeekDay ? selectedWorkDay.workWeekDay + ', ' : ''} ${selectedWorkDay.workYear ? moment(new Date(selectedWorkDay.workYear, selectedWorkDay.workMonth - 1, selectedWorkDay.workDayInMonth)).format('DD/MM/YYYY') + ' (' + moment(selectedWorkShift.startTime).format('HH:mm') + ' - ' + moment(selectedWorkShift.endTime).format('HH:mm') + ') | Phân ca làm việc' : ''}`}</span>}
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOK()}
          onCancel={() => this.onCancel()}
          okText="Phân công"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >
          <h3>Nhân viên chưa phân công ({staffs.length})</h3>

          <div className="add-work-shift-assigner__list-staffs">
            <Row className="add-work-shift-assigner__list-staffs__header">
              <Col span={21} className="add-work-shift-assigner__list-staffs__header__col-1">
                {staffs.length > 0 ? (
                  <span>Chọn tất cả</span>
                ) : <></>}
              </Col>
              <Col span={3} className="add-work-shift-assigner__list-staffs__header__col-2">
                {staffs.length > 0 ? (
                  <Checkbox
                    onChange={e => this.onCheckAllStaffs(e.target.checked)}
                    checked={this.state.isAllStaffsChecked} />
                ) : <></>}
              </Col>
            </Row>
            <List
              itemLayout="horizontal"
              dataSource={staffs}
              renderItem={staff => (
                <List.Item>
                  <Row style={{ width: '100%' }} className="animated fadeIn">
                    <Col span={21}>
                      <List.Item.Meta
                        avatar={<Avatar src={staff.avatar} />}
                        title={staff.fullname}
                        description={USER_ROLES[staff.role].name}
                      />
                    </Col>
                    <Col span={3} className="add-work-shift-assigner__list-staffs__checkbox-wrapper">
                      <Checkbox
                        onChange={e => this.onCheckStaff(e.target.checked, staff._id)}
                        checked={assigners.find(id => id === staff._id) ? true : false} />
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>

        </Modal>
      </div>
    )
  }
}
export default withCookies(BtnAddWorkShiftAssigner);