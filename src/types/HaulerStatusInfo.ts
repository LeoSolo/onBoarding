import { HaulerInfoStatus } from './enum'
export interface HaulerStatusInfo {
    haulerStatus: HaulerInfoStatus,
    driverLicenseStatus: HaulerInfoStatus,
    vehicleStatus: HaulerInfoStatus,
    bankingInfoStatus?: HaulerInfoStatus
}
