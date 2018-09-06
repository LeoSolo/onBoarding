import { HaulerInfo } from './HaulerInfo'
import { MSA } from './MSA'
import { MSAStatus } from './enum/MSAStatus'

export interface HaulerMSAInfo {
    active: boolean
    hauler: HaulerInfo
    haulerId: string
    modifyDate: number
    msa: MSA
    msaId: string
    status: MSAStatus
}
