import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { RouterAction, routerActions } from 'react-router-redux'
import * as classnames from 'classnames'

import { LoadingSpinner } from '../components/LoadingSpinner'
import { PasswordChecker } from '../components/PasswordChecker'

import * as Auth from '../services/auth/auth'

import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'
import * as StringUtils from '../utils/StringUtils'

import { StoreState } from '../reducers'

import { ROUTES } from '../constants/routes'

import '../styles/AuthContainer.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface ForgotPasswordProps {
    routePush: (location: string) => RouterAction
}

enum FormFields {
    UserEmail = 'userEmail',
    VerificationCode = 'verificationCode',
    Password = 'password',
    ConfirmPassword = 'confirmPassword'
}

interface FormType {
    [FormFields.UserEmail]: FieldValidatedValue
    [FormFields.VerificationCode]: FieldValidatedValue
    [FormFields.Password]: FieldValidatedValue
    [FormFields.ConfirmPassword]: FieldValidatedValue
}

interface ForgotPasswordState {
    form: FormType
    isLoading: boolean
    fieldsError: boolean
    error: boolean
    errorText?: string
    isLoginConfirmed: boolean
    passwordChecked: boolean
}

class ForgotPassword extends React.Component<ForgotPasswordProps, ForgotPasswordState> {

    private formValidator: FormValidator<FormType>

    constructor(props) {
        super(props)
        this.formValidator = this.initForm()
        this.state = {
            form: this.formValidator.values(),
            fieldsError: false,
            isLoading: false,
            error: false,
            errorText: '',
            isLoginConfirmed: false,
            passwordChecked: false
        }
    }

    submit = (e: any) => {
        e.preventDefault()
        this.formValidator.validate()
        this.setState({
            form: this.formValidator.values(),
            fieldsError: !this.formValidator.isValid(),
            errorText: this.formValidator.getError()
        }, () => {
            if (!this.state.fieldsError && !this.state.isLoginConfirmed) {
                this.setState({
                    isLoading: true
                })
                Auth.forgotPassword(this.state.form[FormFields.UserEmail].value.toLowerCase().trim())
                .then(response => {
                    console.log(response)
                    this.formValidator = this.initForm()
                    this.formValidator.setState([{
                        name: FormFields.UserEmail,
                        value: this.state.form[FormFields.UserEmail].value
                    }])
                    this.setState({
                        isLoading: false,
                        isLoginConfirmed: true,
                        form: this.formValidator.values()
                    })
                })
                .catch(error => {
                    console.log(error)
                    this.setState({
                        isLoading: false,
                        error: true,
                        errorText: error.message ? error.message : error.toString()
                    })
                })
            }
        })
    }

    onChange = e => {
        this.formValidator.setState([{
            name: e.target.name,
            value: e.target.value
        }])
        this.setState({
            form: this.formValidator.values(),
            fieldsError: !this.formValidator.isValid(),
            errorText: this.formValidator.getError()
        })
    }

    onPasswordCheckerChange = (result: boolean) => {
        this.setState({
            passwordChecked: result
        })
    }

    changePassword = (e: any) => {
        e.preventDefault()
        this.formValidator.validate()
        this.setState({
            form: this.formValidator.values(),
            fieldsError: !this.formValidator.isValid(),
            errorText: this.formValidator.getError()
        }, () => {
            if (!this.state.fieldsError && this.state.isLoginConfirmed) {
                this.setState({
                    isLoading: true
                })
                let userEmail = this.state.form[FormFields.UserEmail].value ? this.state.form[FormFields.UserEmail].value : ''
                let code = this.state.form[FormFields.VerificationCode].value ? this.state.form[FormFields.VerificationCode].value : ''
                let password = this.state.form[FormFields.Password].value ? this.state.form[FormFields.Password].value : ''
                Auth.changePassword(userEmail, code, password)
                .then(() => {
                    this.props.routePush(ROUTES.AUTH)
                })
                .catch(error => {
                    console.log(error)
                    this.setState({
                        isLoading: false,
                        error: true,
                        errorText: error.message ? error.message : error.toString()
                    })
                })
            }
        })
    }

    render() {
        return (
            <div className="scrollable">
                <LoadingSpinner show={this.state.isLoading} />

                <div className="tabTitle">
                    <h1 className="title">{StringResources.getString(Strings.ForgotPassword.Title)}</h1>
                    {!this.state.isLoginConfirmed && <p className="description">{StringResources.getString(Strings.ForgotPassword.SubTitle.EmailWaiting)}</p>}
                    {this.state.isLoginConfirmed && <p className="description">{StringResources.getString(Strings.ForgotPassword.SubTitle.VerificationCodeWaiting)}</p>}
                </div>
                {
                    !this.state.isLoginConfirmed && (
                        <div>
                            <form className="authContainer" onSubmit={this.submit}>
                                <input
                                    type="text"
                                    name={FormFields.UserEmail}
                                    value={this.state.form[FormFields.UserEmail].value}
                                    placeholder={StringResources.getString(Strings.ForgotPassword.Inputs.Email.placeholder)}
                                    onChange={this.onChange}
                                    className={classnames({
                                        error: this.state.form[FormFields.UserEmail].error,
                                        success: !this.state.form[FormFields.UserEmail].error && this.state.form[FormFields.UserEmail].touched
                                    })}
                                />
                                <div className="separatorDiv h30"/>
                                <div className="row right justify-center-xs">
                                    <button className="btn normal" type="submit" onClick={this.submit}>{StringResources.getString(Strings.ForgotPassword.Buttons.Submit.title)}</button>
                                </div>
                            </form>
                        </div>
                    )
                }
                {
                    this.state.isLoginConfirmed && (
                        <div>
                            <form className="authContainer" onSubmit={this.changePassword}>
                                <input
                                    type="text"
                                    name={FormFields.UserEmail}
                                    value={this.state.form[FormFields.UserEmail].value}
                                    disabled={true}
                                />
                                <input
                                    type="text"
                                    className={classnames({
                                        error: this.state.form[FormFields.VerificationCode].error,
                                        success: !this.state.form[FormFields.VerificationCode].error && this.state.form[FormFields.VerificationCode].touched
                                    })}
                                    name={FormFields.VerificationCode}
                                    placeholder={StringResources.getString(Strings.ForgotPassword.Inputs.VerificationCode.placeholder)}
                                    value={this.state.form[FormFields.VerificationCode].value}
                                    onChange={this.onChange}
                                />
                                <input
                                    type="password"
                                    name={FormFields.Password}
                                    className={classnames({
                                        success: this.state.passwordChecked
                                    })}
                                    placeholder={StringResources.getString(Strings.ForgotPassword.Inputs.Password.placeholder)}
                                    value={this.state.form[FormFields.Password].value}
                                    onChange={this.onChange}
                                />
                                <input
                                    type="password"
                                    name={FormFields.ConfirmPassword}
                                    className={classnames({
                                        success: this.state.passwordChecked
                                    })}
                                    placeholder={StringResources.getString(Strings.ForgotPassword.Inputs.ConfirmPassword.placeholder)}
                                    value={this.state.form[FormFields.ConfirmPassword].value}
                                    onChange={this.onChange}
                                />

                                <div className="passwordCheckerContainer">
                                    <div>
                                        <div className="passwordCheckerContainerTitle">
                                            {StringResources.getString(Strings.ForgotPassword.PasswordRequirement.title)}
                                        </div>
                                        <PasswordChecker
                                            password={this.state.form[FormFields.Password].value}
                                            confirmPassword={this.state.form[FormFields.ConfirmPassword].value}
                                            onChange={this.onPasswordCheckerChange}
                                        />
                                    </div>
                                </div>
                                <div className="separatorDiv h30"/>
                                <div className="row center justify-center-xs">
                                    <button
                                        className={classnames('btn normal', { disabled: !this.state.passwordChecked || this.state.fieldsError })}
                                        onClick={this.changePassword}
                                        disabled={!this.state.passwordChecked || this.state.fieldsError}
                                    >
                                        {StringResources.getString(Strings.ForgotPassword.Buttons.ChangePassword.title)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                }
                <div className={classnames('alertMessage', { active: StringUtils.isNotEmpty(this.state.errorText) && (this.state.error || this.state.fieldsError) })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate,this.state.errorText)}
		        </div>
            </div>
        )
    }

    private initForm = () => {
        return new FormValidator<FormType>([
            {
                name: FormFields.UserEmail,
                value: '',
                validator: Validators.email,
                messages: {
                    email: StringResources.getString(Strings.ForgotPassword.Errors.Messages.WrongEmail)
                }
            },
            {
                name: FormFields.VerificationCode,
                value: '',
                validator: (value) => {
                    return this.state.isLoginConfirmed ? Validators.verificationCode(value) : undefined
                },
                messages: {
                    vc: StringResources.getString(Strings.ForgotPassword.Errors.Messages.VerificationCodeIncorrect)
                }
            },
            {
                name: FormFields.Password,
                value: '',
                validator: (_) => undefined
            },
            {
                name: FormFields.ConfirmPassword,
                value: '',
                validator: (_) => undefined
            }

        ])
    }

}

function mapStateToProps(state: StoreState) {
    return {}
}

function mapDispatchToProps(dispatch: Dispatch<RouterAction>) {
    return {
        routePush: (location: string) => dispatch(routerActions.push(location))
    }
}

export const ForgotPasswordContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ForgotPassword)
