import { getCurrentEnvironment, EnvironmentType } from '../../diagnostics/EnvironmentType'

export class EndpointNames {
    public static POST_MESSAGE = 'post-message'
    public static HAULER_SERVICE = 'hauler-service'
    public static ATTACHMENT_SERVICE = 'attachment-service'
    public static MSA_SERVICE = 'msa-service'
    public static PAYMENT_SERVICE = 'payment-service'
}

let PROD_ENDPOINTS_MAP: Map<string, string> = new Map<string, string>()
PROD_ENDPOINTS_MAP.set(EndpointNames.POST_MESSAGE, 'https://gotrashy.staging.wpengine.com/')
PROD_ENDPOINTS_MAP.set(EndpointNames.HAULER_SERVICE, 'https://1q509vq6ji.execute-api.us-west-2.amazonaws.com/prod')
PROD_ENDPOINTS_MAP.set(EndpointNames.ATTACHMENT_SERVICE, 'https://lfy517rxb7.execute-api.us-west-2.amazonaws.com/prod')
PROD_ENDPOINTS_MAP.set(EndpointNames.MSA_SERVICE, 'https://fdvwk1p3s9.execute-api.us-west-2.amazonaws.com/prod')
PROD_ENDPOINTS_MAP.set(EndpointNames.PAYMENT_SERVICE, 'https://9lpm7zr9sb.execute-api.us-west-2.amazonaws.com/prod')

let STAGE_ENDPOINTS_MAP: Map<string, string> = new Map<string, string>()
STAGE_ENDPOINTS_MAP.set(EndpointNames.POST_MESSAGE, 'https://gotrashy.staging.wpengine.com/')
STAGE_ENDPOINTS_MAP.set(EndpointNames.HAULER_SERVICE, 'https://7lhc87foh6.execute-api.us-west-2.amazonaws.com/stage')
STAGE_ENDPOINTS_MAP.set(EndpointNames.ATTACHMENT_SERVICE, 'https://b38jp3dkab.execute-api.us-west-2.amazonaws.com/stage')
STAGE_ENDPOINTS_MAP.set(EndpointNames.MSA_SERVICE, 'https://a3u1jxgthj.execute-api.us-west-2.amazonaws.com/stage')
STAGE_ENDPOINTS_MAP.set(EndpointNames.PAYMENT_SERVICE, 'https://9obyvdyq1m.execute-api.us-west-2.amazonaws.com/stage')

let DEV_ENDPOINTS_MAP: Map<string, string> = new Map<string, string>()
DEV_ENDPOINTS_MAP.set(EndpointNames.POST_MESSAGE, 'https://gotrashy.staging.wpengine.com/')
DEV_ENDPOINTS_MAP.set(EndpointNames.HAULER_SERVICE, 'https://j9iljjljjc.execute-api.us-west-2.amazonaws.com/dev')
DEV_ENDPOINTS_MAP.set(EndpointNames.ATTACHMENT_SERVICE, 'https://qyqn8mut04.execute-api.us-west-2.amazonaws.com/dev')
DEV_ENDPOINTS_MAP.set(EndpointNames.MSA_SERVICE, 'https://2cybwcme8f.execute-api.us-west-2.amazonaws.com/dev')
DEV_ENDPOINTS_MAP.set(EndpointNames.PAYMENT_SERVICE, 'https://cj63snhqfk.execute-api.us-west-2.amazonaws.com/dev')

export const ENDPOINTS_MAP = getCurrentEnvironment() === EnvironmentType.PROD
	? PROD_ENDPOINTS_MAP
	: (getCurrentEnvironment() === EnvironmentType.STAGE
		? STAGE_ENDPOINTS_MAP
		: DEV_ENDPOINTS_MAP
	  )
