import * as React from 'react'
import { EventType, EventService } from '../services/events/events'
import '../styles/Thanks.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'
import { TabAction, Actions } from '../actions/tab'
import { Actions as ServiceActions, ActionType as ServiceActionType } from '../actions/service'
import { routerActions, RouterAction } from 'react-router-redux'
import { OverviewTab } from '../constants/overviewTabs'
import { ROUTES } from '../constants/routes'
import { StoreState } from '../reducers'
import { Dispatch, connect } from 'react-redux'

interface ThanksProps {
	routePush: (location: string) => RouterAction,
	setTab: (tab: OverviewTab) => TabAction,
	setIgnoreNoSlots: () => ServiceActionType
}

 class Thanks extends React.Component<ThanksProps, {}> {
	constructor(props: any) {
		super(props)
	}
	componentDidMount() {
		EventService.pushEvent(EventType.HO_CANT_BE_GRANTED)
	}
	onLinkClicked = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault()
		this.props.setIgnoreNoSlots()
		this.props.setTab(OverviewTab.PERSONAL_INFO_TAB),
		this.props.routePush(ROUTES.OVERVIEW)
	}
	render() {
		return (
			<div className="thanksContainer">
				<p>
					{StringResources.getString(Strings.Thanks.Message.p1)}
				</p>
				<p>
					{StringResources.getString(Strings.Thanks.Message.p2.BeforeLink)}
					<a href="#" onClick={this.onLinkClicked}>{StringResources.getString(Strings.Thanks.Message.p2.Link)}</a>
					{StringResources.getString(Strings.Thanks.Message.p2.AfterLink)}
				</p>
			</div>
		)
	}
}

function mapStatesToProps(state: StoreState) {
	return {}
}
function mapDispatchToProps(dispatch: Dispatch<RouterAction | ServiceActionType | TabAction>) {
	return {
		routePush: (location: string) => dispatch(routerActions.push(location)),
		setTab: (tab: OverviewTab) => dispatch(Actions.selectTab(tab)),
		setIgnoreNoSlots: () => dispatch(ServiceActions.setIgnoreNoSlots(true))
	}
}

export const ThanksContainer = connect(
	mapStatesToProps,
	mapDispatchToProps
)(Thanks)
