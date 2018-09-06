import { DriverLicenseInfo } from '../types'
import { DriverLicenseAction, UPDATE_DRIVER_LICENSE, UPDATE_DRIVER_LICENSE_STATUS } from '../actions/driversLicense'

export interface DriverLicenseState extends DriverLicenseInfo {}

const initialState: DriverLicenseState = {}

export function driverLicenseReducer(state: DriverLicenseState = initialState, action: DriverLicenseAction) {
    switch (action.type) {
		case UPDATE_DRIVER_LICENSE_STATUS: {
			return {
				...state,
				infoStatus: action.payload.infoStatus
			}
		}
        case UPDATE_DRIVER_LICENSE: {
            return {
                ...state,
				...action.payload
            }
        }
        default: {
            return state
        }
    }
}
