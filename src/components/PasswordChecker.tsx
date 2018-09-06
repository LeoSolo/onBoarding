import * as React from 'react'
import * as classnames from 'classnames'

import '../styles/components/PasswordChecker.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

export interface CheckOption {
    id: any
    title: string
    validator: (pass: string, repeatPass?: string) => boolean
    className?: string
}

export interface CheckResult {
    id: any
    result: boolean
}

interface WrappedCheckOption extends CheckOption {
    result: boolean
}

interface PasswordCheckerProps {
    password: string
    confirmPassword?: string
    onChange?: (result: boolean, details?: CheckResult[]) => void
    lengthCheck?: boolean
    minLength?: number
    upperCaseLetterCheck?: boolean
    lowerCaseLetterCheck?: boolean
    numberCheck?: boolean
    specialCharacterCheck?: boolean
    matchCheck?: boolean
    options?: CheckOption[]
}

interface PasswordCheckerState {
    options: WrappedCheckOption[]
}

export class PasswordChecker extends React.Component<PasswordCheckerProps, PasswordCheckerState> {

    static defaultProps: Partial<PasswordCheckerProps> = {
        lengthCheck: true,
        upperCaseLetterCheck: true,
        lowerCaseLetterCheck: true,
        numberCheck: true,
        specialCharacterCheck: false,
        matchCheck: true,
        minLength: 8
    }

    constructor(props) {
        super(props)
        let options: WrappedCheckOption[] = []
        if (this.props.options) {
            this.props.options.forEach(option => {
                options.push({
                    ...option,
                    result: false
                })
            })
        }
        this.initOptions(options)
        this.state = {
            options: options
        }
    }

    componentWillReceiveProps(nextProps: PasswordCheckerProps, nextContext) {
        if (this.props.password !== nextProps.password
            || this.props.confirmPassword !== nextProps.confirmPassword) {
                this.revalidate(nextProps.password, nextProps.confirmPassword, nextProps.onChange)
            }
    }

    revalidate = (password: string, confirmPassword?: string, onChange?: (result: boolean, details?: CheckResult[]) => void) => {
        let options = this.state.options.slice()
        let checkResult: CheckResult[] = []
        let result = true
        options.forEach(option => {
            option.result = option.validator(password, confirmPassword)
            result = result && option.result
            checkResult.push({
                id: option.id,
                result: option.result
            })
        })
        if (onChange) {
            onChange(result, checkResult)
        }
    }

    initOptions(options: WrappedCheckOption[]) {
        let patternValidator = (pattern: RegExp) => {
            return (password: string, repeatPass?: string) => {
                return password ? pattern.test(password) : false
            }
        }
        if (this.props.lengthCheck) {
            options.push({
                id: '@@lengthCheck',
                title: StringResources.getString(Strings.Components.PasswordChecker.Policies.MinLength),
                result: false,
                validator: (password: string, repeatPassword?: string) => {
                    let minLength = this.props.minLength
                    if (!minLength) {
                        minLength = 0
                    }
                    return password ? (password.length >= minLength) : false
                }
            })
        }
        if (this.props.upperCaseLetterCheck) {
            options.push({
                id: '@@upperCaseCheck',
                title: StringResources.getString(Strings.Components.PasswordChecker.Policies.UpperCase),
                result: false,
                validator: patternValidator(/.*[A-Z].*/)
            })
        }
        if (this.props.lowerCaseLetterCheck) {
            options.push({
                id: '@@lowerCaseCheck',
                title: StringResources.getString(Strings.Components.PasswordChecker.Policies.LowerCase),
                result: false,
                validator: patternValidator(/.*[a-z].*/)
            })
        }
        if (this.props.numberCheck) {
            options.push({
                id: '@@numberCheck',
                title: StringResources.getString(Strings.Components.PasswordChecker.Policies.Numbers),
                result: false,
                validator: patternValidator(/.*[0-9].*/)
            })
        }
        if (this.props.specialCharacterCheck) {
            options.push({
                id: '@@specialCharacterCheck',
                title: StringResources.getString(Strings.Components.PasswordChecker.Policies.SpecialCharacters),
                result: false,
                validator: patternValidator(/.*\W.*/)
            })
        }
        if (this.props.matchCheck) {
            options.push({
                id: '@@matchCheck',
                title: StringResources.getString(Strings.Components.PasswordChecker.Policies.PasswordsMustMatch),
                result: false,
                validator: (password: string, repeatPassword?: string) => {
                    return (!password || !repeatPassword) ? false : password === repeatPassword
                }
            })
        }
    }

    renderOption = (option: WrappedCheckOption, key: any) => {
        return (
            <div key={key} className={classnames('optionContainer', option.className)} data-name={option.id}>
                <div className="optionLabel">
                    <div className={classnames('optionCheckbox', { active: option.result })} />
                    <label>{option.title}</label>
                </div>
            </div>
        )
    }

    render() {
        return(
            <div className="passwordChecker">
                {this.state.options.map((option, index) => this.renderOption(option, index))}
            </div>
        )
    }

}
