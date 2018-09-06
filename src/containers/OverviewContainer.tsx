import * as React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import * as classnames from 'classnames'
import { connect, Dispatch } from 'react-redux'
import { RouterAction, routerActions } from 'react-router-redux'

import { LoadingSpinner } from '../components/LoadingSpinner'

import { Api } from '../services/api/api'

import { AppOverviewContainer } from '../containers/AppOverviewContainer'
import { VehicleInfoContainer } from '../containers/VehicleInfo'
import { BankInfoContainer } from '../containers/BankingInfoContainer'
import { PersonalInfoContainer } from '../containers/PersonalInfo'
import { DriverLicenseContainer } from '../containers/DriversLicense'
import { TerritoryContainer } from '../containers/Territory'

import { OverviewTab } from '../constants/overviewTabs'
import { ROUTES } from '../constants/routes'

import { TabAction, Actions } from '../actions/tab'
import { PersonalInfoAction, Actions as PersonalInfoActions } from '../actions/personalInfo'
import { VehicleAction, Actions as VehicleActions } from '../actions/vehicle'
import { DriverLicenseAction, Actions as DriverLicenseActions } from '../actions/driversLicense'
import { Actions as BankingInfoActions, BankInfoAction as BankingInfoActionType } from '../actions/bankInfo'
import { JobUtils, JobCancellationToken } from '../utils/JobUtils'

import { StoreState } from '../reducers'

import { HaulerStatusUtils } from '../utils/HaulerStatusUtils'
import { HaulerInfo, VehicleInfo, DriverLicenseInfo } from '../types'
import { HaulerAccountStatus, HaulerInfoStatus } from '../types/enum'

import '../styles/Overview.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface OverviewProps {
	currentTab: OverviewTab
	isLoading: boolean
	haulerInfo: HaulerInfo
	isBankingInfoProvided: boolean
	ignoreNoSlots: boolean
	setSelectedTab: (tab: OverviewTab) => TabAction
	enableLoader: () => TabAction
	disableLoader: () => TabAction
	updatePersonalInfo: (personalInfo: HaulerInfo) => PersonalInfoAction
	updateVehicleInfo: (vehicleInfo: VehicleInfo) => VehicleAction
	updateDriverLicenseInfo: (driverLicense: DriverLicenseInfo) => DriverLicenseAction
	routePush: (location: string) => RouterAction
	setBankingInfoProvided: (isProvided: boolean) => BankingInfoActionType
	updatePersonalInfoStatus: (personalInfo: HaulerInfo) => PersonalInfoAction
	updateDriverLicenseStatus: (status?: HaulerInfoStatus) => DriverLicenseAction
	updateVehicleInfoStatus: (status?: HaulerInfoStatus) => VehicleAction
}

interface OverviewStates {
	menuOpened: boolean
	infoLoaded: boolean
}

class Overview extends React.Component<OverviewProps, OverviewStates> {

	private oldScrollBy: any = null
	private scrollableDivRef
	private tabsByIndex: OverviewTab[]
	private indexByTabName: Map<OverviewTab, number>
	private jobCancellationToken: JobCancellationToken | undefined = undefined

	constructor(props: any) {
		super(props)
		this.scrollableDivRef = React.createRef()
		this.tabsByIndex = [
			OverviewTab.APP_OVERVIEW_TAB,
			OverviewTab.PERSONAL_INFO_TAB,
			OverviewTab.DRIVER_LICENSE_TAB,
			OverviewTab.VEHICLE_INFO_TAB,
			OverviewTab.BANKING_INFO_TAB,
			OverviewTab.TERRITORY_TAB
		]
		this.indexByTabName = new Map<OverviewTab, number>()
		for (let i = 0; i < this.tabsByIndex.length; i++) {
			this.indexByTabName.set(this.tabsByIndex[i], i)
		}
		this.state = {
			menuOpened: false,
			infoLoaded: false
		}
		if (!this.props.currentTab) {
			this.props.setSelectedTab(OverviewTab.APP_OVERVIEW_TAB)
		}
	}

	componentDidMount() {
		this.props.enableLoader()
		if (!this.oldScrollBy) {
			this.oldScrollBy = window.scrollBy
			window.scrollBy = (...args) => {
				if (this.scrollableDivRef && this.scrollableDivRef.current && this.scrollableDivRef.current.scrollBy) {
					this.scrollableDivRef.current.scrollBy(...args)
				}
			}
		}
		Api.loadHaulerOverview()
			.then(haulerInfo => {
				this.props.disableLoader()
				this.props.updatePersonalInfo(haulerInfo)
				if (haulerInfo.driveLicenseInformation) {
					this.props.updateDriverLicenseInfo(haulerInfo.driveLicenseInformation)
				}
				if (haulerInfo.vehicleInformation) {
					this.props.updateVehicleInfo(haulerInfo.vehicleInformation)
				}
				this.props.setBankingInfoProvided(haulerInfo.stripeStatus ? false : this.props.isBankingInfoProvided)
				if (haulerInfo.status === HaulerAccountStatus.ON_WAITING_LIST && !this.props.ignoreNoSlots) {
					this.props.routePush(ROUTES.THANKS)
				} else {
					this.setState({
						infoLoaded: true
					})
				}
				this.setState({
					infoLoaded: true
				})
			})
			.catch(error => {
				if (error.response) {
					console.warn(error.response)
				}
				this.props.disableLoader()
				// TODO: show error page
				this.setState({
					infoLoaded: true
				})
			})

	}
	componentWillUnmount() {
		if (this.jobCancellationToken) {
			this.jobCancellationToken.cancel()
			this.jobCancellationToken = undefined
		}
		if (this.oldScrollBy) {
			window.scrollBy = this.oldScrollBy
			this.oldScrollBy = null
		}
	}
	onDataProvided = () => {
		if (this.jobCancellationToken) {
			this.jobCancellationToken.cancel()
			this.jobCancellationToken = undefined
		}
		this.jobCancellationToken = JobUtils.repeatJob(() => {
			return new Promise((resolve, reject) => {
				Api.loadHaulerOverview()
					.then(haulerInfo => {
						this.props.updatePersonalInfoStatus({
							status: haulerInfo.status,
							subStatus: haulerInfo.subStatus,
							infoStatus: haulerInfo.infoStatus,
							stripeStatus: haulerInfo.stripeStatus
						})
						this.props.setBankingInfoProvided(haulerInfo.stripeStatus ? false : this.props.isBankingInfoProvided)
						if (haulerInfo.driveLicenseInformation) {
							this.props.updateDriverLicenseStatus(haulerInfo.driveLicenseInformation.infoStatus)
						}
						if (haulerInfo.vehicleInformation) {
							this.props.updateVehicleInfoStatus(haulerInfo.vehicleInformation.infoStatus)
						}
						resolve()
					})
					.catch(error => {
						console.log('Error: ', error)
						reject(error)
					})
			})
		}, 3 * 1000, 1.5 * 60 * 1000, false)
	}
	onTabSelect = (tabIndex: number) => {
		this.props.setSelectedTab(this.tabsByIndex[tabIndex])
		this.setState({
			menuOpened: false
		})
	}
	switchTabsStatus = () => {
		this.state.menuOpened ? this.setState({ menuOpened: false }) : this.setState({ menuOpened: true })
	}
	isHaulerApproved = () => (this.props.haulerInfo ? HaulerStatusUtils.isHaulerApproved(this.props.haulerInfo.status) : false)
	closeThree = (tab: OverviewTab) => {
		let firstThree = [OverviewTab.APP_OVERVIEW_TAB, OverviewTab.PERSONAL_INFO_TAB, OverviewTab.DRIVER_LICENSE_TAB]
		let lastThree = this.isHaulerApproved() ? [OverviewTab.VEHICLE_INFO_TAB, OverviewTab.BANKING_INFO_TAB, OverviewTab.TERRITORY_TAB] : [OverviewTab.PERSONAL_INFO_TAB, OverviewTab.DRIVER_LICENSE_TAB, OverviewTab.VEHICLE_INFO_TAB]
		let currentGroup = firstThree.indexOf(this.props.currentTab) > -1 ? firstThree : (lastThree.indexOf(this.props.currentTab) > -1 ? lastThree : [])
		return currentGroup.indexOf(tab) > -1
	}

	render() {
		const isHaulerApproved = this.isHaulerApproved()
		return (
			<div ref={this.scrollableDivRef} className="tabsContainer scrollable">
				<LoadingSpinner show={this.props.isLoading} text={StringResources.getString(Strings.Overview.SpinnerText)} />

				<Tabs selectedIndex={this.indexByTabName.get(this.props.currentTab)} onSelect={this.onTabSelect} >
					<div className="tab-list-wrapper">
						<TabList
							className={classnames('tab-list react-tabs__tab-list', { closed: !this.state.menuOpened, extended: isHaulerApproved })}
						>
							<Tab
								selectedClassName="selected"
								className={classnames('tab', {
									'three-nth-show': this.closeThree(OverviewTab.APP_OVERVIEW_TAB),
									prev: this.props.currentTab === OverviewTab.PERSONAL_INFO_TAB
								})}
							>
								{StringResources.getString(Strings.Overview.Tabs.Overview.title)}
							</Tab>
							<Tab
								selectedClassName="selected"
								className={classnames('tab', {
									'three-nth-show': this.closeThree(OverviewTab.PERSONAL_INFO_TAB),
									next: this.props.currentTab === OverviewTab.APP_OVERVIEW_TAB
								})}
							>
								{StringResources.getString(Strings.Overview.Tabs.PersonalInfo.title)}
							</Tab>
							<Tab
								selectedClassName="selected"
								className={classnames('tab', {
									'three-nth-show': this.closeThree(OverviewTab.DRIVER_LICENSE_TAB),
									prev: this.props.currentTab === OverviewTab.VEHICLE_INFO_TAB
								})}
							>
								{StringResources.getString(Strings.Overview.Tabs.DriversLicense.title)}
							</Tab>
							<Tab
								selectedClassName="selected"
								className={classnames('tab', {
									'three-nth-show': this.closeThree(OverviewTab.VEHICLE_INFO_TAB),
									next: this.props.currentTab === OverviewTab.DRIVER_LICENSE_TAB,
									withBorder: !isHaulerApproved
								})}
							>
								{StringResources.getString(Strings.Overview.Tabs.VehicleInfo.title)}
							</Tab>
							{
								isHaulerApproved &&
								<Tab
									selectedClassName="selected"
									className={classnames('tab', {
										'three-nth-show': this.closeThree(OverviewTab.BANKING_INFO_TAB),
										prev: this.props.currentTab === OverviewTab.TERRITORY_TAB
									})}
								>
									{StringResources.getString(Strings.Overview.Tabs.BankingInfo.title)}
								</Tab>
							}
							{
								isHaulerApproved &&
								<Tab
									selectedClassName="selected"
									className={classnames('tab', {
										'three-nth-show': this.closeThree(OverviewTab.TERRITORY_TAB),
										next: this.props.currentTab === OverviewTab.BANKING_INFO_TAB
									})}
								>
									{StringResources.getString(Strings.Overview.Tabs.Territory.title)}
								</Tab>
							}
						</TabList>
						<div className={classnames('moreBtn', { closed: !this.state.menuOpened })} onClick={this.switchTabsStatus}>
							{StringResources.getString(Strings.Overview.Tabs.More.title)} <div className="arrow" />
						</div>
					</div>
					<TabPanel className="appOverviewTab" selectedClassName="selected">
						{this.state.infoLoaded && (<AppOverviewContainer onAppOverviewMounted={this.onDataProvided} />)}
					</TabPanel>

					<TabPanel className="personalInfoTab" selectedClassName="selected">
						{this.state.infoLoaded && (<PersonalInfoContainer />)}
					</TabPanel>

					<TabPanel className="driversLicenseTab" selectedClassName="selected">
						{this.state.infoLoaded && (<DriverLicenseContainer />)}
					</TabPanel>

					<TabPanel className="vehicleInfoTab" selectedClassName="selected">
						{this.state.infoLoaded && (<VehicleInfoContainer />)}
					</TabPanel>

					{
						isHaulerApproved &&
						<TabPanel className="bankingInfoTab" selectedClassName="selected">
							{this.state.infoLoaded && (<BankInfoContainer />)}
						</TabPanel>
					}

					{
						isHaulerApproved &&
						<TabPanel className="mapTab" selectedClassName="selected">
							{this.state.infoLoaded && (<TerritoryContainer />)}
						</TabPanel>
					}
				</Tabs>
			</div>
		)
	}
}

function mapStateToProps(state: StoreState) {
	return {
		currentTab: state.tab.currentTab,
		isLoading: state.tab.isLoading,
		haulerInfo: state.personalInfo,
		isBankingInfoProvided: state.bankInfo.bankInfoProvided,
		ignoreNoSlots: state.serviceInfo.ignoreNoSlots
	}
}

function mapDispatchToProps(dispatch: Dispatch<TabAction>) {
	return {
		setSelectedTab: (tab: OverviewTab) => dispatch(Actions.selectTab(tab)),
		enableLoader: () => dispatch(Actions.startLoading()),
		disableLoader: () => dispatch(Actions.endLoading()),
		updatePersonalInfo: (personalInfo: HaulerInfo) => dispatch(PersonalInfoActions.updatePersonalInfo(personalInfo)),
		updateVehicleInfo: (vehicleInfo: VehicleInfo) => dispatch(VehicleActions.updateVehicleInfo(vehicleInfo)),
		updateDriverLicenseInfo: (driverLicense: DriverLicenseInfo) => dispatch(DriverLicenseActions.updateLicenseInfo(driverLicense)),
		routePush: (location: string) => dispatch(routerActions.push(location)),
		setBankingInfoProvided: (isProvided: boolean) => dispatch(BankingInfoActions.setBankInfoProvided(isProvided)),
		updatePersonalInfoStatus: (personalInfo: HaulerInfo) => dispatch(PersonalInfoActions.updateStatuses(personalInfo)),
		updateDriverLicenseStatus: (status?: HaulerInfoStatus) => dispatch(DriverLicenseActions.updateLicenseStatus(status)),
		updateVehicleInfoStatus: (status?: HaulerInfoStatus) => dispatch(VehicleActions.updateVehicleInfoStatus(status))
	}
}

export const OverviewContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Overview)
