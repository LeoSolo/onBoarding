import { SET_IGNORE_NO_SLOTS, SET_HAULER_INFO_LOADED, SET_HAULER_INFO_UNLOADED, SET_HAULER_REGISTRATION_IN_PROCESS, SET_HAULER_REGISTRATION_END, ActionType } from '../actions/service'

export interface ServiceInfoState {
    isHaulerInfoLoaded: boolean
	isHaulerRegistrationInProcess: boolean
	ignoreNoSlots: boolean
}

const initialState: ServiceInfoState = {
    isHaulerInfoLoaded: false,
	isHaulerRegistrationInProcess: false,
	ignoreNoSlots: false
}

export function serviceInfoReducer(state: ServiceInfoState = initialState, action: ActionType) {
    switch (action.type) {
        case SET_HAULER_INFO_LOADED: {
            return {
                ...state,
                isHaulerInfoLoaded: true
            }
        }
        case SET_HAULER_INFO_UNLOADED: {
            return {
                ...state,
                isHaulerInfoLoaded: false
            }
        }
        case SET_HAULER_REGISTRATION_IN_PROCESS: {
            return {
                ...state,
                isHaulerRegistrationInProcess: true
            }
        }
        case SET_HAULER_REGISTRATION_END: {
            return {
                ...state,
                isHaulerRegistrationInProcess: false
            }
		}
		case SET_IGNORE_NO_SLOTS: {
			return {
				...state,
				ignoreNoSlots: action.payload.ignore
			}
		}
        default: {
            return state
        }
    }
}
