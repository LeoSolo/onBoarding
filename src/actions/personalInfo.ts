import { HaulerInfo, HaulerMSAInfo } from '../types'
import { HaulerAccountStatus, HaulerInfoStatus, StripeStatus, HaulerAccountSubStatuses } from '../types/enum'

export const UPDATE_PERSONAL_INFO = 'UPDATE_PERSONAL_INFO'
export const SET_HAULER_MSA = 'SET_HAULER_MSA'
export const SET_HAULER_REQUESTED_MSA = 'SET_HAULER_REQUESTED_MSA'
export const UPDATE_PERSONAL_INFO_STATUS = 'UPDATE_HAULER_STATUSES'

interface UpdatePersonalInfoAction {
	type: typeof UPDATE_PERSONAL_INFO
	payload: HaulerInfo
}

interface SetHaulerMSAAction {
	type: typeof SET_HAULER_MSA
	payload: {
		msa: HaulerMSAInfo[]
	}
}

interface SetHaulerRequestedMSAAction {
	type: typeof SET_HAULER_REQUESTED_MSA
	payload: {
		requestedMsa: HaulerMSAInfo[]
	}
}

interface UpdateHaulerStatuses {
	type: typeof UPDATE_PERSONAL_INFO_STATUS
	payload: {
		status?: HaulerAccountStatus
		subStatus?: HaulerAccountSubStatuses
		infoStatus?: HaulerInfoStatus
		stripeStatus?: StripeStatus
	}
}

export type PersonalInfoAction = UpdateHaulerStatuses | UpdatePersonalInfoAction | SetHaulerMSAAction | SetHaulerRequestedMSAAction

export class Actions {

	static updateStatuses(haulerInfo: HaulerInfo): UpdateHaulerStatuses {
		return {
			type: UPDATE_PERSONAL_INFO_STATUS,
			payload: {
				status: haulerInfo.status,
				subStatus: haulerInfo.subStatus,
				infoStatus: haulerInfo.infoStatus,
				stripeStatus: haulerInfo.stripeStatus
			}
		}
	}
	static updatePersonalInfo(haulerInfo: HaulerInfo): UpdatePersonalInfoAction {
		return {
			type: UPDATE_PERSONAL_INFO,
			payload: haulerInfo
		}
	}
	static setHaulerMSA(msa: HaulerMSAInfo[]): SetHaulerMSAAction {
		return {
			type: SET_HAULER_MSA,
			payload: {
				msa: msa
			}
		}
	}
	static setHaulerRequestedMSA(msa: HaulerMSAInfo[]): SetHaulerRequestedMSAAction {
		return {
			type: SET_HAULER_REQUESTED_MSA,
			payload: {
				requestedMsa: msa
			}
		}
	}
}
