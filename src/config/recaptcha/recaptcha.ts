import { getCurrentEnvironment, EnvironmentType } from '../../diagnostics/EnvironmentType'

export const RECAPTCHA_KEY = getCurrentEnvironment() === EnvironmentType.PROD ? '6LccXlkUAAAAAP1mAvqBlyRkLHg9Nj5VGrPv-Lp1' : '6LexZWEUAAAAAPJky-wwlNXCkQPvqPBoB0-nRKg0'
