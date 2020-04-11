import React, { Component } from 'react';
import { withCookies } from 'react-cookie';
import { Row, Col, Table, Empty } from 'antd';
import './WorkScheduleReportToPrint.style.scss';
import USER_ROLES from '../../../../../../constants/user-role.constant';
import moment from 'moment';
import { COOKIE_NAMES } from '../../../../../../constants/cookie-name.constant';

const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

class WorkScheduleReportToPrint extends Component {
  render() {
    const manager = this.props.cookies.get(COOKIE_NAMES.user);
    let { staff } = this.props;

    if (!staff)
      return (<Empty description="Không tìm thấy lịch làm việc" className="work-schedule-report-to-print__empty" />);

    const dataSource = [
      {
        key: '0',
        workShifts: [
          [],
          [],
          [],
          [],
          [],
          [],
          []
        ]
      }
    ];
    for (const wa of staff.workAssignments) {
      const weekday = moment(wa.startTime).isoWeekday() - 1;
      dataSource[0].workShifts[weekday].push(wa);
    }

    const columns = [
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[0].map((ws, index) => (
              <li key={`${index}_0`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      },
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[1].map((ws, index) => (
              <li key={`${index}_1`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      },
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[2].map((ws, index) => (
              <li key={`${index}_2`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      },
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[3].map((ws, index) => (
              <li key={`${index}_3`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      },
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[4].map((ws, index) => (
              <li key={`${index}_4`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      },
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[5].map((ws, index) => (
              <li key={`${index}_5`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      },
      {
        title: '',
        dataIndex: 'workShifts',
        key: 'workShifts',
        render: (text, record) => {
          return (
            <ul>{record.workShifts[6].map((ws, index) => (
              <li key={`${index}_6`}>{`${moment(ws.startTime).format('HH:mm')} - ${moment(ws.endTime).format('HH:mm')}`}</li>
            ))}</ul>
          )
        }
      }
    ];
    const startDate = moment().startOf('day').subtract(moment().isoWeekday() - 1, 'days');
    const endDate = moment().endOf('day').add(7 - moment().isoWeekday(), 'days');
    let dates = [];

    for (let i = 0; i < 7; i++) {
      const date = moment(startDate).add(i, 'days').format('DD/MM');
      dates.push(date);
    }

    for (const i in columns) {
      let title = weekDays[i];
      columns[i].title = `${title} (${dates[i]})`;
    }

    return (
      <div className="work-schedule-report-to-print">

        <div className="work-schedule-report-to-print__header">
          <div className="work-schedule-report-to-print__header__company">
            <img
              className="work-schedule-report-to-print__header__company__logo"
              src={require('../../../../../../assets/images/app-logo.png')} alt="logo" />
            <div className="work-schedule-report-to-print__header__company__brand">
              <div className="work-schedule-report-to-print__header__company__brand__name">
                <span>Mini Mart</span>
              </div>
              <div className="work-schedule-report-to-print__header__company__brand__slogan">
                <span>Tiện Lợi mà Chất Lượng</span>
              </div>
            </div>
          </div>

          <div className="work-schedule-report-to-print__header__created-date">
            <span>{moment().format('DD/MM/YYYY HH:mm')}</span>
          </div>

          <div className="work-schedule-report-to-print__header__title">
            <h2>Lịch làm việc trong tuần</h2>
            <span className="work-schedule-report-to-print__header__title__date-range">
              (Từ ngày {startDate.format('DD/MM/YYYY')} đến ngày {endDate.format('DD/MM/YYYY')})
            </span>
          </div>
        </div>

        <div className="work-schedule-report-to-print__content">
          <div className="work-schedule-report-to-print__content__staff-info">
            <h3>Thông tin nhân viên</h3>
            <Row
              style={{ width: '100%' }}
              gutter={10}
              className="work-schedule-report-to-print__content__staff-info__item"
            >
              <Col span={7} style={{ fontWeight: 'bold' }}>Họ và tên</Col>
              <Col span={17} style={{ fontWeight: 'bold', fontSize: 14 }}>{staff.fullname}</Col>
            </Row>
            <Row
              style={{ width: '100%' }}
              gutter={10}
              className="work-schedule-report-to-print__content__staff-info__item"
            >
              <Col span={7} style={{ fontWeight: 'bold' }}>Ngày sinh</Col>
              <Col span={17}>{staff.dateOfBirth}</Col>
            </Row>
            <Row
              style={{ width: '100%' }}
              gutter={10}
              className="work-schedule-report-to-print__content__staff-info__item"
            >
              <Col span={7} style={{ fontWeight: 'bold' }}>Chức vụ</Col>
              <Col span={17}>{USER_ROLES[staff.role].name}</Col>
            </Row>
          </div>

          <div className="work-schedule-report-to-print__content__work-schedule">
            <h3>Ca được phân công</h3>

            <Table
              bordered
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              className="work-schedule-report-to-print__content__work-schedule__table"
            />

          </div>

          <Row justify="center" align="middle"
            className="work-schedule-report-to-print__content__manager-confirm">
            <Col span={14}></Col>
            <Col span={10} align="middle">
              <span className="work-schedule-report-to-print__content__manager-confirm__stand-for">TM. Người quản lý</span>
              <div className="work-schedule-report-to-print__content__manager-confirm__signature">
                <img src="https://files.slack.com/files-pri/THXMMTH2T-F0110T0NABG/signature__1_.png" alt="signature" />
              </div>
              <span className="work-schedule-report-to-print__content__manager-confirm__fullname">{manager.fullname}</span>
            </Col>
          </Row>

        </div>
      </div>
    )
  }
}
export default withCookies(WorkScheduleReportToPrint);