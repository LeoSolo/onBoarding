import { HaulerInfo, HaulerMSAInfo } from '../types'
import { PersonalInfoAction, UPDATE_PERSONAL_INFO, SET_HAULER_MSA, SET_HAULER_REQUESTED_MSA, UPDATE_PERSONAL_INFO_STATUS } from '../actions/personalInfo'

export interface PersonalInfoState extends HaulerInfo {
    msa?: HaulerMSAInfo[]
    requestedMsa?: HaulerMSAInfo[]
}

const initialState: PersonalInfoState = {
    msa: [],
    requestedMsa: []
}

export function personalInfoReducer(state: PersonalInfoState = initialState, action: PersonalInfoAction) {
    switch (action.type) {
		case UPDATE_PERSONAL_INFO_STATUS: {
			return {
				...state,
				status: action.payload.status,
				subStatus: action.payload.subStatus,
				infoStatus: action.payload.infoStatus,
				stripeStatus: action.payload.stripeStatus
			}
		}
        case UPDATE_PERSONAL_INFO: {
            return {
                ...state,
				...action.payload
            }
        }
        case SET_HAULER_MSA: {
            return {
                ...state,
                msa: action.payload.msa
            }
        }
        case SET_HAULER_REQUESTED_MSA: {
            return {
                ...state,
                requestedMsa: action.payload.requestedMsa
            }
        }
        default: {
            return state
        }
    }
}
