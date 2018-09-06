import { getCurrentEnvironment, EnvironmentType } from '../../diagnostics/EnvironmentType'

export const STRIPE_TEST_PUBLISH_KEY = getCurrentEnvironment() === EnvironmentType.PROD
	? 'pk_live_J7issIHHe1mlzrTFmQ5HRslX'
	: 'pk_test_DnkPTn4kBpW7S9Rk6jQYVaSw'
