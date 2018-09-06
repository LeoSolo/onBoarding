import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import * as moment from 'moment'

import { EventType, EventService } from '../services/events/events'

import { OverviewTab } from '../constants/overviewTabs'

import { HaulerInfo, DriverLicenseInfo, VehicleInfo, HaulerStatusInfo } from '../types'
import { HaulerInfoStatus, HaulerAccountStatus, StripeStatus, HaulerAccountSubStatuses } from '../types/enum'

import { TabAction, Actions as TabActions } from '../actions/tab'

import { StoreState } from '../reducers'

import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

import '../styles/AppOverview.scss'

interface Item {
	titleClasses?: string,
	subtitleClasses?: string,
	buttonClasses?: string,
	title: string,
	subtitle?: string,
	buttonTitle: string,
	onClick?: () => any
}

export interface AppOverviewProps {
	onAppOverviewMounted?: () => void
}

interface InnerAppOverviewProps extends AppOverviewProps {
	isBankingInfoProvided: boolean
	haulerInfo: HaulerInfo
	driverLicenseInfo: DriverLicenseInfo
	vehicleInfo: VehicleInfo
	isInfoLoaded: boolean
	setSelectedTab: (tab: OverviewTab) => TabAction
}

interface AppOverviewStates {
	test?: moment.Moment
}

class AppOverview extends React.Component<InnerAppOverviewProps, AppOverviewStates> {

	constructor(props: any) {
		super(props)
		this.state = {}
	}

	componentDidMount() {
		EventService.pushEvent(EventType.HAULER_OVERVIEW_TAB_ACTIVATED)
		if (this.props.onAppOverviewMounted) {
			this.props.onAppOverviewMounted()
		}
	}

	anyIncomplete = () => {
		let statuses = this.prepareStatuses()
		return !statuses.haulerStatus
			|| !statuses.driverLicenseStatus
			|| !statuses.vehicleStatus
			|| (statuses.bankingInfoStatus !== undefined && !statuses.bankingInfoStatus)
	}

	anyNeedUpdate = () => {
		let statuses = this.prepareStatuses()
		return statuses.haulerStatus === HaulerInfoStatus.NOT_APPROVED
			|| statuses.driverLicenseStatus === HaulerInfoStatus.NOT_APPROVED
			|| statuses.vehicleStatus === HaulerInfoStatus.NOT_APPROVED
			|| statuses.bankingInfoStatus === HaulerInfoStatus.NOT_APPROVED
	}

	anyInProgress = () => {
		let statuses = this.prepareStatuses()
		return statuses.haulerStatus === HaulerInfoStatus.REVIEW_PENDING
			|| statuses.driverLicenseStatus === HaulerInfoStatus.REVIEW_PENDING
			|| statuses.vehicleStatus === HaulerInfoStatus.REVIEW_PENDING
			|| statuses.bankingInfoStatus === HaulerInfoStatus.REVIEW_PENDING
	}

	anyCompleted = () => {
		let statuses = this.prepareStatuses()
		return statuses.haulerStatus === HaulerInfoStatus.APPROVED
			|| statuses.driverLicenseStatus === HaulerInfoStatus.APPROVED
			|| statuses.vehicleStatus === HaulerInfoStatus.APPROVED
			|| statuses.bankingInfoStatus === HaulerInfoStatus.APPROVED
	}

	static commonItemPart = {
		titleClasses: 'title align-center-xs align-center-xm',
		buttonClasses: 'btn normal',
		buttonTitle: StringResources.getString(Strings.AppOverview.Buttons.Update.title)
	}

	getIncompleteItems = (statuses: HaulerStatusInfo) => {
		let buttonTitle = StringResources.getString(Strings.AppOverview.Buttons.Start.title)
		let results: Item[] = []
		if (!statuses.haulerStatus) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.PersonalInformation.title),
				buttonTitle: buttonTitle,
				onClick: () => this.props.setSelectedTab(OverviewTab.PERSONAL_INFO_TAB)
			})
		}
		if (!statuses.driverLicenseStatus) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.DriversLicenseInfo.title),
				buttonTitle: buttonTitle,
				onClick: () => this.props.setSelectedTab(OverviewTab.DRIVER_LICENSE_TAB)
			})
		}
		if (!statuses.vehicleStatus) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.VehicleInformation.title),
				buttonTitle: buttonTitle,
				onClick: () => this.props.setSelectedTab(OverviewTab.VEHICLE_INFO_TAB)
			})
		}
		if (this.props.haulerInfo && this.props.haulerInfo.status === HaulerAccountStatus.HAULER_ACTIVE && !statuses.bankingInfoStatus) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.BankingInfoData.title),
				buttonTitle: buttonTitle,
				onClick: () => this.props.setSelectedTab(OverviewTab.BANKING_INFO_TAB)
			})
		}
		return results
	}

	getNeedsUpdateItems = (statuses: HaulerStatusInfo) => {
		let results: Item[] = []
		if (statuses.haulerStatus === HaulerInfoStatus.NOT_APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.PersonalInformation.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.PERSONAL_INFO_TAB)
			})
		}
		if (statuses.driverLicenseStatus === HaulerInfoStatus.NOT_APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.DriversLicenseInfo.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.DRIVER_LICENSE_TAB)
			})
		}
		if (statuses.vehicleStatus === HaulerInfoStatus.NOT_APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.VehicleInformation.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.VEHICLE_INFO_TAB)
			})
		}
		if (statuses.bankingInfoStatus === HaulerInfoStatus.NOT_APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.BankingInfoData.title),
				subtitle: StringResources.getString(Strings.AppOverview.InfoTabs.BankingInfoData.subtitle),
				subtitleClasses: 'subtitle',
				onClick: () => this.props.setSelectedTab(OverviewTab.BANKING_INFO_TAB)
			})
		}
		return results
	}

	getInProgressItems = (statuses: HaulerStatusInfo) => {
		let results: Item[] = []
		if (statuses.haulerStatus === HaulerInfoStatus.REVIEW_PENDING) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.PersonalInformation.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.PERSONAL_INFO_TAB)
			})
		}
		if (statuses.driverLicenseStatus === HaulerInfoStatus.REVIEW_PENDING) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.DriversLicenseInfo.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.DRIVER_LICENSE_TAB)
			})
		}
		if (statuses.vehicleStatus === HaulerInfoStatus.REVIEW_PENDING) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.VehicleInformation.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.VEHICLE_INFO_TAB)
			})
		}
		if (statuses.bankingInfoStatus === HaulerInfoStatus.REVIEW_PENDING) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.BankingInfoData.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.BANKING_INFO_TAB)
			})
		}
		return results
	}

	getCompletedItems = (statuses: HaulerStatusInfo) => {
		let results: Item[] = []
		if (statuses.haulerStatus === HaulerInfoStatus.APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.PersonalInformation.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.PERSONAL_INFO_TAB)
			})
		}
		if (statuses.driverLicenseStatus === HaulerInfoStatus.APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.DriversLicenseInfo.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.DRIVER_LICENSE_TAB)
			})
		}
		if (statuses.vehicleStatus === HaulerInfoStatus.APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.VehicleInformation.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.VEHICLE_INFO_TAB)
			})
		}
		if (statuses.bankingInfoStatus === HaulerInfoStatus.APPROVED) {
			results.push({
				...AppOverview.commonItemPart,
				title: StringResources.getString(Strings.AppOverview.InfoTabs.BankingInfoData.title),
				onClick: () => this.props.setSelectedTab(OverviewTab.BANKING_INFO_TAB)
			})
		}
		return results
	}

	ts = (value: moment.Moment) => {
		this.setState({
			test: value
		})
	}

	render() {
		let statuses = this.prepareStatuses()
		let subTitleTemplate = Strings.AppOverview.SubTitles.Initial
		switch (this.props.haulerInfo.status) {
			case HaulerAccountStatus.HAULER_ACTIVE: {
				switch (this.props.haulerInfo.subStatus) {
					case HaulerAccountSubStatuses.BANKING_INFO_MISSING:
					case HaulerAccountSubStatuses.INFO_CHANGED: {
						subTitleTemplate = Strings.AppOverview.SubTitles.NeedsUpdating
						break
					}
					default: {
						subTitleTemplate = Strings.AppOverview.SubTitles.Complete
						break
					}
				}
				break
			}
			case HaulerAccountStatus.REVIEW: {
				switch (this.props.haulerInfo.subStatus) {
					case HaulerAccountSubStatuses.SUBMITTED:
					case HaulerAccountSubStatuses.STARTED: {
						subTitleTemplate = Strings.AppOverview.SubTitles.WaitingForReview
						break
					}
					case HaulerAccountSubStatuses.INCOMPLETE_INFO:
					default: {
						subTitleTemplate = Strings.AppOverview.SubTitles.NeedsUpdating
						break
					}
				}
				break
			}
			default: {
				subTitleTemplate = Strings.AppOverview.SubTitles.Initial
				break
			}
		}
        return (
            <div>
                <div className="tabTitle">
                    <div className="haulerImg"/>
                    <p className="description">
						{StringResources.getString(subTitleTemplate,this.props.haulerInfo ? this.props.haulerInfo.firstName : '')}
                    </p>
                </div>

                <div className="overviewListContainer">
	                {
	                	this.anyIncomplete() &&
		                <div className="incompleteContainer overviewContainer">
			                <span className="overviewContainerTitle">{StringResources.getString(Strings.AppOverview.Groups.IncompleteInformation.title)}</span>
							<ul>
								{this.getIncompleteItems(statuses).map((value: Item, index: number) => {
									return (
										<li key={index}>
											<div className="row space-between wrap-xs wrap-xm justify-center-xs justify-center-xm">
												<div className={value.titleClasses}>{value.title}</div>
												<button className={value.buttonClasses} onClick={value.onClick}>{value.buttonTitle}</button>
											</div>
										</li>
									)
								})}
							</ul>
		                </div>
					}
					{
	                	this.anyNeedUpdate() &&
		                <div className="toUpdateContainer overviewContainer">
			                <span className="overviewContainerTitle">{StringResources.getString(Strings.AppOverview.Groups.NeedsUpdating.title)}</span>
			                <ul>
								{this.getNeedsUpdateItems(statuses).map((value: Item, index: number) => {
									return (
										<li key={index}>
											<div className="row space-between wrap-xs wrap-xm justify-center-xs justify-center-xm">
												<div className={value.titleClasses}>{value.title}</div>

												<button className={value.buttonClasses} onClick={value.onClick}>{value.buttonTitle}</button>
											</div>
											{value.subtitle && <div className={value.subtitleClasses}>{value.subtitle}</div>}
										</li>
									)
								})}
							</ul>
		                </div>
	                }
	                {
		                this.anyInProgress() &&
		                <div className="toUpdateContainer overviewContainer">
			                <span className="overviewContainerTitle">{StringResources.getString(Strings.AppOverview.Groups.InProgress.title)}</span>
			                <ul>
								{this.getInProgressItems(statuses).map((value: Item, index: number) => {
									return (
										<li key={index}>
											<div className="row space-between wrap-xs wrap-xm justify-center-xs justify-center-xm">
												<div className={value.titleClasses}>{value.title}</div>
												<button className={value.buttonClasses} onClick={value.onClick}>{value.buttonTitle}</button>
											</div>
										</li>
									)
								})}
							</ul>
		                </div>

	                }
	                {
		                this.anyCompleted() &&
		                <div className="completeContainer overviewContainer">
			                <span className="overviewContainerTitle">{StringResources.getString(Strings.AppOverview.Groups.Complete.title)}</span>
			                <ul>
								{this.getCompletedItems(statuses).map((value: Item, index: number) => {
									return (
										<li key={index}>
											<div className="row space-between wrap-xs wrap-xm justify-center-xs justify-center-xm">
												<div className={value.titleClasses}>{value.title}</div>
												<button className={value.buttonClasses} onClick={value.onClick}>{value.buttonTitle}</button>
											</div>
										</li>
									)
								})}
							</ul>
		                </div>
	                }
                </div>
            </div>
        )
	}

	private prepareStatuses = () => {
		let haulerStatus: HaulerInfoStatus = this.props.haulerInfo ?
			(this.props.haulerInfo.infoStatus ?
				this.props.haulerInfo.infoStatus :
				HaulerInfoStatus.INCOMPLETE) :
			HaulerInfoStatus.INCOMPLETE
		let driverLicenseStatus: HaulerInfoStatus = this.props.driverLicenseInfo ?
			(this.props.driverLicenseInfo.infoStatus ?
				this.props.driverLicenseInfo.infoStatus :
				HaulerInfoStatus.INCOMPLETE) :
			HaulerInfoStatus.INCOMPLETE
		let vehicleStatus: HaulerInfoStatus = this.props.vehicleInfo ?
			(this.props.vehicleInfo.infoStatus ?
				this.props.vehicleInfo.infoStatus :
				HaulerInfoStatus.INCOMPLETE) :
			HaulerInfoStatus.INCOMPLETE
		let bankingInfoStatus: HaulerInfoStatus | undefined = undefined
		if (this.props.haulerInfo.status === HaulerAccountStatus.HAULER_ACTIVE) {
			if (this.props.isBankingInfoProvided) {
				bankingInfoStatus = HaulerInfoStatus.REVIEW_PENDING
			} else {
				if (!this.props.haulerInfo.stripeStatus) {
					bankingInfoStatus = HaulerInfoStatus.INCOMPLETE
				} else if (this.props.haulerInfo.stripeStatus === StripeStatus.SUSPENDED_BY_STRIPE) {
					bankingInfoStatus = HaulerInfoStatus.NOT_APPROVED
				} else if (this.props.haulerInfo.stripeStatus === StripeStatus.STRIPE_APPROVED) {
					bankingInfoStatus = HaulerInfoStatus.APPROVED
				}
			}
		}
		let statuses: HaulerStatusInfo = {
			haulerStatus: haulerStatus,
			driverLicenseStatus: driverLicenseStatus,
			vehicleStatus: vehicleStatus,
			bankingInfoStatus: bankingInfoStatus
		}
		return statuses
	}
}

function mapStateToProps(state: StoreState) {
	return {
		haulerInfo: state.personalInfo,
		driverLicenseInfo: state.driverLicense,
		vehicleInfo: state.vehicleInfo,
		isInfoLoaded: state.serviceInfo.isHaulerInfoLoaded,
		isBankingInfoProvided: state.bankInfo.bankInfoProvided
	}
}

function mapDispatchToProps(dispatch: Dispatch<TabAction>) {
	return {
		setSelectedTab: (tab: OverviewTab) => dispatch(TabActions.selectTab(tab))
	}
}

export const AppOverviewContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(AppOverview) as React.ComponentClass<AppOverviewProps>
