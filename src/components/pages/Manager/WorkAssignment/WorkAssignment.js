import React from 'react';
import { Row, Col, Tabs, Select, List, Avatar, Button, Modal, message, Tooltip, Skeleton, Empty } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import USER_ROLE from '../../../../constants/user-role.constant';
import './WorkAssignment.style.scss';
import * as moment from 'moment';
import * as _ from 'lodash';
import WEEK_DAY from '../../../../constants/week-day.constant';
import { withCookies } from 'react-cookie';
import { connect } from 'react-redux';
import * as actions from '../../../../redux/actions';
import { API } from '../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import PageBase from '../../../utilities/PageBase/PageBase';
import BtnAddWorkSchedule from './BtnAddWorkSchedule/BtnAddWorkSchedule';
import BtnAddWorkShift from './BtnAddWorkShift/BtnAddWorkShift';
import BtnAddWorkShiftAssigner from './BtnAddWorkShiftAssigner/BtnAddWorkShiftAssigner';

const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;

class WorkAssignment extends PageBase {
  constructor(props) {
    super(props);
    this.state = {
      selectedWorkSchedule: {
        index: 0,
        workDays: []
      },
      selectedWorkDay: {},
      selectedWorkShift: {},
      selectedWorkYear: null,
      workSchedules: [],
      listWorkYears: [],
      listStaffs: []
    }
  }

  componentDidMount() {
    this.loadStaffs();
    this.loadWorkSchedules(null);
  }

  loadStaffs = async () => {
    this.props.setAppLoading(true);
    const res = await (
      await fetch(
        API.Manager.StaffManagement.getListStaffs,
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
      this.setState({ listStaffs: users });
    } else {
      message.error(res.errors[0]);
    }

    this.props.setAppLoading(false);
  }

  refreshAllCurrenStates() {
    this.setState({
      selectedWorkSchedule: {
        index: 0,
        workDays: []
      },
      selectedWorkDay: {},
      selectedWorkShift: {},
      selectedWorkYear: null,
      workSchedules: [],
      listWorkYears: []
    });
  }

  loadWorkSchedules = async (workYear) => {
    this.props.setAppLoading(true);
    this.refreshAllCurrenStates();

    let url = API.Manager.WorkSchedule.getWorkSchedules;
    if (workYear) {
      url += `?year=${workYear}`;
    }

    const res = await (
      await fetch(url, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'token': this.props.cookies.get(COOKIE_NAMES.token)
        },
        signal: this.abortController.signal
      })
    ).json();

    this.props.setAppLoading(false);
    const { workSchedules, availableYears } = res.data
    const listWorkYears = availableYears.map(y => ({ text: 'Năm ' + y, value: y }));
    let { selectedWorkSchedule } = this.state;
    selectedWorkSchedule = { ...selectedWorkSchedule, ...workSchedules[0] };

    this.setState({
      selectedWorkSchedule,
      workSchedules,
      listWorkYears,
      selectedWorkYear: workYear || listWorkYears[0].value
    });

    let isWorkShiftFound = false;
    for (let i = 0; i < selectedWorkSchedule.workDays.length; i++) {
      for (let j = 0; j < selectedWorkSchedule.workDays[i].length; j++) {
        if (selectedWorkSchedule.workDays[i][j].staffs.length > 0) {
          let { selectedWorkShift } = this.state;
          const selectedWorkDay = selectedWorkSchedule.workDays[i][j];

          selectedWorkShift = selectedWorkDay.workShifts[0];
          selectedWorkShift.index = 0;
          isWorkShiftFound = true;

          this.setState({
            selectedWorkDay,
            selectedWorkShift
          });

          break;
        }
      }
    }

    if (!isWorkShiftFound) {
      const selectedWorkDay = selectedWorkSchedule.workDays[0][0];

      let selectedWorkShift = selectedWorkDay.workShifts[0];
      if (selectedWorkShift) {
        selectedWorkShift.index = 0;
      } else {
        selectedWorkShift = { index: 0 }
      }

      this.setState({
        selectedWorkDay,
        selectedWorkShift
      })
    }
  }

  reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift) {
    this.setState({
      workSchedules,
      selectedWorkSchedule,
      selectedWorkDay,
      selectedWorkShift
    })
  }

  toggleTaskWorkDayPanel() {
    const { isTaskWorkDayPanelShown } = this.state;
    this.setState({ isTaskWorkDayPanelShown: !isTaskWorkDayPanelShown });
  }

  filterWorkShiftsByDay(workShifts, day) {
    return workShifts.filter(ws => {
      const wsDay = new Date(ws.startTime).getDate();
      return day === wsDay;
    });
  }

  generateWorkDays(workSchedule) {
    const { month, year, workShifts } = workSchedule;
    const workDaysLength = moment(`${month}-${year}`, 'M-YYYY').daysInMonth();
    let workDays = [];
    let temp = [];
    let assigners = [];

    for (let i = 1; i <= workDaysLength; i++) {
      assigners.length = 0;
      assigners = [];

      const filteredWorkShifts = this.filterWorkShiftsByDay(workShifts, i);
      for (const ws of filteredWorkShifts) {
        for (const wa of ws.workAssignments)
          assigners.push(wa.assigner);
      }

      assigners = _.uniqBy(assigners, a => a._id);
      temp.push({
        workWeekDay: this.getWeekDay(i, month, year),
        workDayInMonth: i,
        workMonth: month,
        workYear: year,
        staffs: [...assigners],
        workShifts: [...filteredWorkShifts]
      });

      if (i % 7 === 0) {
        workDays.push([...temp]);
        temp.length = 0;
      }
    }

    temp.length = 0;
    temp = [];

    for (let i = 29; i <= workDaysLength; i++) {
      assigners = [];

      const filteredWorkShifts = this.filterWorkShiftsByDay(workShifts, i);
      for (const ws of filteredWorkShifts) {
        for (const wa of ws.workAssignments)
          assigners.push(wa.assigner);
      }

      assigners = _.uniqBy(assigners, a => a._id);
      temp.push({
        workWeekDay: this.getWeekDay(i, month, year),
        workDayInMonth: i,
        workMonth: month,
        workYear: year,
        staffs: [...assigners],
        workShifts: [...filteredWorkShifts]
      });
    }
    workDays.push([...temp]);

    return workDays;
  }

  getWeekDay(day, month, year) {
    const weekDayNumber = moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').day();
    switch (weekDayNumber) {
      case 1: return WEEK_DAY.MONDAY;
      case 2: return WEEK_DAY.TUESDAY;
      case 3: return WEEK_DAY.WEDNESDAY;
      case 4: return WEEK_DAY.THURSDAY;
      case 5: return WEEK_DAY.FRIDAY;
      case 6: return WEEK_DAY.SATURDAY;
      case 0: return WEEK_DAY.SUNDAY;
      default: return null
    }
  }

  handleSelectWorkSchedule(selectedWorkSchedule, index) {
    selectedWorkSchedule.index = index;
    selectedWorkSchedule.workDays = this.generateWorkDays(selectedWorkSchedule);

    let isWorkShiftFound = false;
    for (let i = 0; i < selectedWorkSchedule.workDays.length; i++) {
      for (let j = 0; j < selectedWorkSchedule.workDays[i].length; j++) {
        if (selectedWorkSchedule.workDays[i][j].staffs.length > 0) {
          let { selectedWorkShift } = this.state;
          const selectedWorkDay = selectedWorkSchedule.workDays[i][j];

          selectedWorkShift = selectedWorkDay.workShifts[0];
          selectedWorkShift.index = 0;
          isWorkShiftFound = true;

          this.setState({
            selectedWorkDay,
            selectedWorkShift
          });

          break;
        }
      }
    }

    if (!isWorkShiftFound) {
      const selectedWorkDay = selectedWorkSchedule.workDays[0][0];

      let selectedWorkShift = selectedWorkDay.workShifts[0];
      if (selectedWorkShift) {
        selectedWorkShift.index = 0;
      } else {
        selectedWorkShift = { index: 0 }
      }

      this.setState({
        selectedWorkDay,
        selectedWorkShift
      })
    }

    this.setState({ selectedWorkSchedule });
  }

  handleSelectWorkDay(row, col) {
    const { selectedWorkSchedule } = this.state;
    let { selectedWorkShift } = this.state;
    const selectedWorkDay = selectedWorkSchedule.workDays[row][col];

    if (selectedWorkDay.workShifts.length > 0) {
      selectedWorkShift = selectedWorkDay.workShifts[0];
      selectedWorkShift.index = 0;
    } else {
      selectedWorkShift = {}
    }

    this.setState({
      selectedWorkDay,
      selectedWorkShift
    });
  }

  handleSelectWorkShift(workShift, index) {
    workShift.index = index;
    this.setState({ selectedWorkShift: workShift });
  }

  openRemoveWorkShiftConfirm(workShiftID) {
    const that = this;
    confirm({
      title: 'Bạn có muốn hủy ca làm việc này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Ca làm việc chỉ có thể hủy khi không còn nhân viên nào được phân công.',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      async onOk() {
        that.props.setAppLoading(true);
        const res = await (
          await fetch(
            API.Manager.WorkShift.removeWorkShift.replace('{workShiftID}', workShiftID),
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

        if (res.status !== 200) {
          that.props.setAppLoading(false);
          message.error(res.errors[0]);
          return;
        }

        let { selectedWorkShift, selectedWorkDay, selectedWorkSchedule, workSchedules } = that.state;

        selectedWorkDay.workShifts = selectedWorkDay.workShifts.filter(ws => ws._id !== workShiftID);
        if (selectedWorkDay.workShifts.length > 0) {
          selectedWorkShift = selectedWorkDay.workShifts[0];
          selectedWorkShift.index = 0;
        } else {
          selectedWorkShift = { index: 0 }
        }

        for (const week of selectedWorkSchedule.workDays) {
          for (let day of week) {
            if (day.workDayInMonth === selectedWorkDay.workDayInMonth) {
              day = selectedWorkDay;
              break;
            }
          }
        }
        selectedWorkSchedule.workShifts = selectedWorkSchedule.workShifts.filter(ws => ws._id !== workShiftID);

        for (let i = 0; i < workSchedules.length; i++) {
          if (workSchedules[i]._id === selectedWorkSchedule._id) {
            workSchedules[i] = selectedWorkSchedule;
            break;
          }
        }

        that.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift);
        message.success(res.messages[0]);
        that.props.setAppLoading(false);
      },
      onCancel() { },
    });
  }

  openRemoveWorkScheduleConfirm(workScheduleID) {
    const that = this;
    confirm({
      title: 'Bạn có muốn hủy lịch làm việc này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Lịch làm việc chỉ có thể hủy khi tất cả các ngày trong tháng đều chưa có ca làm việc.',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      async onOk() {
        that.props.setAppLoading(true);
        const res = await (
          await fetch(
            API.Manager.WorkSchedule.removeWorkSchedule.replace('{workScheduleID}', workScheduleID),
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

        if (res.status !== 200) {
          that.props.setAppLoading(false);
          message.error(res.errors[0]);
          return;
        }

        let {
          workSchedules,
          selectedWorkSchedule,
          selectedWorkDay,
          selectedWorkShift
        } = that.state;

        workSchedules = workSchedules.filter(wsc => wsc._id !== workScheduleID);

        if (workSchedules.length === 0) {
          let { listWorkYears, selectedWorkYear } = that.state;
          listWorkYears = listWorkYears.filter(y => y !== selectedWorkYear);
          that.loadWorkSchedules(listWorkYears[0].value);
          message.success(res.messages[0]);
          return;
        }

        workSchedules.sort((a, b) => a.month - b.month);

        selectedWorkSchedule = workSchedules[0];
        selectedWorkSchedule.index = 0;
        selectedWorkSchedule.workDays = that.generateWorkDays(selectedWorkSchedule);

        let isWorkShiftFound = false;
        for (let i = 0; i < selectedWorkSchedule.workDays.length; i++) {
          for (let j = 0; j < selectedWorkSchedule.workDays[i].length; j++) {
            if (selectedWorkSchedule.workDays[i][j].staffs.length > 0) {
              selectedWorkDay = selectedWorkSchedule.workDays[i][j];
              selectedWorkShift = selectedWorkDay.workShifts[0];
              selectedWorkShift.index = 0;
              isWorkShiftFound = true;
              break;
            }
          }
        }

        if (!isWorkShiftFound) {
          selectedWorkDay = selectedWorkSchedule.workDays[0][0];
          let selectedWorkShift = selectedWorkDay.workShifts[0];
          if (selectedWorkShift) {
            selectedWorkShift.index = 0;
          } else {
            selectedWorkShift = { index: 0 }
          }
        }

        that.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift);
        message.success(res.messages[0]);
        that.props.setAppLoading(false);
      },
      onCancel() { },
    });
  }

  openRemoveWorkShiftAssignerConfirm(assinger) {
    const that = this;
    confirm({
      title: `Bạn có muốn hủy phân công ${assinger.fullname} trong ca làm việc này?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Không, cảm ơn',
      async onOk() {
        that.props.setAppLoading(true);
        const { selectedWorkShift, selectedWorkDay, selectedWorkSchedule, workSchedules } = that.state;
        const { workAssignments } = selectedWorkShift;
        const workAssignment = workAssignments.find(wa => wa.assigner._id === assinger._id);
        const workAssignmentID = workAssignment._id;

        const res = await (
          await fetch(
            API.Manager.WorkAssignment.removeWorkAssignment.replace('{workAssignmentID}', workAssignmentID),
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

        if (res.status !== 200) {
          that.props.setAppLoading(false);
          message.error(res.errors[0]);
          return;
        }

        selectedWorkShift.workAssignments = selectedWorkShift.workAssignments.filter(wa => wa._id !== workAssignmentID);

        for (let ws of selectedWorkDay.workShifts) {
          if (ws._id === selectedWorkShift._id) {
            ws.workAssignments = selectedWorkShift.workAssignments;
            break;
          }
        }

        for (const week of selectedWorkSchedule.workDays) {
          for (let day of week) {
            if (day.workDayInMonth === selectedWorkDay.workDayInMonth) {
              day = selectedWorkDay;
              break;
            }
          }
        }

        for (let wsc of workSchedules) {
          if (wsc._id === selectedWorkSchedule._id) {
            wsc = selectedWorkSchedule;
            break;
          }
        }

        that.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift);
        message.success(res.messages[0]);
        that.props.setAppLoading(false);
      },
      onCancel() { },
    });
  }

  handleSelectYear(year) {
    this.setState({ selectedWorkYear: year });
    this.loadWorkSchedules(year);
  }

  render() {
    let {
      workSchedules,
      selectedWorkSchedule,
      selectedWorkDay,
      selectedWorkShift,
      listWorkYears,
      selectedWorkYear,
      listStaffs
    } = this.state;

    selectedWorkSchedule.workDays = this.generateWorkDays(selectedWorkSchedule);

    return (
      <div className="work-assignment animated fadeIn">
        <Row>
          <Col className="work-assignment__left-sidebar" span={4}>
            <BtnAddWorkSchedule reloadWorkSchedules={selectedYear => this.loadWorkSchedules(selectedYear)} />

            <div className="work-assignment__left-sidebar__year-selection">
              <div className="work-assignment__left-sidebar__title">
                <span>Năm làm việc</span>
              </div>
              <div style={{ minHeight: 37 }}>
                {
                  (listWorkYears || []).length > 0 ? (
                    <Select
                      className="animated fadeIn"
                      defaultValue={selectedWorkYear}
                      onChange={e => this.handleSelectYear(e)}>
                      {listWorkYears.map((y, i) => (
                        <Option key={i} value={y.value}>{y.text}</Option>
                      ))}
                    </Select>
                  ) : (
                      <Skeleton.Input
                        style={{ width: '100%', height: 30, borderRadius: 3, background: 'rgba(0,0,0,0.15)' }}
                        active={true} size="small"
                      />
                    )
                }
              </div>
            </div>

            <div className="work-assignment__left-sidebar__list-tasks">

              <div className="work-assignment__left-sidebar__title">
                <span>Tháng làm việc</span>
              </div>

              <div className="work-assignment__left-sidebar__list-tasks__wrapper">
                <List
                  locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" /> }}
                  size="small"
                  dataSource={workSchedules}
                  renderItem={(item, index) => {
                    return (
                      <List.Item
                        className={
                          `work-assignment__left-sidebar__list-tasks__item animated fadeIn
                          ${index === selectedWorkSchedule.index ? 'work-assignment__left-sidebar__list-tasks__item--selected' : ''}`
                        }
                        onClick={() => this.handleSelectWorkSchedule(item, index)}>
                        <Row style={{ width: '90%' }}>
                          <Col span={22}>
                            <span className="work-assignment__left-sidebar__list-tasks__item__task-name">Tháng {item.month}</span>
                          </Col>
                          <Col span={2}>
                            <Button
                              onClick={() => this.openRemoveWorkScheduleConfirm(item._id)}
                              className="work-assignment__left-sidebar__list-tasks__item__btn-remove"
                              type="link"
                              icon={<CloseCircleOutlined />} />
                          </Col>
                        </Row>
                      </List.Item>
                    )
                  }}
                />
              </div>
            </div>
          </Col>
          <Col className="work-assignment__content" span={20}>
            <div className="work-assignment__content__task-work-day-panel">
              <div className="work-assignment__content__task-work-day-panel__panel">

                <div className="work-assignment__content__task-work-day-panel__panel__main">
                  <h3>{
                    `${selectedWorkDay.workWeekDay ? selectedWorkDay.workWeekDay + ', ' : ''} ${selectedWorkDay.workYear ? moment(new Date(selectedWorkDay.workYear, selectedWorkDay.workMonth - 1, selectedWorkDay.workDayInMonth)).format('DD/MM/YYYY') : ''}`
                  }</h3>

                  <div
                    className="work-assignment__content__task-work-day-panel__panel__main__list-staffs work-assignment__content__task-work-day-panel__panel__main__list-work-shifts">
                    <Row>
                      <Col span={21}>
                        <span className="work-assignment__content__task-work-day-panel__panel__main__title">
                          Ca làm việc trong ngày</span>
                      </Col>
                      <Col span={3}>
                        <BtnAddWorkShift
                          workSchedules={[...workSchedules]}
                          selectedWorkSchedule={{ ...selectedWorkSchedule }}
                          selectedWorkDay={{ ...selectedWorkDay }}
                          selectedWorkShift={{ ...selectedWorkShift }}
                          reloadWorkSchedules={
                            (workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift) => {
                              this.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift)
                            }
                          }
                        />
                      </Col>
                    </Row>
                    <div className="work-assignment__content__task-work-day-panel__panel__main__list-work-shifts__wrapper">
                      <List
                        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" /> }}
                        itemLayout="horizontal"
                        dataSource={selectedWorkDay.workShifts}
                        renderItem={(ws, index) => (
                          <List.Item onClick={() => this.handleSelectWorkShift(ws, index)}>
                            <Row
                              className={`
                                animated fadeIn
                                ${index === selectedWorkShift.index ?
                                  'work-assignment__content__task-work-day-panel__panel__main__list-work-shifts__item--selected'
                                  : 'work-assignment__content__task-work-day-panel__panel__main__list-work-shifts__item'}`}
                            >
                              <Col span={22}>
                                <span>
                                  Từ {moment(ws.startTime).format('HH:mm')} đến {moment(ws.endTime).format('HH:mm')}
                                </span>
                              </Col>
                              <Col span={2}>
                                <Button
                                  className="work-assignment__content__task-work-day-panel__panel__main__list-staffs__btn-close"
                                  type="link"
                                  onClick={() => this.openRemoveWorkShiftConfirm(ws._id)}
                                  icon={<CloseCircleOutlined />} />
                              </Col>
                            </Row>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>

                  <div className="work-assignment__content__task-work-day-panel__panel__main__list-work-shifts__details">
                    <h3>Chi tiết ca làm việc</h3>
                    <Row>
                      <Col span={8}>
                        <ul
                          className="work-assignment__content__task-work-day-panel__panel__main__list-work-shifts__time--label">
                          <li>Bắt đầu</li>
                          <li>Kết thúc</li>
                        </ul>
                      </Col>
                      <Col span={16}>
                        <ul
                          className="work-assignment__content__task-work-day-panel__panel__main__list-work-shifts__time--value">
                          <li>{
                            selectedWorkShift.startTime ? moment(selectedWorkShift.startTime).format('HH:mm') : ''
                          }</li>
                          <li>{
                            selectedWorkShift.endTime ? moment(selectedWorkShift.endTime).format('HH:mm') : ''
                          }</li>
                        </ul>
                      </Col>
                    </Row>
                    <div className="work-assignment__content__task-work-day-panel__panel__main__list-staffs">
                      <Row>
                        <Col span={21}>
                          <span className="work-assignment__content__task-work-day-panel__panel__main__title">
                            Nhân viên phụ trách ({
                              selectedWorkShift.workAssignments ? selectedWorkShift.workAssignments.length : 0
                            })</span>
                        </Col>
                        <Col span={3}>
                          <BtnAddWorkShiftAssigner
                            workSchedules={[...workSchedules]}
                            selectedWorkSchedule={{ ...selectedWorkSchedule }}
                            selectedWorkDay={{ ...selectedWorkDay }}
                            selectedWorkShift={{ ...selectedWorkShift }}
                            staffs={listStaffs.filter(
                              s => !(selectedWorkShift.workAssignments || []).find(wa => wa.assigner._id === s._id) && s.role !== USER_ROLE.MANAGER.type)
                            }
                            reloadWorkSchedules={
                              (workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift) => {
                                this.reloadWorkSchedules(workSchedules, selectedWorkSchedule, selectedWorkDay, selectedWorkShift)
                              }
                            }
                          />
                        </Col>
                      </Row>

                      <div className="work-assignment__content__task-work-day-panel__panel__main__list-staffs__wrapper">
                        <List
                          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" /> }}
                          itemLayout="horizontal"
                          dataSource={selectedWorkShift.workAssignments}
                          renderItem={wa => (
                            <List.Item>
                              <div className="work-assignment__content__task-work-day-panel__panel__main__list-staffs__staff animated fadeIn">
                                <Row style={{ width: '100%' }}>
                                  <Col span={22}>
                                    <List.Item.Meta
                                      avatar={<Avatar src={wa.assigner.avatar} />}
                                      title={<span>{wa.assigner.fullname}</span>}
                                      description={USER_ROLE[wa.assigner.role].name}
                                    />
                                  </Col>
                                  <Col span={2}>
                                    <Tooltip placement="bottom" title="Hủy phân công">
                                      <Button
                                        className="work-assignment__content__task-work-day-panel__panel__main__list-staffs__btn-unassign"
                                        type="link"
                                        icon={<LogoutOutlined />}
                                        onClick={() => this.openRemoveWorkShiftAssignerConfirm(wa.assigner)}
                                      />
                                    </Tooltip>
                                  </Col>
                                </Row>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="work-assignment__content__header">
              <div className="work-assignment__content__header__dark-bg"></div>
              <div className="work-assignment__content__header__task-name">
                <h3>Tháng {selectedWorkSchedule.month} năm {selectedWorkSchedule.year}</h3>
              </div>
            </div>
            <div className="work-assignment__content__body">
              <Tabs
                defaultActiveKey="1"
                tabBarGutter={50}
                className="work-assignment__content__body__tabs"
                onChange={e => console.log(e)}>
                <TabPane tab="Lịch làm việc" key="1" className="work-assignment__content__body__tabs__work-schedule">
                  {selectedWorkSchedule.workDays.map((row, iRow) => (
                    <Row key={iRow + 1}>
                      {row.map((col, iCol) => (
                        <Col key={`${iRow + 1}_${iCol}`} span={2}
                          className={`
                            animated fadeIn
                            work-assignment__content__body__tabs__work-schedule__work-day 
                            ${col.workDayInMonth === selectedWorkDay.workDayInMonth ?
                              'work-assignment__content__body__tabs__work-schedule__work-day--selected' : ''
                            }
                          `}
                          onClick={() => this.handleSelectWorkDay(iRow, iCol)}>
                          <span
                            className={`
                              work-assignment__content__body__tabs__work-schedule__work-day__day-in-month
                              ${col.workWeekDay === WEEK_DAY.SUNDAY ? 'work-assignment__content__body__tabs__work-schedule__work-day__day-in-month--sunday' : ''}
                            `}>{col.workDayInMonth}</span>
                          <span
                            className={`
                              work-assignment__content__body__tabs__work-schedule__work-day__week-day
                              ${col.workWeekDay === WEEK_DAY.SUNDAY ? 'work-assignment__content__body__tabs__work-schedule__work-day__week-day--sunday' : ''}
                            `}>{col.workWeekDay}</span>
                          <div className="work-assignment__content__body__tabs__work-schedule__work-day__staffs">
                            {col.staffs.slice(0, 2).map(staff => (
                              <Tooltip
                                key={staff._id}
                                placement="bottom"
                                title={staff.fullname}
                              >
                                <Avatar
                                  key={staff._id}
                                  size={16}
                                  className="work-assignment__content__body__tabs__work-schedule__work-day__staffs__avatar"
                                  src={staff.avatar} />
                              </Tooltip>
                            ))}
                            {col.staffs.length > 2 ? (
                              <Tooltip
                                placement="bottom"
                                title={col.staffs.slice(2).map(staff => (
                                  <Row gutter={7} key={staff._id}>
                                    <Col><Avatar
                                      style={{ marginTop: -3 }}
                                      key={staff._id}
                                      size={16}
                                      src={staff.avatar} /></Col>
                                    <Col><span>{staff.fullname}</span></Col>
                                  </Row>
                                ))}
                              >
                                <div className="work-assignment__content__body__tabs__work-schedule__work-day__staffs__avatar--plus">
                                  <span>+{col.staffs.slice(2).length}</span>
                                </div>
                              </Tooltip>
                            ) : <></>}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ))}
                </TabPane>
              </Tabs>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(WorkAssignment));
