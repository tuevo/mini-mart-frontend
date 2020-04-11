import React, { Component } from 'react';
import { Card, Modal, Avatar, Input, Radio, Row, Col, Empty, Button } from 'antd';
import { SearchOutlined, PrinterFilled } from '@ant-design/icons';
import { withCookies } from 'react-cookie';
import './WorkScheduleReport.style.scss';
import USER_ROLES from '../../../../../constants/user-role.constant';
import WorkScheduleReportToPrint from './WorkScheduleReportToPrint/WorkScheduleReportToPrint';
import ReactToPrint from 'react-to-print';

const { Meta } = Card;

class WorkScheduleReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      filteredStaffs: [],
      searchText: '',
      selectedStaff: null
    }
  }

  setDialogVisible(isVisible) {
    if (isVisible) {
      let { filteredStaffs } = this.state;
      filteredStaffs = [...this.props.staffs];

      this.setState({
        filteredStaffs,
        selectedStaff: filteredStaffs.length > 0 ? filteredStaffs[0]._id : null
      });
    } else {
      this.setState({
        searchText: '',
        selectedStaff: null
      });
    }

    this.setState({ isVisible });
  }

  onSelectStaff(staffID) {
    this.setState({ selectedStaff: staffID });
  }

  onSearchInputChange(text) {
    this.setState({ searchText: text });

    const { staffs } = this.props;
    let { filteredStaffs } = this.state;

    if (!text) {
      filteredStaffs = [...staffs];
    } else {
      filteredStaffs = (staffs.filter(s => s.fullname.toLowerCase().includes(text.toLowerCase()))) || [];
    }

    this.setState({
      filteredStaffs,
      selectedStaff: filteredStaffs.length > 0 ? filteredStaffs[0]._id : null
    });
  }

  render() {
    const { basicInfo, index } = this.props;
    let { filteredStaffs, selectedStaff } = this.state;

    return (
      <div>
        <Card
          className={`reporting__menu__item`}
          style={{ width: '100%', animationDuration: `${0.5 * (index + 1)}s` }}
          cover={
            <img
              alt="example"
              src={basicInfo.cover}
            />
          }
          onClick={() => this.setDialogVisible(true)}
        >
          <Meta
            title={basicInfo.title}
            description={basicInfo.description}
          />
        </Card>

        <Modal
          className="reporting__work-schedule-report__content"
          title={<span style={{ color: '#ff8220', fontWeight: 'bold' }}>{basicInfo.title}</span>}
          visible={this.state.isVisible}
          onCancel={() => this.setDialogVisible(false)}
          cancelButtonProps={{ style: { display: 'none' } }}
          okButtonProps={{ style: { display: 'none' } }}
        >
          <Row gutter={20}>
            <Col span={9}>
              <div className="reporting__work-schedule-report">
                <div className="reporting__work-schedule-report__list-staffs">

                  <span className="reporting__work-schedule-report__list-staffs__label">
                    Lựa chọn nhân viên:
                  </span>

                  <Input
                    defaultValue={this.state.searchText}
                    prefix={<SearchOutlined style={{ marginRight: 5 }} />}
                    placeholder="Tìm kiếm nhân viên..."
                    onChange={e => this.onSearchInputChange(e.target.value)}
                    autoFocus={true}
                  />

                  <div className="reporting__work-schedule-report__list-staffs__wrapper">
                    {filteredStaffs.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : <></>}
                    <Radio.Group
                      style={{ width: '100%' }}
                      onChange={e => this.onSelectStaff(e.target.value)}
                      defaultValue={selectedStaff}
                    >

                      {filteredStaffs.map(staff => (
                        <Radio.Button
                          key={staff._id}
                          value={staff._id}
                          className={`
                        reporting__work-schedule-report__list-staffs__staff 
                        ${staff._id === selectedStaff ? 'reporting__work-schedule-report__list-staffs__staff--selected' : ''} 
                      `}>
                          <Row>
                            <Col span={2}>
                              <div className="reporting__work-schedule-report__list-staffs__staff__avatar">
                                <Avatar size={30} src={staff.avatar} /></div>
                            </Col>
                            <Col span={22}>
                              <div className="reporting__work-schedule-report__list-staffs__staff__info">
                                <div className="reporting__work-schedule-report__list-staffs__staff__info__name">
                                  <span>{staff.fullname}</span>
                                </div>

                                <div className="reporting__work-schedule-report__list-staffs__staff__info__role">
                                  <span>{USER_ROLES[staff.role].name}</span>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                </div>
              </div>

              <ReactToPrint
                trigger={() => (
                  <div className="reporting__work-schedule-report__content__btn-print">
                    <Button type="primary" disabled={!selectedStaff}>
                      <PrinterFilled />
                      In lịch làm việc
                    </Button>
                  </div>
                )}
                content={() => this.componentToPrintRef}
              />

            </Col>

            <Col span={15} className="reporting__work-schedule-report__content__print-preview">
              <div className="reporting__work-schedule-report__content__print-preview__wrapper">
                <WorkScheduleReportToPrint
                  ref={el => (this.componentToPrintRef = el)}
                  staff={selectedStaff ? filteredStaffs.find(s => s._id === selectedStaff) : null}
                  basicInfo={basicInfo}
                />
              </div>
            </Col>

          </Row>

        </Modal>

      </div>
    )
  }
}

export default withCookies(WorkScheduleReport);