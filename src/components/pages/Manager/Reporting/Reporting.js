import React from 'react';
import { Row, Col, message } from 'antd';
import './Reporting.style.scss';
import WorkScheduleReport from './WorkScheduleReport/WorkScheduleReport';
import REPORTS from '../../../../constants/report.constant';
import PageBase from '../../../utilities/PageBase/PageBase';
import { connect } from 'react-redux';
import * as actions from '../../../../redux/actions';
import { withCookies } from 'react-cookie';
import { API } from '../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';

const reportBasicInfos = [
  {
    title: REPORTS.WORK_SCHEDULE.title,
    type: REPORTS.WORK_SCHEDULE.type,
    cover: 'https://image.freepik.com/free-vector/flat-design-characters-doing-time-management_23-2148274068.jpg',
    description: 'Báo cáo lịch làm việc trong tuần của một nhân viên.'
  },
  {
    title: REPORTS.SELLING.title,
    type: REPORTS.SELLING.type,
    cover: 'https://www.wisertechsolutions.ca/wp-content/uploads/2019/05/ecom2.png',
    description: 'Thống kê lượng sản phẩm đã bán ra và đang tồn kho trong tháng của siêu thị.'
  },
  {
    title: REPORTS.PAYMENT_REVENUE.title,
    type: REPORTS.PAYMENT_REVENUE.type,
    cover: 'https://intuitionsoftech.com.au/wp-content/uploads/2019/09/it-home.png',
    description: 'Báo cáo, thống kê thu chi trong tháng của siêu thị.'
  }
]

class Reporting extends PageBase {

  constructor(props) {
    super(props);

    this.state = {
      staffs: []
    }
  }

  componentDidMount() {
    this.loadStaffs();
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

    this.props.setAppLoading(false);
    if (res.status !== 200) {
      message.error(res.errors[0]);
      return;
    }

    this.setState({ staffs: res.data.users });
  }

  render() {
    return (
      <div className="reporting animated fadeIn">
        <div className="reporting__menu">
          <Row justify="center" align="middle" gutter={[70, 70]} style={{ width: '100%' }}>
            <Col span={8}>
              <WorkScheduleReport
                staffs={this.state.staffs}
                basicInfo={reportBasicInfos[0]}
                index={0} />
            </Col>
            <Col span={8}>
              <WorkScheduleReport
                staffs={this.state.staffs}
                basicInfo={reportBasicInfos[1]}
                index={1} />
            </Col>
            <Col span={8}>
              <WorkScheduleReport
                staffs={this.state.staffs}
                basicInfo={reportBasicInfos[2]}
                index={2} />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
export default connect(null, actions)(withCookies(Reporting));