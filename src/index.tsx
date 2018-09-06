import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createHashHistory, createBrowserHistory } from 'history'
import { ConnectedRouter } from 'react-router-redux'
import { Routes } from './containers/Routes'
import './styles/base.scss'
import Amplify from 'aws-amplify'

import { AWS_CONFIG } from './config/aws'
import { configureStore } from './store/configureStore'

import { getCurrentEnvironment, EnvironmentType } from './diagnostics/EnvironmentType'
import { InterceptorsConfig } from './diagnostics/interceptors/Config'
import * as WindowUtils from './utils/WindowUtils'

const history = getCurrentEnvironment() === EnvironmentType.DEV ? createHashHistory() : createBrowserHistory()

export const store = configureStore(history)
Amplify.configure(AWS_CONFIG)

InterceptorsConfig.apply(getCurrentEnvironment())

ReactDOM.render(
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<Routes />
		</ConnectedRouter>
	</Provider>,
	document.getElementById('root')
)

if (WindowUtils.isInIFrame()) {
	let root = document.getElementsByTagName('html').item(0)
	if (root) {
		root.className = 'in-iframe'
	}
}
