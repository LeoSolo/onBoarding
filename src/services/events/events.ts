import * as ApiConf from '../../config/api'

export enum EventType {
    HO_CANT_BE_GRANTED = 'HaulerOnboardingCannotBeGranted',
    NEW_HAULER_GET_STARTED = 'NewHaulerGettingStarted',
    HAULER_OVERVIEW_TAB_ACTIVATED = 'HaulerOverviewTabActivated',
    HAULER_DRIVER_LICENSE_TAB_ACTIVATED = 'HaulerDriversLicenseTabActivated',
    HAULER_PERSONAL_INFO_TAB_ACTIVATED = 'HaulerPersonalInformationTabActivated',
    HAULER_TERRITORY_TAB_ACTIVATED = 'HaulerTerritoryTabActivated',
    HAULER_BANKING_TAB_ACTIVATED = 'HaulerBankingTabActivated',
    HAULER_VEHICLE_INFO_TAB_ACTIVATED = 'HaulerVehicleInformationTabActivated',
    LOGIN_PAGE_LOADED = 'LoginPageLoaded',
    EXISTED_HAULER_AUTHENTICATED = 'ExistingHaulerAuthenticated',
    AUTHENTICATION_FAILED = 'AuthenticationFailed'

}

export class EventService {
    static pushEvent(event: EventType) {
        if (window !== top) {
            let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.POST_MESSAGE)
            if (!endpoint) {
                console.log('Invalid endpoint used: ', endpoint)
                return
            }
            top.postMessage(event, endpoint)
        } else {
            console.log('Try to send event: \'' + event + '\' to self')
        }
    }
}
