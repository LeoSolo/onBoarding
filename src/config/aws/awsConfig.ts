import { getCurrentEnvironment, EnvironmentType } from '../../diagnostics/EnvironmentType'

const PROD_AWS_CONFIG = {
	Auth: {
		identityPoolId: 'us-west-2:6cdb487b-db1c-46a6-bcfa-ac3af446647c',
		region: 'us-west-2',
		userPoolId: 'us-west-2_lW1PDkVKH',
		userPoolWebClientId: '7td8rvr4g7osbj37lod7m3u684'
	}
}

const STAGE_AWS_CONFIG = {
	Auth: {
		identityPoolId: 'us-west-2:dc24ee63-c401-4b3a-852c-7cb9372a1f36',
		region: 'us-west-2',
		userPoolId: 'us-west-2_1QNIGzhdY',
		userPoolWebClientId: '2fql03oo49mb5cait5m3a1id1e'
	}
}

const DEV_AWS_CONFIG = {
	Auth: {
		identityPoolId: 'us-west-2:5906c7d4-69f5-49cb-8a44-a52b54b495ec',
		region: 'us-west-2',
		userPoolId: 'us-west-2_aDQwGzn4d',
		userPoolWebClientId: '63cun49o60r4lahuig54km9fh9'
	}
}

export const AWS_CONFIG = getCurrentEnvironment() === EnvironmentType.PROD
	? PROD_AWS_CONFIG
	: (getCurrentEnvironment() === EnvironmentType.STAGE
		? STAGE_AWS_CONFIG
		: DEV_AWS_CONFIG
	  )
