import { AttachmentType } from './enum'

export interface AttachmentCreate {
    type: AttachmentType
    ownerId: string
    overwrite: boolean
}
