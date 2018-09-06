import { EnvironmentType } from '../EnvironmentType'
import axios, { AxiosRequestConfig } from 'axios'

export default function apply(env: EnvironmentType) {
    if (env === EnvironmentType.DEV || env === EnvironmentType.STAGE) {
        axios.interceptors.request.use((request: AxiosRequestConfig) => {
            console.log('Request ', request)
            return request
        }, (error: any) => {
            console.log('Response error: ', error)
            return Promise.reject(error)
        })
    }
}
