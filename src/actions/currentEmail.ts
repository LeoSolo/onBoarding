export const SAVE_CURRENT_EMAIL = 'SAVE_CURRENT_EMAIL'

export interface SetCurrentEmailAction {
    type: typeof SAVE_CURRENT_EMAIL,
    payload: {
        currentEmail: string
    }
}
export type CurrentEmailActions = SetCurrentEmailAction

export function setCurrentEmail(
    currentEmail: string
): SetCurrentEmailAction {
    return {
        type: SAVE_CURRENT_EMAIL,
        payload: {
            currentEmail: currentEmail
        }
    }
}
