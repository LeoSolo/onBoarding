import * as React from 'react'
import { connect, Dispatch } from 'react-redux'

import { GMap } from '../components/Map'

import { EventType, EventService } from '../services/events/events'
import { Api } from '../services/api/api'

import * as Types from '../types'
import * as MAP_CONSTANTS from '../constants/mapConstants'

import { MSAAction, Actions as MSAActions } from '../actions/msa'
import { PersonalInfoAction, Actions as PersonalInfoActions } from '../actions/personalInfo'
import { TabAction, Actions } from '../actions/tab'
import { StoreState } from '../reducers'

import '../styles/Territory.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface TerritoryProps {
	adjacentMSA: Types.MSA[]
	haulerInfo: Types.HaulerInfo
	haulerMSA: Types.HaulerMSAInfo[]
	haulerRequestedMSA: Types.HaulerMSAInfo[]
	setAdjMSA: (msa: Types.MSA[]) => MSAAction
	updateHaulerMSA: (msa: Types.HaulerMSAInfo[]) => PersonalInfoAction
	updateHaulerRequestedMSA: (msa: Types.HaulerMSAInfo[]) => PersonalInfoAction
	enableLoader: () => TabAction
	disableLoader: () => TabAction
}

interface TerritoryState {
	showMap: boolean
	height: number
}

class Territory extends React.Component<TerritoryProps, TerritoryState> {
	constructor(props) {
		super(props)
		this.state = {
			showMap: true,
			height: 450
		}
	}
	updateMSAs = () => {
		let resultPromise = Promise.resolve({})
		if (this.props.haulerInfo && this.props.haulerInfo.mailingAddress) {
			let haulerId = this.props.haulerInfo.mailingAddress
			resultPromise = resultPromise.then(() => {
				return new Promise((resolve, reject) => {
					Api.getHaulerMSA(haulerId)
					.then(haulerMSAs => {
						this.props.updateHaulerMSA(haulerMSAs.filter(haulerMSA => haulerMSA.status === Types.Enums.MSAStatus.ACTIVATED))
						this.props.updateHaulerRequestedMSA(haulerMSAs.filter(haulerMSA => haulerMSA.status === Types.Enums.MSAStatus.REQUEST_ACCESS))
						resolve()
					})
					.catch(error => reject(error))
				})
			})
			resultPromise = resultPromise.then(() => {
				return new Promise((resolve, reject) => {
					Api.getAdjacentMSA(haulerId)
					.then(msas => {
						let haulerMsaIds = this.props.haulerMSA.map(e => e.msaId)
						let haulerRequestedMSA = this.props.haulerRequestedMSA.map(e => e.msaId)
						let usedMsaIds = [...haulerMsaIds, ...haulerRequestedMSA]
						let notRequestedMsas = msas.filter(e => usedMsaIds.indexOf(e.id) < 0)
						this.props.setAdjMSA(notRequestedMsas)
						resolve()
					})
					.catch(error => reject(error))
				})
			})
		}
		return resultPromise
	}
	componentDidMount() {
		EventService.pushEvent(EventType.HAULER_TERRITORY_TAB_ACTIVATED)
		this.props.enableLoader()
		this.updateMSAs()
		.then(() => this.props.disableLoader())
		.catch(() => this.props.disableLoader())
	}
	requestNewTerritory = (msa: Types.MSA) => {
		console.log('clicked territory', msa)
		this.props.enableLoader()
		let promise = Api.requestAdditionalTerritory(msa.id).then(() => this.updateMSAs())
		promise
		.then(() => this.props.disableLoader())
		.catch(() => this.props.disableLoader())
	}
	getCenter = () => {
		let center = { lat: 0, lng: 0 }
		if (this.props.haulerMSA && this.props.haulerMSA.length > 0) {
			let firstMSA = this.props.haulerMSA[0]
			if (firstMSA.msa && firstMSA.msa.coordinates && firstMSA.msa.coordinates.length > 0) {
				let firstPolygon = firstMSA.msa.coordinates[0]
				center = { ...firstPolygon.center }
			}
		}
		return center
	}
	render() {
		return (
			<div className="scrollable">
				<div className="tabTitle">
					<div className="mapImg" />
					<p className="description">
						{StringResources.getString(Strings.Territory.SubTitle)}
					</p>
				</div>
			{this.state.showMap && (
				<div className="report-map">
					<GMap
						center={this.getCenter()}
						adjacentMSA={this.props.adjacentMSA}
						haulerMSA={this.props.haulerMSA}
						haulerRequestedMSA={this.props.haulerRequestedMSA}
						containerElement={<div style={{ height: this.state.height }}/>}
						mapElement={<div style={{ height: this.state.height }}/>}
						style={MAP_CONSTANTS.STYLES.mapStyles}
						onClickAdjacentMSA={this.requestNewTerritory}
					/>
				</div>
			)}
			</div>
		)
	}
}

function mapStatesToProps(state: StoreState) {
	return {
		adjacentMSA: state.msa.adjacentMSA,
		haulerInfo: state.personalInfo,
		haulerMSA: state.personalInfo.msa,
		haulerRequestedMSA: state.personalInfo.requestedMsa
	}
}

function mapDispatchToProps(dispatch: Dispatch<MSAAction | PersonalInfoAction>) {
	return {
		setAdjMSA: (msa: Types.MSA[]) => dispatch(MSAActions.setAdjacentMSA(msa)),
		updateHaulerMSA: (msa: Types.HaulerMSAInfo[]) => dispatch(PersonalInfoActions.setHaulerMSA(msa)),
		updateHaulerRequestedMSA: (msa: Types.HaulerMSAInfo[]) => dispatch(PersonalInfoActions.setHaulerRequestedMSA(msa)),
		enableLoader: () => dispatch(Actions.startLoading()),
		disableLoader: () => dispatch(Actions.endLoading())
	}
}

export const TerritoryContainer = connect(
	mapStatesToProps,
	mapDispatchToProps
)(Territory)
