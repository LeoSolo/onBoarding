export const SET_HAULER_INFO_LOADED = 'SET_HAULER_INFO_LOADED'
export const SET_HAULER_INFO_UNLOADED = 'SET_HAULER_INFO_UNLOADED'
export const SET_HAULER_REGISTRATION_IN_PROCESS = 'SET_HAULER_REGISTRATION_IN_PROCESS'
export const SET_HAULER_REGISTRATION_END = 'SET_HAULER_REGISTRATION_END'
export const SET_IGNORE_NO_SLOTS = 'SET_IGNORE_NO_SLOTS'

export interface SetHaulerInfoLoaded {
    type: typeof SET_HAULER_INFO_LOADED
}

export interface SetHaulerInfoUnloaded {
    type: typeof SET_HAULER_INFO_UNLOADED
}

export interface SetHaulerRegistrationInProcess {
    type: typeof SET_HAULER_REGISTRATION_IN_PROCESS
}

export interface SetHaulerRegistrationEnd {
    type: typeof SET_HAULER_REGISTRATION_END
}

export interface SetIgnoreNoSlots {
	type: typeof SET_IGNORE_NO_SLOTS,
	payload: {
		ignore: boolean
	}
}

export type ActionType = SetIgnoreNoSlots | SetHaulerInfoLoaded | SetHaulerInfoUnloaded | SetHaulerRegistrationInProcess | SetHaulerRegistrationEnd

export class Actions {

	static setIgnoreNoSlots(ignore: boolean): SetIgnoreNoSlots {
		return {
			type: SET_IGNORE_NO_SLOTS,
			payload: {
				ignore: ignore
			}
		}
	}

    static setHaulerInfoLoaded(): SetHaulerInfoLoaded {
        return {
            type: SET_HAULER_INFO_LOADED
        }
    }

    static setHaulerInfoUnloaded(): SetHaulerInfoUnloaded {
        return {
            type: SET_HAULER_INFO_UNLOADED
        }
    }

    static setHaulerRegistrationInProcess(): SetHaulerRegistrationInProcess {
        return {
            type: SET_HAULER_REGISTRATION_IN_PROCESS
        }
    }
    static setHaulerRegistrationEnd(): SetHaulerRegistrationEnd {
        return {
            type: SET_HAULER_REGISTRATION_END
        }
    }
}
