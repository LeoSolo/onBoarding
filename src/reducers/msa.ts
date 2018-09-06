import { MSA } from '../types'
import { MSAAction, SET_ADJACENT_MSA, ADD_MSA, CLEAN_MSA } from '../actions/msa'

export interface MSAState {
    adjacentMSA: MSA[]
}

const initialState: MSAState = {
    adjacentMSA: []
}

export function msaReducer(state: MSAState = initialState, action: MSAAction) {
    switch (action.type) {
        case SET_ADJACENT_MSA: {
            return {
                ...state,
                adjacentMSA: action.payload.msa
            }
        }
        case ADD_MSA: {
            let prevMSA = state.adjacentMSA.slice()
            prevMSA.push(action.payload.msa)
            return {
                ...state,
                adjacentMSA: prevMSA
            }
        }
        case CLEAN_MSA: {
            return {
                ...state,
                adjacentMSA: []
            }
        }
        default: {
            return state
        }
    }
}
