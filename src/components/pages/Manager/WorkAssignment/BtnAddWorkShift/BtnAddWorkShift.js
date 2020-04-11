import React from 'react';
import { withCookies } from 'react-cookie';
import { Modal, Button, Tooltip, TimePicker, Row, Col, message } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import './BtnAddWorkShift.style.scss';
import moment from 'moment';
import * as _ from 'lodash';
import { API } from '../../../../../constants/api.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';

const format = 'HH:mm';

class BtnAddWorkShift extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      startTime: null,
      endTime: null
    }
  }

  setModalVisible(isVisible) {
    if (!isVisible) {
      this.setState({
        startTime: null,
        endTime: null
      })
    }
    this.setState({ isVisible });
  }

  sortWorkShiftsByStartTime(workShifts) {
    workShifts.sort((a, b) => {
      const time1 = new Date(a.startTime).getTime();
      const time2 = new Date(b.startTime).getTime();
      return time1 - time2;
    });
  }

  onOK = async () => {
    const { startTime, endTime } = this.state;
    if (!(startTime && endTime)) {
      message.error('Vui lòng chọn đầy đủ các mốc thời gian');
      return;
    }

    if (startTime >= endTime) {
      message.error('Khoảng thời gian đã chọn không hợp lệ');
      return;
    }

    let {
      workSchedules,
      selectedWorkSchedule,
      selectedWorkDay,
      selectedWorkShift
    } = this.props;

    const res = await (
      await fetch(
        API.Manager.WorkShift.addWorkShift,
        {
          method: 'POST',
          body: JSON.stringify({
            workScheduleID: selectedWorkSchedule._id,
            startTime,
            endTime
          }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'token': this.props.cookies.get(COOKIE_NAMES.token)
          },
          signal: this.abortController.signal
        }
      )
    ).json();

    if (res.status === 200) {
      this.setModalVisible(false);
      message.success(res.messages[0]);

      const { workShift } = res.data;
      selectedWorkDay.workShifts.push(workShift);
      this.sortWorkShiftsByStartTime(selectedWorkDay.workShifts);

      const selectedWorkShiftIndex = selectedWorkDay.workShifts.findIndex(ws => ws._id === workShift._id);
      if (selectedWorkShiftIndex >= 0) {
        selectedWorkShift = selectedWorkDay.workShifts[selectedWorkShiftIndex];
        selectedWorkShift.index = selectedWorkShiftIndex;
      }

      for (const week of selectedWorkSchedule.workDays) {
        const day = _.find(week, d => selectedWorkDay.workDayInMonth === d.workDayInMonth);
        if (day) {
          day.workShifts.push(workShift);
          this.sortWorkShiftsByStartTime(day.workShifts);
          break;
        }
      }

      for (let wsc of workSchedules) {
        if (wsc._id === selectedWorkSchedule._id) {
          wsc.workShifts.push(workShift);
          this.sortWorkShiftsByStartTime(wsc.workShifts);
          break;
        }
      }

      this.props.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift);
    } else {
      message.error(res.errors[0]);
    }
  }

  onCancel() {
    this.setModalVisible(false);
  }

  onChangeTimePicker(fieldName, e) {
    const { selectedWorkDay } = this.props;

    const selectedTime = new Date(e);
    const hours = selectedTime.getHours();
    const mins = selectedTime.getMinutes();
    const { workDayInMonth, workMonth, workYear } = selectedWorkDay;
    const workShiftTime = new Date(workYear, workMonth - 1, workDayInMonth, hours, mins);

    switch (fieldName) {
      case 'startTime':
        this.setState({ startTime: workShiftTime.getTime() })
        break;
      case 'endTime':
        this.setState({ endTime: workShiftTime.getTime() })
        break;
      default:
        break;
    }
  }

  render() {
    const { selectedWorkDay } = this.props;
    const { startTime, endTime } = this.state;

    return (
      <div className="add-work-shift-dialog">
        <Tooltip placement="bottom" title="Thêm ca làm việc">
          <Button
            onClick={() => this.setModalVisible(true)}
            className="add-work-shift-dialog__btn-open"
            type="link"
            icon={<PlusCircleFilled />} />
        </Tooltip>
        <Modal
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{`${selectedWorkDay.workWeekDay ? selectedWorkDay.workWeekDay + ', ' : ''} ${selectedWorkDay.workYear ? moment(new Date(selectedWorkDay.workYear, selectedWorkDay.workMonth - 1, selectedWorkDay.workDayInMonth)).format('DD/MM/YYYY') + ' | Ca làm việc mới' : ''}`}</span>}
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOK()}
          onCancel={() => this.onCancel()}
          okText="Thêm"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >

          <div className="add-work-shift-dialog__time-picker">
            <Row align="center" className="add-work-shift-dialog__time-picker__time-selection">
              <Col span={8} className="add-work-shift-dialog__time-picker__time-selection__label" align="center">
                <span>Bắt đầu</span>
              </Col>
              <Col span={16}>
                <TimePicker
                  value={startTime ? moment(new Date(startTime)) : null}
                  placeholder="Chọn mốc thời gian"
                  format={format}
                  onChange={e => this.onChangeTimePicker('startTime', e)}
                />
              </Col>
            </Row>

            <Row align="center" className="add-work-shift-dialog__time-picker__time-selection">
              <Col span={8} className="add-work-shift-dialog__time-picker__time-selection__label" align="center">
                <span>Kết thúc</span>
              </Col>
              <Col span={16}>
                <TimePicker
                  value={endTime ? moment(new Date(endTime)) : null}
                  placeholder="Chọn mốc thời gian"
                  format={format}
                  onChange={e => this.onChangeTimePicker('endTime', e)}
                />
              </Col>
            </Row>
          </div>

        </Modal>
      </div>
    )
  }
}
export default withCookies(BtnAddWorkShift);
