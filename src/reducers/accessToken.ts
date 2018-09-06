import { AccessTokenAction, SAVE_ACCESS_TOKEN } from '../actions/accessToken'
import { SetCurrentEmailAction, SAVE_CURRENT_EMAIL } from '../actions/currentEmail'

export interface AccessTokenState {
	accessToken: string
	addingToken: string
	currentEmail: string
	isMobile: boolean
}

const initialState: AccessTokenState = {
	accessToken: '',
	addingToken: '',
	currentEmail: '',
	isMobile: false
}

export function accessTokenReducer(state: AccessTokenState = initialState, action: AccessTokenAction & SetCurrentEmailAction): AccessTokenState {
	switch (action.type) {
		case SAVE_ACCESS_TOKEN: {
			return {
				...state,
				accessToken: action.payload.accessToken,
				addingToken: action.payload.addingToken,
				isMobile: action.payload.isMobile
			}
		}
		case SAVE_CURRENT_EMAIL: {
			return {
				...state,
				currentEmail: action.payload.currentEmail
			}
		}
		default: {
			return state
		}
	}
}
