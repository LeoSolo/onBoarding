export const CLEAN_ALL = 'CLEAN_ALL'

interface CleanAllStateAction {
    type: typeof CLEAN_ALL
}

export type ActionType = CleanAllStateAction

export class Actions {
    static cleanAll(): CleanAllStateAction {
        return {
            type: CLEAN_ALL
        }
    }
}
