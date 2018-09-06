import * as React from 'react'
import { RouterAction, routerActions } from 'react-router-redux'
import { connect, Dispatch } from 'react-redux'

import { ROUTES } from '../constants/routes'

import { AccessTokenAction, Actions as AccessTokenActions } from '../actions/accessToken'
import { ActionType as StoreAction, Actions as StoreActions } from '../actions/store'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StoreState } from '../reducers'

interface MobileProps {
	routePush: (path: string) => RouterAction
	setAccessToken: (accessToken: string, addingToken: string) => AccessTokenAction
	cleanState: () => StoreAction
}

interface MobileStates {}

export class Mobile extends React.Component<MobileProps, MobileStates> {
	constructor(props: any) {
		super(props)
		this.state = {}
	}

	componentDidMount() {
        if (window.location.href.split('token=')[1]) {
			this.props.cleanState()
			this.props.setAccessToken(window.location.href.split('token=')[1], '')
			this.props.routePush(ROUTES.OVERVIEW)
        }
    }

	render() {
		return (
			<LoadingSpinner show={true} />
		)
	}
}

function mapStateToProps(state: StoreState) {
	return {}
}

function mapDispatchToProps(dispatch: Dispatch<RouterAction>) {
	return {
		routePush: (location: string) => dispatch(routerActions.push(location)),
		setAccessToken: (accessToken: string, addingToken: string) => dispatch(AccessTokenActions.setAccessToken(accessToken, addingToken, true)),
		cleanState: () => dispatch(StoreActions.cleanAll())
	}
}

export const MobileContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Mobile)
