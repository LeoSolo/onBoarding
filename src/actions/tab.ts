import { OverviewTab } from '../constants/overviewTabs'

export const SELECT_TAB = 'SELECT_TAB'
export const START_LOADING = 'START_LOADING'
export const END_LOADING = 'END_LOADING'

interface SelectTabAction {
    type: typeof SELECT_TAB,
    payload: {
        tab: OverviewTab
    }
}

interface StartLoadingAction {
    type: typeof START_LOADING
}

interface EndLoadingAction {
    type: typeof END_LOADING
}

export type TabAction = SelectTabAction | StartLoadingAction | EndLoadingAction

export class Actions {
    static selectTab(tab: OverviewTab): SelectTabAction {
        return {
            type: SELECT_TAB,
            payload: {
                tab: tab
            }
        }
    }
    static startLoading(): StartLoadingAction {
        return {
            type: START_LOADING
        }
    }
    static endLoading(): EndLoadingAction {
        return {
            type: END_LOADING
        }
    }
}
