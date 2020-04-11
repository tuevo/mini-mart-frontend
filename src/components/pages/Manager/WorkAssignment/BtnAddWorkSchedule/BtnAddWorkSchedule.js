import React from 'react';
import { Modal, Button, Calendar, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import './BtnAddWorkSchedule.style.scss';
import MONTHS from '../../../../../constants/months.constant';
import { API } from '../../../../../constants/api.constant';
import { withCookies } from 'react-cookie';
import { COOKIE_NAMES } from '../../../../../constants/cookie-name.constant';
import PageBase from '../../../../utilities/PageBase/PageBase';

class BtnAddWorkSchedule extends PageBase {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      selectedDate: null
    }
  }

  setModalVisible(isVisible) {
    if (!isVisible) {
      this.setState({
        selectedDate: null
      });
    }
    this.setState({ isVisible });
  }

  onOK = async () => {
    const { selectedDate } = this.state;
    if (!selectedDate) {
      message.error('Bạn chưa chọn tháng làm việc');
      return;
    }

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const res = await (
      await fetch(
        API.Manager.WorkSchedule.addWorkSchedule,
        {
          method: 'POST',
          body: JSON.stringify({ month, year }),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'token': this.props.cookies.get(COOKIE_NAMES.token)
          },
          signal: this.abortController.signal
        }
      )
    ).json();

    if (res.status === 200) {
      this.setState({ selectedDate: null });
      this.props.reloadWorkSchedules(year);
      this.setModalVisible(false);
      message.success(res.messages[0]);
    } else {
      message.error(res.errors[0]);
    }
  }

  onCancel() {
    this.setModalVisible(false);
  }

  handleSelectMonth(e) {
    const selectedDate = new Date(e);
    this.setState({ selectedDate });
  }

  monthFullCellRender(date) {
    const { selectedDate } = this.state;
    const _date = new Date(date);
    const monthIndex = _date.getMonth();
    return (
      <span className={`
        add-work-schedule-dialog__calendar__month 
        ${selectedDate ? _date.getTime() === selectedDate.getTime() ? 'add-work-schedule-dialog__calendar__month--selected' : '' : ''}
      `}>
        {MONTHS[monthIndex]}
      </span>
    );
  }

  render() {
    return (
      <div className="add-work-schedule-dialog">
        <Button
          className="add-work-schedule-dialog__btn-open"
          icon={<CalendarOutlined />}
          type="primary"
          onClick={() => this.setModalVisible(true)} >
          Thêm lịch làm việc
        </Button>
        <Modal
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>Thêm lịch làm việc</span>}
          centered
          visible={this.state.isVisible}
          onOk={() => this.onOK()}
          onCancel={() => this.onCancel()}
          okText="Thêm"
          cancelText="Hủy bỏ"
          okButtonProps={{ style: { background: '#ff8220', border: 0, fontWeight: 'bold' } }}
        >

          <div className="add-work-schedule-dialog__calendar">
            <Calendar
              mode="year"
              monthFullCellRender={date => this.monthFullCellRender(date)}
              fullscreen={false}
              onPanelChange={e => this.handleSelectMonth(e)} />
          </div>

        </Modal>
      </div>
    )
  }
}
export default withCookies(BtnAddWorkSchedule);