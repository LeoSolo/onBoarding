import { OverviewTab } from '../constants/overviewTabs'
import { TabAction, SELECT_TAB, START_LOADING, END_LOADING } from '../actions/tab'

export interface TabState {
    currentTab: OverviewTab,
    isLoading: boolean
}

const initialState: TabState = {
    currentTab: OverviewTab.APP_OVERVIEW_TAB,
    isLoading: false
}

export function tabReducer(state: TabState = initialState, action: TabAction): TabState {
    switch (action.type) {
        case SELECT_TAB: {
            return {
                ...state,
                currentTab: action.payload.tab
            }
        }
        case START_LOADING: {
            return {
                ...state,
                isLoading: true
            }
        }
        case END_LOADING: {
            return {
                ...state,
                isLoading: false
            }
        }
        default: {
            return state
        }
    }
}
