import { HaulerInfo, DriverLicenseInfo, VehicleInfo } from './HaulerInfo'

export interface HaulerOverviewInfo extends HaulerInfo {
    driveLicenseInformation?: DriverLicenseInfo
    vehicleInformation?: VehicleInfo
}
