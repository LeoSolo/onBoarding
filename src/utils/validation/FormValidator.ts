import { Validator } from './Validator'
import { Masker } from '../masker/Masker'

export type Form = any

export interface FieldValidatedValue {
    masked: any,
    value: any,
    error: boolean,
    touched: boolean,
    errorText?: string
}

export interface FieldInfo {
    name: string
    value?: any
    masked?: any
    validator: Validator
    onPostValidation?: (value: any) => void
    messages?: any
    error?: boolean
    errorText?: string
    showError?: boolean
    touched?: boolean
    masker?: Masker
    passMaskedToValidation?: boolean
}

export interface FieldValue {
    name: string,
    value: any,
}

export class FormValidator<T> {

    private fields: FieldInfo[]

    constructor(fields: FieldInfo[]) {
        this.setFields(fields)
    }

    public setFields(fields: FieldInfo[]) {
        this.fields = fields
        for (let field of fields) {
            if (field.masker && !field.masked) {
                field.masked = field.value ? field.masker.mask(field.value) : field.value
            }
        }
    }

    public setState(values: FieldValue[], showError: boolean = false) {
        for (let value of values) {
            let field = this.findField(value.name)
            if (field.showError && !field.value && !field.error) {
                field.showError = false
            }
            let unmaskedValue = value.value
            let maskedValue = value.value
            if (field.masker) {
                unmaskedValue = field.masker.unmask(unmaskedValue)
                maskedValue = field.masker.mask((unmaskedValue !== undefined && unmaskedValue !== null) ? unmaskedValue : value.value)
            }
            field.masked = maskedValue
            field.value = unmaskedValue
            this.validateField(field, false, showError)
        }
    }

    public values(): T {
        let result = {}
        for (let field of this.fields) {
            result[field.name] = {
                masked: field.masked,
                value: field.value,
                error: field.error,
                errorText: field.errorText,
                touched: field.touched
            }
        }
        return result as T
    }

    public value(name: string) {
        let field = this.findField(name)
        return field
    }

    public validate(name: string | any = undefined, onPost: boolean = false) {
        if (name) {
            let field = this.findField(name)
            if (field) {
                this.validateField(field, onPost, true)
            }
        } else {
            for (let field of this.fields) {
                this.validateField(field, onPost, true)
            }
        }
    }

    public validateField(field: FieldInfo, onPost: boolean = false, showError: boolean) {
        if (field.validator) {
            field.touched = true
            let result = field.validator(field.passMaskedToValidation ? field.masked : field.value)
            if (result) {
                field.error = true
                field.errorText = this.getMessage(field.messages, result)
                field.showError = field.showError || showError
            } else {
                field.error = false
                field.showError = showError
            }
        }
        if (field.onPostValidation && !onPost) {
            field.onPostValidation(field.passMaskedToValidation ? field.masked : field.value)
        }
    }

    public isValid() {
        for (let field of this.fields) {
            if (field.error) {
                return false
            }
        }
        return true
    }

    public getError() {
        for (let field of this.fields) {
            if (field.error && field.errorText && field.showError) {
                return field.errorText
            }
        }
        return undefined
    }

    private findField(name: string): FieldInfo | any {
        for (let field of this.fields) {
            if (field.name === name) {
                return field
            }
        }
        return undefined
    }

    private getMessage(messages: any, validationResult: string) {
        if (messages && messages[validationResult]) {
            return messages[validationResult]
        }
        return undefined
    }
}
