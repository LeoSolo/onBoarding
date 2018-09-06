export enum EnvironmentType {
	DEV = 'development',
	STAGE = 'stage',
    PROD = 'production'
}

export function getCurrentEnvironment(): EnvironmentType {
    switch (process.env.NODE_ENV) {
        case 'development': {
            return EnvironmentType.DEV
        }
        case 'production': {
            return EnvironmentType.PROD
		}
		case 'stage': {
			return EnvironmentType.STAGE
		}
        default: {
            return EnvironmentType.DEV
        }
    }
}
