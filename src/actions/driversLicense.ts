import { DriverLicenseInfo } from '../types'
import { HaulerInfoStatus } from '../types/enum'

export const UPDATE_DRIVER_LICENSE = 'UPDATE_DRIVE_LICENSE'
export const UPDATE_DRIVER_LICENSE_STATUS = 'UPDATE_DRIVER_LICENSE_STATUS'

interface UpdateDriverLicenseAction {
	type: typeof UPDATE_DRIVER_LICENSE
	payload: DriverLicenseInfo
}

interface UpdateDriversLicenseStatus {
	type: typeof UPDATE_DRIVER_LICENSE_STATUS
	payload: {
		infoStatus?: HaulerInfoStatus
	}
}

export type DriverLicenseAction = UpdateDriverLicenseAction | UpdateDriversLicenseStatus

export class Actions {
	static updateLicenseStatus(status?: HaulerInfoStatus) {
		return {
			type: UPDATE_DRIVER_LICENSE_STATUS,
			payload: {
				infoStatus: status
			}
		}
	}
	static updateLicenseInfo(licenseInfo: DriverLicenseInfo) {
		return {
			type: UPDATE_DRIVER_LICENSE,
			payload: licenseInfo
		}
	}
}
