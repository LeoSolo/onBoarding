import axios from 'axios'
import { merge } from 'lodash'

import * as Types from '../../types'

import * as Auth from '../auth/auth'

import * as ApiConf from '../../config/api'

enum Method {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT'
}

export class Api {

    public static async requestAdditionalTerritory(msaId: string) {
        let path = `/haulers/territories/${msaId}/request`
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.authCall<any>(`${endpoint}${path}`, Method.POST)
    }

    public static async checkHaulerEmail(haulerInfo: Types.HaulerCheckEmail) {
        let path = '/haulers/check'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.call<any>(`${endpoint}${path}`, Method.PUT, {}, haulerInfo)
    }

    public static async updatePaymentInfo(paymentInfo: Types.PaymentInfo) {
        let path = '/payment-service/hauler-account'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.PAYMENT_SERVICE)
        return this.authCall<any>(`${endpoint}${path}`, Method.PUT, {}, paymentInfo)
    }

    public static async getAdjacentMSA(haulerId: string) {
        let path = encodeURI(`/msa/adjacent/${haulerId}`)
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.MSA_SERVICE)
        return this.authCall<Types.MSA[]>(`${endpoint}${path}`)
    }

    public static async getMSA(msaId: string) {
        let path = `/msa/${msaId}`
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.MSA_SERVICE)
        return this.authCall<Types.MSA>(`${endpoint}${path}`)
    }

    public static async getHaulerMSA(haulerId: string) {
        let path = encodeURI(`/haulers/${haulerId}/territories`)
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.authCall<Types.HaulerMSAInfo[]>(`${endpoint}${path}`)
    }

    public static async updateHaulerInfo(haulerInfo: Types.HaulerOverviewInfo) {
        let path = '/haulers'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.authCall<any>(`${endpoint}${path}`, Method.PUT, {}, haulerInfo)
    }

    public static async attachBlob(url: string, blob: any) {
        return this.call(url, Method.PUT, {
            headers: {
                'content-type': ' '
            }
        }, blob)
    }

    public static async requestAttachmentUrl(attachmentOwnerInfo: Types.AttachmentCreate): Promise<Types.AttachmentUrl> {
        let path = '/attachments'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.ATTACHMENT_SERVICE)
        return this.authCall<Types.AttachmentUrl>(`${endpoint}${path}`, Method.POST, {}, attachmentOwnerInfo)
    }

    public static async loadHaulerOverview(): Promise<Types.HaulerOverviewInfo> {
        let path = '/haulers/'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.authCall<Types.HaulerOverviewInfo>(`${endpoint}${path}`)
    }

    public static async changePassword(changePasswordInfo: Types.ChangePasswordInfo, accessToken: string): Promise<any> {
        let path = '/haulers/change_password'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.call<any>(`${endpoint}${path}`, Method.PUT, { headers: { Authorization: accessToken } }, changePasswordInfo)
    }

    public static async registerHauler(registerInfo: Types.HaulerRegisterInfo): Promise<Types.HaulerRegisterResult> {
        let path = '/haulers/'
        let endpoint = ApiConf.ENDPOINTS_MAP.get(ApiConf.EndpointNames.HAULER_SERVICE)
        return this.call<Types.HaulerRegisterResult>(`${endpoint}${path}`, Method.POST, {}, registerInfo)
    }

    private static async call<T>(url: string, method: Method = Method.GET, options = {}, data: any | null = null): Promise<T> {
        return axios(merge({
            url: url,
            method: method,
            data: data
        }, options)).then(result => {
            return result.data as T
        })
    }

    private static async authCall<T>(url: string, method: Method = Method.GET, options = {}, data: any | null = null): Promise<T> {
        let token = await Auth.getCurrentToken()
        let callConfig = merge({
            url: url,
            method: method,
            data: data,
            headers: {
                Authorization: token
            }
        }, options)
        try {
            return await axios(callConfig).then(result => {
                return result.data as T
            })
        } catch (error) {
            if (error && error.response && error.response.status === 401) {
                token = await Auth.getCurrentToken()
                callConfig.headers.Authorization = token
                return axios(callConfig).then(result => {
                    return result.data as T
                })
            }
            throw error
        }
    }
}
