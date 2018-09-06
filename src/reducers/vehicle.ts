import { VehicleInfo } from '../types'
import { VehicleAction, UPDATE_VEHICLE_INFO, UPDATE_VEHICLE_STATUS } from '../actions/vehicle'

export interface VehicleState extends VehicleInfo {}

const initialState: VehicleState = {}

export function vehicleReducer(state: VehicleState = initialState, action: VehicleAction) {
    switch (action.type) {
        case UPDATE_VEHICLE_INFO: {
            return {
                ...state,
				...action.payload
            }
		}
		case UPDATE_VEHICLE_STATUS: {
			return {
				...state,
				infoStatus: action.payload.infoStatus
			}
		}
        default: {
            return state
        }
    }
}
