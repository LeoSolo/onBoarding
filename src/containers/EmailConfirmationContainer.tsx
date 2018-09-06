import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { routerActions, RouterAction } from 'react-router-redux'
import { StoreState } from '../reducers'
import { ROUTES } from '../constants/routes'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface EmailConfirmationRouterProps {
	isSignInSuccessful?: string
}

interface EmailConfirmationProps extends RouteComponentProps<EmailConfirmationRouterProps> {
	routePush: (location: string) => RouterAction
}

interface EmailConfirmationState {
}

class EmailConfirmation extends React.Component<EmailConfirmationProps, EmailConfirmationState> {
	constructor(props: any) {
		super(props)
	}

	onClick = (e: React.FormEvent<HTMLElement>) => {
		e.preventDefault()
		if (this.props.match.params.isSignInSuccessful && this.props.match.params.isSignInSuccessful === 'true') {
			this.props.routePush(ROUTES.OVERVIEW)
		} else {
			this.props.routePush(ROUTES.AUTH)
		}
	}

	render() {
		return (
			<div className="scrollable">
				<div className="tabTitle">
					<h1 className="title" />
					<p className="description">
						{StringResources.getString(Strings.EmailConfirmation.SubTitle)}
					</p>
				</div>
				<form className="inputsContainer" onSubmit={this.onClick}>
					<br className="separatorDiv" />
					<div className="row center">
						<button
							type="submit"
							className="btn normal"
						>
							{StringResources.getString(Strings.EmailConfirmation.Buttons.Continue.title)}
						</button>
					</div>
				</form>
			</div>
		)
	}
}

function mapStateToProps(state: StoreState) {
	return {}
}

function mapDispatchToProps(dispatch: Dispatch<RouterAction>) {
	return {
		routePush: (location: string) => dispatch(routerActions.push(location))
	}
}

const EmailConfirmationContainerWithRouter = withRouter(EmailConfirmation)

export const EmailConfirmationContainer = connect<any>(
	mapStateToProps,
	mapDispatchToProps
)(EmailConfirmationContainerWithRouter)
