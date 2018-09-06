import { EnvironmentType } from '../EnvironmentType'
import axios, { AxiosResponse } from 'axios'

export default function apply(env: EnvironmentType) {
    if (env === EnvironmentType.DEV || env === EnvironmentType.STAGE) {
        axios.interceptors.response.use((response: AxiosResponse) => {
            console.log('Response ', response)
            return response
        }, (error: any) => {
            console.log('Response error: ', error)
            return Promise.reject(error)
        })
    }
}
