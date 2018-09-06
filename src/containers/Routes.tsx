import * as React from 'react'
import { Route } from 'react-router'
import { Switch } from 'react-router-dom'

import { GetStartedContainer } from './GetStartedContainer'
import { LoginContainer } from './LoginContainer'
import { OverviewContainer } from './OverviewContainer'
import { CreatePasswordContainer } from './CreatePasswordContainer'
import { MobileContainer } from './Mobile'
import { ForgotPasswordContainer } from './ForgotPasswordContainer'
import { EmailConfirmationContainer } from './EmailConfirmationContainer'
import { ThanksContainer } from './ThanksContainer'

import { ROUTES } from '../constants/routes'

export class Routes extends React.Component {
    render() {
        return (
			<React.Fragment>
                <div className="mainContainer">
	                <div className="controlContainer">
	                    <Switch>
	                        <Route
	                            exact={true}
	                            path={ROUTES.ROOT}
	                            component={GetStartedContainer}
	                        />
	                        <Route
	                            exact={true}
	                            path={ROUTES.AUTH}
	                            component={LoginContainer}
	                        />
		                    <Route
			                    exact={true}
			                    path={ROUTES.LINK_ACC}
			                    component={CreatePasswordContainer}
		                    />
	                        <Route
	                            exact={true}
	                            path={ROUTES.OVERVIEW}
	                            component={OverviewContainer}
	                        />
		                    <Route
			                    exact={true}
			                    path={ROUTES.MOBILE}
			                    component={MobileContainer}
		                    />
							<Route
								exact={true}
								path={ROUTES.FORGOT_PASS}
								component={ForgotPasswordContainer}
							/>
							<Route
								exact={true}
								path={ROUTES.THANKS}
								component={ThanksContainer}
							/>
							<Route
								exact={true}
								path={`${ROUTES.EMAIL_CONFIRM}/:isSignInSuccessful`}
								component={EmailConfirmationContainer}
							/>
	                    </Switch>
	                </div>
                </div>
			</React.Fragment>
        )
    }
}
