import { VehicleInfo } from '../types'
import { HaulerInfoStatus } from '../types/enum'

export const UPDATE_VEHICLE_INFO = 'UPDATE_VEHICLE_INFO'
export const UPDATE_VEHICLE_STATUS = 'UPDATE_VEHICLE_STATUS'

interface UpdateVehicleInfoAction {
	type: typeof UPDATE_VEHICLE_INFO
	payload: VehicleInfo
}

interface UpdateVehicleInfoStatusAction {
	type: typeof UPDATE_VEHICLE_STATUS,
	payload: {
		infoStatus?: HaulerInfoStatus
	}
}

export type VehicleAction = UpdateVehicleInfoAction | UpdateVehicleInfoStatusAction

export class Actions {
	static updateVehicleInfo(vehicleInfo: VehicleInfo): UpdateVehicleInfoAction {
		return {
			type: UPDATE_VEHICLE_INFO,
			payload: vehicleInfo
		}
	}
	static updateVehicleInfoStatus(status?: HaulerInfoStatus): UpdateVehicleInfoStatusAction {
		return {
			type: UPDATE_VEHICLE_STATUS,
			payload: {
				infoStatus: status
			}
		}
	}
}
