import { combineReducers } from 'redux'
import { routerReducer, RouterState } from 'react-router-redux'
import { BankInfoState, bankInfoReducer } from './bankInfo'
import { AccessTokenState, accessTokenReducer } from './accessToken'
import { MSAState, msaReducer } from './msa'
import { PersonalInfoState, personalInfoReducer } from './personalInfo'
import { VehicleState, vehicleReducer } from './vehicle'
import { DriverLicenseState, driverLicenseReducer } from './license'
import { ServiceInfoState, serviceInfoReducer } from './service'
import { TabState, tabReducer } from './tab'

import { CLEAN_ALL } from '../actions/store'

export interface StoreState {
    routing: RouterState
    bankInfo: BankInfoState
	accessToken: AccessTokenState
    msa: MSAState
    serviceInfo: ServiceInfoState
    vehicleInfo: VehicleState,
    personalInfo: PersonalInfoState,
    driverLicense: DriverLicenseState
    tab: TabState
}

const innerReducers = combineReducers<StoreState>({
    routing: routerReducer,
    bankInfo: bankInfoReducer,
	accessToken: accessTokenReducer,
    msa: msaReducer,
    serviceInfo: serviceInfoReducer,
    vehicleInfo: vehicleReducer,
    personalInfo: personalInfoReducer,
    driverLicense: driverLicenseReducer,
    tab: tabReducer
})

export const reducers = (state, action) => {
    if (action.type === CLEAN_ALL) {
        state = {
            routing: state.routing
        }
    }

    return innerReducers(state, action)
}
