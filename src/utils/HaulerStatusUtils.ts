import { HaulerAccountStatus as Status, HaulerAccountStatus } from '../types/enum/HaulerAccountStatus'
import { HaulerInfo } from '../types'
import { HaulerAccountSubStatuses } from '../types/enum'

export class HaulerStatusUtils {
    public static isHaulerApproved(haulerStatus?: Status) {
        switch (haulerStatus) {
            case Status.HAULER_ACTIVE:
            case Status.HAULER_SUSPENDED: {
                return true
            }
            default: {
                return false
            }
        }
    }

    public static isHaulerProvideBankingInfo(haulerInfo: HaulerInfo) {
        return (haulerInfo.status === HaulerAccountStatus.HAULER_ACTIVE && haulerInfo.stripeStatus)
    }
}
