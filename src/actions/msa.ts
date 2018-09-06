import { MSA } from '../types'

export const SET_ADJACENT_MSA = 'SET_ADJACENT_MSA'
export const ADD_MSA = 'ADD_MSA'
export const CLEAN_MSA = 'CLEAN_MSA'

export interface SetAdjacentMSAActiion {
    type: typeof SET_ADJACENT_MSA,
    payload: {
        msa: MSA[]
    }
}

export interface AddMSA {
    type: typeof ADD_MSA,
    payload: {
        msa: MSA
    }
}

export interface CleanMSA {
    type: typeof CLEAN_MSA
}

export type MSAAction = SetAdjacentMSAActiion | AddMSA | CleanMSA

export class Actions {
    static setAdjacentMSA(msa: MSA[]): SetAdjacentMSAActiion {
        return {
            type: SET_ADJACENT_MSA,
            payload: {
                msa: msa
            }
        }
    }
    static addMSA(msa: MSA): AddMSA {
        return {
            type: ADD_MSA,
            payload: {
                msa: msa
            }
        }
    }
    static cleanMSA(): CleanMSA {
        return {
            type: CLEAN_MSA
        }
    }
}
