import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { RouterState, RouterAction, routerActions } from 'react-router-redux'
import * as classnames from 'classnames'
import { StoreState } from '../reducers'
import Select from 'react-select'

import { ActionType as StoreAction, Actions as StoreActions } from '../actions/store'
import { ActionType as ServiceInfoAction, Actions as ServiceInfoActions } from '../actions/service'
import { PersonalInfoAction, Actions as PersonalInfoActions } from '../actions/personalInfo'

import ReCAPTCHA from 'react-google-recaptcha'
import { mockingOptions } from '../mocks/mock'
import { PhoneUtils } from '../utils'
import { ROUTES } from '../constants/routes'

import { LoadingSpinner } from '../components/LoadingSpinner'

import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'
import * as StringUtils from '../utils/StringUtils'
import { Masker } from '../utils/masker/Masker'

import { HaulerInfo } from '../types'

import { ErrorCodes } from '../types/enum'

import { RECAPTCHA_KEY } from '../config/recaptcha'

import { Api } from '../services/api/api'

import '../styles/App.scss'
import { Strings } from '../resources/strings'
import { StringResources } from '../resources/stringResources'

interface GetStartedProps {
	routing: RouterState
	routePush: (path: string) => RouterAction
	setPersonalInfo: (haulerInfo: HaulerInfo) => PersonalInfoAction
	setHaulerRegistrationInProcess: () => ServiceInfoAction
	cleanState: () => StoreAction
}

enum FormFields {
	FirstName = 'firstNameInput',
	LastName = 'lastNameInput',
	Email = 'emailInput',
	Phone = 'phoneInput',
	ZipCode = 'zipCodeInput',
	OwnTruck = 'ownTruckCheckbox',
	Age21 = 'age21',
	BgCheckbox = 'bgCheckCheckbox',
	Captcha = 'captcha',
	HearAbout = 'hearAbout',
	State = 'state'
}

interface FormType {
	[FormFields.FirstName]: FieldValidatedValue
	[FormFields.LastName]: FieldValidatedValue
	[FormFields.Email]: FieldValidatedValue
	[FormFields.Phone]: FieldValidatedValue
	[FormFields.ZipCode]: FieldValidatedValue
	[FormFields.OwnTruck]: FieldValidatedValue
	[FormFields.Age21]: FieldValidatedValue
	[FormFields.BgCheckbox]: FieldValidatedValue
	[FormFields.Captcha]: FieldValidatedValue
	[FormFields.HearAbout]: FieldValidatedValue
	[FormFields.State]: FieldValidatedValue
}

interface GetStartedState {
	form: FormType
	error: boolean
	errorText?: {
		errorCode: InternalErrorCode,
		text?: string
	}
	currentEmail: string
    serverError: boolean
    sending: boolean
	fieldsError: boolean
	stripeAgreementConfirm: boolean
}

enum InternalErrorCode {
	CommonError = 'CommonError',
	HaulerExists = 'HaulerExists'
}

class GetStarted extends React.Component<GetStartedProps, GetStartedState> {

	private formValidator: FormValidator<FormType>

    constructor(props: any) {
		super(props)
		this.formValidator = this.initForm()
        this.state = {
			form: this.formValidator.values(),
        	error: false,
	        currentEmail: '',
            serverError: false,
			sending: false,
			fieldsError: false,
			stripeAgreementConfirm: false
		}
	}

	componentDidMount() {
		this.props.cleanState()
	}

    goAuth = (e: any) => {
		e.preventDefault()
        this.props.routePush(ROUTES.AUTH)
    }

	updateValueWithValidation = (name: string, value: any) => {
		return new Promise(resolve => {
			this.formValidator.setState([{
				name: name,
				value: value
			}])
			this.setState({
				form: this.formValidator.values(),
				fieldsError: !this.formValidator.isValid(),
				errorText: {
					errorCode: InternalErrorCode.CommonError,
					text: this.formValidator.getError()
				},
				serverError: false,
				error: false
			}, () => { resolve() })
		})
	}

	handleSelectChange = (name) => {
		return (newValue) => {
			this.updateValueWithValidation(name, newValue)
		}
	}

    onChange = (e: (React.ChangeEvent<HTMLInputElement> & React.ChangeEvent<HTMLSelectElement>) | (React.FocusEvent<HTMLInputElement>)) => {
		let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
		this.updateValueWithValidation(e.target.name, value)
	}

	validateFields = () => {
		return new Promise((resolve) => {
			this.formValidator.validate()
			this.setState({
				form: this.formValidator.values(),
				fieldsError: !this.formValidator.isValid(),
				errorText: {
					errorCode: InternalErrorCode.CommonError,
					text: this.formValidator.getError()
				},
				serverError: false,
				error: false
			}, () => { resolve() })
		})
	}

	submit = (e: any) => {
		e.preventDefault()
		this.validateFields()
		.then(() => {
			if (!this.state.fieldsError && this.state.form[FormFields.Captcha].value) {
				this.setState({
					sending: true
				})
				let haulerInfo: HaulerInfo = {
					firstName: this.state.form[FormFields.FirstName].value.trim(),
					lastName: this.state.form[FormFields.LastName].value.trim(),
					mailingAddress: this.state.form[FormFields.Email].value.trim(),
					primaryPhone: PhoneUtils.cleanPhoneNumber(this.state.form[FormFields.Phone].value.trim()),
					zip: this.state.form[FormFields.ZipCode].value.trim()
				}
				Api.checkHaulerEmail({
					mailingAddress: haulerInfo.mailingAddress ? haulerInfo.mailingAddress : ''
				})
				.then(() => {
					this.setState({
						sending: false,
						serverError: true
					})
				})
				.catch(error => {
					if (error && error.response && error.response.data && error.response.data.error) {
						let errorData = error.response.data.error
						if (errorData.code === ErrorCodes.ITEM_NOT_FOUND) {
							this.setState({
								sending: false
							})
							this.props.setPersonalInfo(haulerInfo)
							this.props.setHaulerRegistrationInProcess()
							this.props.routePush(ROUTES.LINK_ACC)
						} else {
							if (errorData.code === ErrorCodes.ITEM_ALREADY_EXIST) {
								this.setState({
									sending: false,
									error: true,
									errorText: {
										errorCode: InternalErrorCode.HaulerExists
									}
								})
							} else {
								this.setState({
									sending: false,
									error: true,
									errorText: errorData.description
								})
							}
						}
					} else {
						this.setState({
							sending: false,
							serverError: true
						})
					}
				})
			}
		})
	}
	onHaulerExistsLinkClick = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault()
		this.props.routePush(ROUTES.FORGOT_PASS)
	}
    captchaVerifyCallback = (value) => {
		this.updateValueWithValidation(FormFields.Captcha, true)
    }
    captchaOnExpired = () => {
		this.updateValueWithValidation(FormFields.Captcha, false)
    }
    render() {
	    let selectHearAboutOptions = mockingOptions.hearAbout.map((item: string): Object => {
		    return { label: item, value: item }
	    })

		return (
			<div className="scrollable">
				<LoadingSpinner show={this.state.sending} text={StringResources.getString(Strings.GetStarted.SpinnerText)} />
                <div className="tabTitle">
                    <h1 className="title">{StringResources.getString(Strings.GetStarted.Title)}</h1>
                    <p className="description">{StringResources.getString(Strings.GetStarted.SubTitle)}</p>
                </div>

                <div>
					<form onSubmit={this.submit} className="inputsContainer">
						<input
							type="text"
							name={FormFields.Email}
							placeholder={StringResources.getString(Strings.GetStarted.Inputs.Email.placeholder)}
							value={this.state.form[FormFields.Email].value}
							className={
								classnames('full-width', {
									error: this.state.form[FormFields.Email].error,
									success: !this.state.form[FormFields.Email].error && this.state.form[FormFields.Email].touched
								})}
							onChange={this.onChange}
							onBlur={this.onChange}
						/>
						<input
							type="text"
							name={FormFields.Phone}
							placeholder={StringResources.getString(Strings.GetStarted.Inputs.Phone.placeholder)}
							value={this.state.form[FormFields.Phone].masked}
							className={classnames('phoneInputStarted full-width', {
								error: this.state.form[FormFields.Phone].error,
								success: !this.state.form[FormFields.Phone].error && this.state.form[FormFields.Phone].touched
							})}
							onChange={this.onChange}
							onBlur={this.onChange}
						/>
						<input
							type="text"
							name={FormFields.FirstName}
							placeholder={StringResources.getString(Strings.GetStarted.Inputs.FirstName.placeholder)}
							value={this.state.form[FormFields.FirstName].value}
							className={
								classnames('width-48', {
									error: this.state.form[FormFields.FirstName].error,
									success: !this.state.form[FormFields.FirstName].error && this.state.form[FormFields.FirstName].touched
								})}
							onChange={this.onChange}
							onBlur={this.onChange}
						/>
						<input
							type="text"
							name={FormFields.LastName}
							placeholder={StringResources.getString(Strings.GetStarted.Inputs.LastName.placeholder)}
							value={this.state.form[FormFields.LastName].value}
							className={classnames('width-48', {
								error: this.state.form[FormFields.LastName].error,
								success: !this.state.form[FormFields.LastName].error && this.state.form[FormFields.LastName].touched
							})}
							onChange={this.onChange}
							onBlur={this.onChange}
						/>

						<input
							type="text"
							name={FormFields.ZipCode}
							placeholder={StringResources.getString(Strings.GetStarted.Inputs.ZipCode.placeholder)}
							value={this.state.form[FormFields.ZipCode].value}
							className={classnames('full-width', {
								error: this.state.form[FormFields.ZipCode].error,
								success: !this.state.form[FormFields.ZipCode].error && this.state.form[FormFields.ZipCode].touched
							})}
							onChange={this.onChange}
							onBlur={this.onChange}
							maxLength={5}
						/>

						<div className="separatorDiv" />

						<p className="inputTitle">{StringResources.getString(Strings.GetStarted.CheckBoxGroupTitle)}</p>

						<label className={classnames('checkboxLabel full-width', { error: this.state.form[FormFields.OwnTruck].error })}>
							<input
									type="checkbox"
									id={`id-${FormFields.OwnTruck}`}
									name={FormFields.OwnTruck}
									value={this.state.form[FormFields.OwnTruck].value}
									onChange={this.onChange}
									onBlur={this.onChange}
									className="checkboxInput"
							/>
							<div className="checkmark-box" />
							<span className="label-text">{StringResources.getString(Strings.GetStarted.Inputs.OwnTruck.label)}</span>
						</label>
						<label className={classnames('checkboxLabel full-width',{ error: this.state.form[FormFields.Age21].error })}>
							<input
								type="checkbox"
								id={`id-${FormFields.Age21}`}
								name={FormFields.Age21}
								value={this.state.form[FormFields.Age21].value}
								onChange={this.onChange}
								onBlur={this.onChange}
							/>
							<div className="checkmark-box" />
							<span className="label-text">{StringResources.getString(Strings.GetStarted.Inputs.Age.label)}</span>
						</label>
						<label className={classnames('checkboxLabel full-width',{ error: this.state.form[FormFields.BgCheckbox].error })}>
							<input
								type="checkbox"
								id={`id-${FormFields.BgCheckbox}`}
								name={FormFields.BgCheckbox}
								value={this.state.form[FormFields.BgCheckbox].value}
								onChange={this.onChange}
								onBlur={this.onChange}
							/>
							<div className="checkmark-box" />
							<span className="label-text">{StringResources.getString(Strings.GetStarted.Inputs.WillingToCheck.label)}</span>
						</label>

						<Select
							options={selectHearAboutOptions}
							value={this.state.form[FormFields.HearAbout].value}
							searchable={false}
							onChange={this.handleSelectChange(FormFields.HearAbout)}
							className="default selectComponent hearAboutSelect full-width"
							placeholder={StringResources.getString(Strings.GetStarted.Inputs.HowDidYouHear.placeholder)}
							classes={{
								selectValue: 'selectValue',
								selectArrow: 'selectArrow'
							}}
						/>

						<div className={classnames('captchaContainer', { error: this.state.form[FormFields.Captcha].error })}>
							<ReCAPTCHA
								sitekey={RECAPTCHA_KEY}
								onChange={this.captchaVerifyCallback}
								onExpired={this.captchaOnExpired}
							/>
						</div>
						<div className="separatorDiv h30 separatorDiv-if" />
						<div className="row wrap-xs space-between justify-center-xs">
							<button className="btn normal" type="submit" onClick={this.submit}>{StringResources.getString(Strings.GetStarted.Buttons.Send.Title)}</button>
							{ window.top === window &&
								<a href="#" className="block checkStatus" onClick={this.goAuth}>Check my application status</a>
							}
						</div>
					</form>
				</div>

                <div className={classnames('alertMessage', { active: this.state.error && !!this.state.errorText })} >
                    {
						this.state.errorText && this.state.errorText.errorCode === InternalErrorCode.CommonError
							? StringResources.getString(Strings.Common.Errors.ErrorTemplate,this.state.errorText.text)
							: (<span>
								{StringResources.getString(Strings.GetStarted.Errors.Messages.HaulerExists.BeforeLink)}
								<a href="#" onClick={this.onHaulerExistsLinkClick}>
									{StringResources.getString(Strings.GetStarted.Errors.Messages.HaulerExists.Link)}
								</a>
								{StringResources.getString(Strings.GetStarted.Errors.Messages.HaulerExists.AfterLink)}
							   </span>)
					}
                </div>
				<div className={classnames('alertMessage', { active: this.state.serverError })}>
					{StringResources.getString(Strings.Common.Errors.InternalError)}
				</div>
				<div className={classnames('alertMessage', { active: this.state.fieldsError && this.state.errorText && this.state.errorText.errorCode === InternalErrorCode.CommonError && StringUtils.isNotEmpty(this.state.errorText.text) })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate, this.state.errorText ? this.state.errorText.text : '')}
				</div>
			</div>
		)
	}

	private initForm = () => {
		let formValidator = new FormValidator<FormType>([
			{
				name: FormFields.Email,
				value: '',
				validator: Validators.email,
				messages: {
					email: StringResources.getString(Strings.GetStarted.Errors.Messages.InvalidEmail)
				}
			},
			{
				name: FormFields.Phone,
				value: '',
				masked: '',
				validator: Validators.phone,
				messages: {
					phone: StringResources.getString(Strings.GetStarted.Errors.Messages.InvalidPhone)
				},
				masker: new Masker(Masker.numberMask, Masker.placeSymbol)
			},
			{
				name: FormFields.FirstName,
				value: '',
				validator: Validators.name,
				messages: {
					name: StringResources.getString(Strings.GetStarted.Errors.Messages.InvalidName)
				}
			},
			{
				name: FormFields.LastName,
				value: '',
				validator: Validators.name,
				messages: {
					name: StringResources.getString(Strings.GetStarted.Errors.Messages.InvalidLastName)
				}
			},
			{
				name: FormFields.ZipCode,
				value: '',
				validator: Validators.zipCode,
				messages: {
					zip: StringResources.getString(Strings.GetStarted.Errors.Messages.InvalidZip)
				}
			},
			{
				name: FormFields.OwnTruck,
				validator: (value: boolean) => {
					return value ? undefined : 'check'
				},
				messages: {
					check: StringResources.getString(Strings.GetStarted.Errors.Messages.NoTruck)
				}
			},
			{
				name: FormFields.Age21,
				validator: (value: boolean) => {
					return value ? undefined : 'check'
				},
				messages: {
					check: StringResources.getString(Strings.GetStarted.Errors.Messages.NoAge)
				}
			},
			{
				name: FormFields.BgCheckbox,
				validator: (value: boolean) => {
					return value ? undefined : 'check'
				},
				messages: {
					check: StringResources.getString(Strings.GetStarted.Errors.Messages.NoWilling)
				}
			},
			{
				name: FormFields.Captcha,
				validator: (value: boolean) => {
					return value ? undefined : 'check'
				},
				messages: {
					check: StringResources.getString(Strings.GetStarted.Errors.Messages.NoCaptcha)
				}
			},
			{
				name: FormFields.HearAbout,
				validator: (value: any) => { return undefined }
			},
			{
				name: FormFields.State,
				validator: (value: any) => { return undefined }
			}
		])
		return formValidator
	}

}

function mapStateToProps(state: StoreState) {
	return {
		accessToken: state.accessToken,
		routing: state.routing
	}
}

function mapDispatchToProps(dispatch: Dispatch<RouterAction | ServiceInfoAction | PersonalInfoAction>) {
	return {
		routePush: (location: string) => dispatch(routerActions.push(location)),
		setHaulerRegistrationInProcess: () => dispatch(ServiceInfoActions.setHaulerRegistrationInProcess()),
		setPersonalInfo: (haulerInfo: HaulerInfo) => dispatch(PersonalInfoActions.updatePersonalInfo(haulerInfo)),
		cleanState: () => dispatch(StoreActions.cleanAll())
	}
}

export const GetStartedContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(GetStarted)
