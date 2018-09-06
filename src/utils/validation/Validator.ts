export type Validator = ((value: any) => string | any)

/**
 * Validator factory
 * @param testFunction takes input value and validate it returns true in case of valid value
 * @param errorMessage message returned by validator in case of invalid value
 * @returns Validator function
 */
export function createValidator(testFunction: (value: any) => boolean, errorMessage: string): Validator {
    return (value: any) => { return !testFunction(value) ? errorMessage : undefined }
}

/**
 * Compose validators to one. Resulted validator will pass value through
 * the input validators in exact order before first error value
 * @param validators array of valid Validators
 * @returns Validator function
 */
export function composeValidators(validators: Validator[]): Validator {
    return (value: any) => {
        let commonResult: any = undefined
        for (let validator of validators) {
            let result = validator(value)
            if (result && result.length > 0) {
                commonResult = result
                break
            }
        }
        return commonResult ? commonResult : undefined
    }
}
