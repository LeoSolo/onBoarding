export interface HaulerRegisterResult {
    error?: {
        code?: string
    }
    AuthenticationResult?: {
        IdToken: string
        AccessToken: string
    }
}
