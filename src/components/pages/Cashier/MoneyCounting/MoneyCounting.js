import React from 'react';
import './MoneyCounting.style.scss';
import PageBase from '../../../utilities/PageBase/PageBase';
import { withCookies } from 'react-cookie';
import QrReader from 'react-qr-reader';
import { Row, Col, Empty, notification, Button, Tooltip, Table, Modal, message } from 'antd';
import { ReloadOutlined, ShoppingCartOutlined, QuestionCircleOutlined, ArrowLeftOutlined, ExclamationCircleOutlined, DeleteFilled, CheckCircleOutlined } from '@ant-design/icons';
import NumberFormat from 'react-number-format';
import checkoutSound from '../../../../assets/sounds/cashing.wav';
import rejectingSound from '../../../../assets/sounds/rejecting.wav';
import warningSound from '../../../../assets/sounds/warning.wav';
import { connect } from 'react-redux';
import * as actions from '../../../../redux/actions';
import { API } from '../../../../constants/api.constant';
import { COOKIE_NAMES } from '../../../../constants/cookie-name.constant';
import SubmitCheckoutSessionDialog from './SubmitCheckoutSessionDialog/SubmitCheckoutSessionDialog';
import * as _ from 'lodash';
import ImportingRequestDialog from './ImportingRequestDialog/ImportingRequestDialog';

const { confirm } = Modal;

class MoneyCounting extends PageBase {
	constructor(props) {
		super(props);
		this.state = {
			scannedProduct: {},
			availableProducts: [],
			checkedOutProducts: [],
			priceTotal: 0,
			onWorking: false,
			sound: '',
			checkoutSessionID: '',
			isCheckoutDoneScreenVisible: false,
			lackingItems: [],
			isLackingItemsDialogVisible: false
		}
		this.soundRef = React.createRef();
	}

	clearAllStates() {
		this.setState({
			scannedProduct: {},
			checkedOutProducts: [],
			priceTotal: 0,
			onWorking: false,
			sound: '',
			checkoutSessionID: '',
			isCheckoutDoneScreenVisible: false
		});
	}

	async createCheckoutSession() {
		this.props.setAppLoading(true);
		const res = await (
			await fetch(
				API.Cashier.Checkout.createCheckoutSession,
				{
					method: 'POST',
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

		const { _id } = res.data.checkoutSession;
		const { availableProducts } = res.data;
		message.success(res.messages[0]);

		this.setOnWorking(true);
		this.props.setCheckoutPanelCheckoutSessionID(_id);
		this.setState({
			checkoutSessionID: _id,
			availableProducts
		});
	}

	async cancelCheckoutSession() {
		this.props.setAppLoading(true);
		const res = await (
			await fetch(
				API.Cashier.Checkout.cancelCheckoutSession.replace('{checkoutSessionID}', this.state.checkoutSessionID),
				{
					method: 'DELETE',
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

		this.setOnWorking(false);
		message.success(res.messages[0]);
	}

	openNotification = (message, description, placement) => {
		notification.open({
			message,
			description,
			placement
		});
	};

	openNotExistedProductNotification() {
		notification['warning']({
			message: 'Cảnh báo',
			description: 'Sản phẩm này không có trong siêu thị'
		});
	}

	handleScan = data => {
		if (data) {
			const { availableProducts } = this.state;
			const productID = data;
			const index = _.findIndex(availableProducts, ap => ap._id === productID);
			if (index < 0) {
				this.playSound(warningSound);
				this.openNotExistedProductNotification();
				this.clearScannedProduct();
				return;
			}

			this.playSound(checkoutSound);
			const productDetails = { ...availableProducts[index] };
			this.openNotification(
				<span>
					<span style={{ color: '#44b543', fontWeight: 'bold', marginRight: 10 }}>+1</span>
					{productDetails.name}
				</span>,
				`Vừa xong`,
				'topRight'
			);

			let { checkedOutProducts, priceTotal } = this.state;
			checkedOutProducts.push({
				_id: productDetails._id,
				key: productDetails._id,
				order: checkedOutProducts.length + 1,
				name: productDetails.name,
				price: productDetails.price,
				category: productDetails.category.name,
				supplier: productDetails.supplier.name,
				image: productDetails.image
			});

			priceTotal = checkedOutProducts.reduce((pre, cur) => {
				return pre + cur.price;
			}, 0);

			this.setState({
				scannedProduct: { ...productDetails },
				checkedOutProducts,
				priceTotal
			});
		}
	}

	handleError = error => {
		if (error) {
			message.error(error);
		}
	}

	clearScannedProduct() {
		this.setState({ scannedProduct: {} });
	}

	playSound(sound) {
		this.soundRef.src = sound;
		this.soundRef.play();
	}

	setOnWorking(onWorking) {
		this.setState({ onWorking });
		this.props.setCheckoutPanelOnWorking(onWorking);
	}

	backToGettingStarted() {
		const that = this;
		confirm({
			title: `Đang thao tác, bạn có muốn rời khỏi?`,
			icon: <ExclamationCircleOutlined />,
			content: '',
			okText: 'Đồng ý',
			okType: 'danger',
			cancelText: 'Không, cảm ơn',
			onOk() {
				that.cancelCheckoutSession();
			}
		});
	}

	openRemoveCheckoutProductConfirm(product) {
		const that = this;
		confirm({
			title: `Bạn muốn loại bỏ 1 ${product.name}?`,
			icon: <ExclamationCircleOutlined />,
			content: '',
			okText: 'Đồng ý',
			okType: 'danger',
			cancelText: 'Không, cảm ơn',
			onOk() {
				let { checkedOutProducts, priceTotal } = that.state;
				checkedOutProducts = checkedOutProducts.filter(p => p.order !== product.order);
				checkedOutProducts.sort((a, b) => a.order - b.order);
				priceTotal -= product.price;

				if (product.order === that.state.scannedProduct.order || checkedOutProducts.length === 0)
					that.clearScannedProduct();

				that.setState({ checkedOutProducts, priceTotal });

				that.playSound(rejectingSound);
				that.openNotification(
					<span>
						<span style={{ color: 'crimson', fontWeight: 'bold', marginRight: 10 }}>-1</span>
						{product.name}
					</span>,
					`Vừa xong`,
					'topRight'
				);
			}
		});
	}

	setCheckoutDoneScreenVisible(isVisible) {
		this.setState({ isCheckoutDoneScreenVisible: isVisible });
	}

	continueToCheckout() {
		this.clearAllStates();
		this.createCheckoutSession();
		this.props.setMainPanelOnWorking(true);
	}

	loadLackingItems(lackingItems) {
		this.setState({ lackingItems });
	}

	setLackingItemsDialogVisible(isVisible) {
		this.setState({ isLackingItemsDialogVisible: isVisible });
	}

	render() {
		const { scannedProduct, checkedOutProducts, priceTotal, onWorking, lackingItems } = this.state;
		const isProductScanned = Object.keys(scannedProduct).length > 0;

		const columns = [
			{
				title: <center>STT</center>,
				dataIndex: 'order',
				key: 'order',
				width: 80,
				render: order => <center>{order}</center>
			},
			{
				title: 'Sản phẩm',
				dataIndex: 'name',
				key: 'name',
				width: 250,
				render: (text, record) => (
					<div className="money-counting__panel__right__shopping-cart__list-products__item">
						{record.image ? (<img src={record.image} alt="product" />) : (<QuestionCircleOutlined />)}
						<span className="money-counting__panel__right__shopping-cart__list-products__item__name">{text}</span>
					</div>
				)
			},
			{
				title: 'Giá bán',
				dataIndex: 'price',
				key: 'price',
				width: 150,
				render: (text) => (
					<NumberFormat
						value={Number(text)}
						displayType="text"
						thousandSeparator={true}
						suffix=" VNĐ"
						style={{ fontWeight: 'bold' }}
					/>
				)
			},
			{
				title: 'Danh mục',
				dataIndex: 'category',
				key: 'category',
				width: 150
			},
			{
				title: 'Nhà cung cấp',
				dataIndex: 'supplier',
				key: 'supplier',
				width: 150
			},
			{
				title: '',
				dataIndex: '',
				key: '',
				render: (value, record) => (
					<Button
						className="money-counting__panel__right__shopping-cart__list-products__btn-remove-item"
						shape="circle"
						icon={<DeleteFilled />}
						onClick={() => this.openRemoveCheckoutProductConfirm({ ...record })}
					/>
				)
			}
		];

		return (
			<div className="money-counting">
				{!onWorking ? (
					<div className="money-counting__getting-started animated fadeIn">
						<div className="money-counting__getting-started__content">
							<div className="money-counting__getting-started__content__left animated bounceInLeft">
								<h1 className="money-counting__getting-started__content__left__title">
									Tính tiền cho khách
								</h1>
								<Button
									type="submit"
									className="money-counting__getting-started__content__left__btn-start"
									onClick={() => this.createCheckoutSession()}
								>Bắt đầu tính tiền</Button>
							</div>
							<div className="money-counting__getting-started__content__right-cover">
								<div className="money-counting__getting-started__content__right-cover__img"></div>
							</div>
						</div>
						<div className="money-counting__getting-started__bottom-wave">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
								<path fill="url(#my-cool-gradient)" fillOpacity={1}
									d="M0,0L60,21.3C120,43,240,85,360,90.7C480,96,600,64,720,80C840,96,960,160,1080,197.3C1200,235,1320,245,1380,250.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
								/>
								<linearGradient id="my-cool-gradient" x2="1" y2="1">
									<stop offset="0%" stopColor="#ff5858" />
									<stop offset="100%" stopColor="#f09819" />
								</linearGradient>
							</svg>
						</div>
					</div>
				) : (
						<div style={{ height: '100%' }}>
							<ImportingRequestDialog
								lackingItems={[...lackingItems]}
								isVisible={this.state.isLackingItemsDialogVisible}
								setLackingItemsDialogVisible={isVisible => this.setLackingItemsDialogVisible(isVisible)}
							/>
							<audio ref={ref => { this.soundRef = ref; }} src="" controls autoPlay style={{ display: 'none' }} />
							<div className="money-counting__panel">
								{this.state.isCheckoutDoneScreenVisible ? (
									<div className="money-counting__panel__checkout-done">
										<h1 className="money-counting__panel__checkout-done__title">
											Phiên tính tiền đã hoàn tất
									</h1>
										<CheckCircleOutlined className="money-counting__panel__checkout-done__icon" />
										<Button
											className="money-counting__panel__checkout-done__btn-continue"
											onClick={() => this.continueToCheckout()}
										>
											Tiếp tục tính tiền
									</Button>
									</div>
								) : <></>}
								<Row>
									<Col span={6}>
										<div className="money-counting__panel__left">
											<div className="money-counting__panel__left__header">
												<Button
													shape="circle"
													icon={<ArrowLeftOutlined />}
													className="money-counting__panel__left__header__btn-back"
													onClick={() => this.backToGettingStarted()}
												/>
												<div className="money-counting__panel__left__header__company">
													<img className="money-counting__panel__left__header__company__logo" src={require('../../../../assets/images/app-logo.png')} alt="logo" />
													<div className="money-counting__panel__left__header__company__brand">
														<div className="money-counting__panel__left__header__company__brand__name"><span>Mini Mart</span></div>
														<div className="money-counting__panel__left__header__company__brand__slogan"><span>Tiện Lợi mà Chất Lượng</span></div>
													</div>
												</div>
											</div>
											<div className="money-counting__panel__left__product-scanning animated fadeIn">
												<QrReader
													delay={1500}
													onError={error => this.handleError(error)}
													onScan={data => this.handleScan(data)}
													className="money-counting__panel__left__product-scanning__scanner"
												/>
											</div>
											<div className="money-counting__panel__left__product-details">
												<Row align="middle">
													<Col span={21}>
														<span className="money-counting__panel__left__product-details__title">Thông tin checkout</span>
													</Col>
													<Col span={3} align="center">
														<Tooltip title="Làm sạch" placement="bottom">
															<Button
																shape="circle" icon={<ReloadOutlined />}
																className="money-counting__panel__left__product-details__btn-clear"
																onClick={() => this.clearScannedProduct()}
															/>
														</Tooltip>
													</Col>
												</Row>
												{isProductScanned ? (
													<Row gutter={20}>
														<Col span={8}>
															<ul className="money-counting__panel__left__product-details__labels">
																<li>Tên sản phẩm</li>
																<li>Giá bán</li>
																<li>Thể loại</li>
																<li>Nhà phân phối</li>
															</ul>
														</Col>
														<Col span={16}>
															<ul className="money-counting__panel__left__product-details__texts">
																<li>{scannedProduct.name}</li>
																<li>
																	<NumberFormat
																		value={scannedProduct.price}
																		displayType="text"
																		thousandSeparator={true}
																		suffix=" VNĐ"
																		style={{ fontWeight: 'bold' }} />
																</li>
																<li>{scannedProduct.category.name}</li>
																<li>{scannedProduct.supplier.name}</li>
															</ul>
														</Col>
													</Row>
												) : (
														<Empty
															image={Empty.PRESENTED_IMAGE_SIMPLE}
															description="Chưa tìm thấy"
															className="money-counting__panel__left__product-details__empty" />
													)}
											</div>
										</div>
									</Col>
									<Col span={18}>
										<div className="money-counting__panel__right">
											<div className="money-counting__panel__right__header">
												<Row align="middle">
													<Col span={12}>
														<div className="money-counting__panel__right__header__title">
															<div className="money-counting__panel__right__header__title__icon-wrapper">
																<ShoppingCartOutlined className="money-counting__panel__right__header__title__icon-wrapper__icon" />
																<div className="money-counting__panel__right__header__title__icon-wrapper__total-item">
																	<span>{checkedOutProducts.length}</span>
																</div>
															</div>
															<span>Giỏ hàng của khách</span>
														</div>
													</Col>
													<Col span={6}>
														<div className="money-counting__panel__right__header__total-price">
															<span className="money-counting__panel__right__header__total-price__label">
																Tổng tiền:
															</span>
															<NumberFormat
																value={priceTotal}
																displayType="text"
																thousandSeparator={true}
																suffix=" VNĐ"
																className="money-counting__panel__right__header__total-price__price"
															/>
														</div>
													</Col>
													<Col span={6}>
														<SubmitCheckoutSessionDialog
															checkedOutProducts={[...checkedOutProducts]}
															checkoutSessionID={this.state.checkoutSessionID}
															setCheckoutDoneScreenVisible={isVisible => this.setCheckoutDoneScreenVisible(isVisible)}
															setMainPanelOnWorking={onWorking => this.props.setMainPanelOnWorking(onWorking)}
															loadLackingItems={items => this.loadLackingItems(items)}
															setLackingItemsDialogVisible={isVisible => this.setLackingItemsDialogVisible(isVisible)}
														/>
													</Col>
												</Row>
											</div>
											<div className="money-counting__panel__right__shopping-cart">
												<div className="money-counting__panel__right__shopping-cart__list-products">
													<Table
														dataSource={[...checkedOutProducts]}
														columns={columns}
														pagination={false}
														scroll={{ y: 500 }}
														locale={{ emptyText: (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Giỏ hàng trống" />) }}
													/>
												</div>
											</div>
										</div>
									</Col>
								</Row>
							</div>
						</div>
					)}
			</div>
		)
	}
}
export default connect(null, actions)(withCookies(MoneyCounting));
