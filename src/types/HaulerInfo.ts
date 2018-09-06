import { HaulerInfoStatus } from './enum/HaulerInfoStatus'
import { HaulerAccountStatus } from './enum/HaulerAccountStatus'
import { HaulerType } from './enum/HaulerType'
import { HaulerAccountSubStatuses, StripeStatus } from './enum'

export interface DriverLicenseInfo {
    state?: string
    number?: string
    expirationDate?: number
    frontPictures?: string
    backPictures?: string
    infoStatus?: HaulerInfoStatus
}

export interface VehicleInfo {
    brand?: string
    model?: string
    year?: number
    profile?: string
    pictureA?: string
    pictureB?: string
    pictureC?: string
    pictureD?: string
    infoStatus?: HaulerInfoStatus
}

export interface HaulerInfo {
    status?: HaulerAccountStatus
    companyId?: string
    type?: HaulerType
    firstName?: string
    lastName?: string
    mailingAddress?: string
    primaryPhone?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    birthday?: number
    avatar?: string
    infoStatus?: HaulerInfoStatus
    subStatus?: HaulerAccountSubStatuses
    stripeStatus?: StripeStatus
}
