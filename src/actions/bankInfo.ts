export const BANK_INFO_PROVIDED = 'BANK_INFO_PROVIDED'

export interface SetBankInfoProvidedAction {
	type: typeof BANK_INFO_PROVIDED,
	payload: {
		isProvided: boolean
	}
}

export type BankInfoAction = SetBankInfoProvidedAction

export class Actions {
	static setBankInfoProvided(isProvided: boolean): SetBankInfoProvidedAction {
		return {
			type: BANK_INFO_PROVIDED,
			payload: {
				isProvided: isProvided
			}
		}
	}
}
