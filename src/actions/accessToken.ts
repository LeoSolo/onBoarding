export const SAVE_ACCESS_TOKEN = 'SAVE_ACCESS_TOKEN'

export interface SetAccessTokenAction {
	type: typeof SAVE_ACCESS_TOKEN
	payload: {
		accessToken: string,
		addingToken: string,
		isMobile: boolean
	}
}

export type AccessTokenAction = SetAccessTokenAction

export class Actions {
	static setAccessToken(accessToken: string, addingToken: string, isMobile: boolean = false): SetAccessTokenAction {
		return {
			type: SAVE_ACCESS_TOKEN,
			payload: {
				accessToken: accessToken,
				addingToken: addingToken,
				isMobile: isMobile
			}
		}
	}
}
