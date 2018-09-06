import { Validator } from './Validator'

/**
 * Validator on empty value
 * If input value is a string then value will be trimmed before test
 * @param value input value
 * @returns 'empty' if value is invalid
 */
export const empty: Validator = (value: any) => {
    return !value ? 'empty' : (typeof value === 'string' ? (!(value.trim()) ? 'empty' : undefined) : undefined)
}

const emailPattern = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,6}\.)?[a-z]{2,6}$/i
export const email: Validator = (value: string) => {
    return !value ? 'email' : (emailPattern.test(value) ? undefined : 'email')
}

const phonePattern = /^(((\+1)?(([0-9]{10})|(\([0-9]{3}\)[0-9]{3}(\-?)[0-9]{4})))|((\+1 )?((([0-9]{3}) ([0-9]{3}) ([0-9]{4}))|(\([0-9]{3}\) [0-9]{3}( |\-)[0-9]{4}))))$/i
export const phone: Validator = (value: any) => {
    return !value ? 'phone' : (phonePattern.test(value) ? undefined : 'phone')
}

// const namePattern = /^[a-zA-Z][a-zA-Z\' 0-9\.\-]*$/i
export const name: Validator = (value: any) => {
    let result = empty(value)
    return result ? 'name' : undefined
}

const zipCodePattern = /^[0-9]{5}$/i
export const zipCode: Validator = (value: any) => {
    return !value ? 'zip' : (zipCodePattern.test(value) ? undefined : 'zip')
}

const passwordPattern = /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%,.^&*()]*$/
export const password: Validator = (value: any) => {
    return !value ? 'pass' : (passwordPattern.test(value) ? undefined : 'pass')
}

const licenseNumberPattern = /^[A-Za-z0-9]{1,19}$/
export const license: Validator = (value: any) => {
    return !value ? 'license' : (licenseNumberPattern.test(value) ? undefined : 'license')
}

export const minLength = (length: number) => {
    return (value: string) => {
        return !value || value.length < length ? 'min' : undefined
    }
}

const ssnPattern = /^[0-9]{9}$/
export const ssn: Validator = (value: any) => {
    return !value ? 'ssn' : (ssnPattern.test(value) ? undefined : 'ssn')
}

const einPattern = /^[0-9]{9}$/
export const ein: Validator = (value: any) => {
    return !value ? 'ein' : (einPattern.test(value) ? undefined : 'ein')
}

const ssn4Pattern = /^[0-9]{4}$/
export const ssn4: Validator = (value: any) => {
	return !value ? 'ssn4' : (ssn4Pattern.test(value) ? undefined : 'ssn4')
}

const verificationCodePattern = /^[0-9]+$/
export const verificationCode: Validator = (value: any) => {
    return !value ? 'vc' : (verificationCodePattern.test(value) ? undefined : 'vc')
}
