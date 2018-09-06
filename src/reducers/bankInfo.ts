import { BankInfoAction, BANK_INFO_PROVIDED } from '../actions/bankInfo'

export interface BankInfoState {
    bankInfoProvided: boolean
}

const initialState: BankInfoState = {
    bankInfoProvided: false
}

export function bankInfoReducer(state: BankInfoState = initialState, action: BankInfoAction) {
	switch (action.type) {
		case BANK_INFO_PROVIDED: {
			return {
				...state,
                bankInfoProvided: action.payload.isProvided
			}
		}
		default: {
			return state
		}
	}
}
