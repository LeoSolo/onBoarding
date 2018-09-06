import { Auth } from 'aws-amplify'
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js'

import { store } from '../../index'

import * as Types from '../../types/auth'
import { password } from '../../utils/validation/Validators'

export async function signIn(credentials: Types.Credentials) {
    let user: CognitoUser = await Auth.signIn(credentials.login, credentials.password)
    console.log(user)
}

export function getCurrentToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (store.getState() && store.getState().accessToken && store.getState().accessToken.isMobile) {
            let token = store.getState().accessToken.accessToken
            resolve(token)
        } else {
            Auth.currentSession().
                then((session: CognitoUserSession) => {
                    resolve(session.getIdToken().getJwtToken())
                })
                .catch(err => reject(err))
        }
    })
}

export async function signOut() {
    return Auth.signOut()
}

export async function forgotPassword(userLogin: string) {
    return Auth.forgotPassword(userLogin)
}

export async function changePassword(userLoging: string, code: string, newPassword: string) {
    return Auth.forgotPasswordSubmit(userLoging, code, newPassword)
}
