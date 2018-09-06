import { EnvironmentType } from '../EnvironmentType'
import * as RequestInterceptor from './Request'
import * as ResponseInterceptor from './Response'

export class InterceptorsConfig {
    static apply(env: EnvironmentType) {
        RequestInterceptor.default(env)
        ResponseInterceptor.default(env)
    }
}
