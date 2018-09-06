import * as React from 'react'
import { RouterAction, routerActions } from 'react-router-redux'
import { connect, Dispatch } from 'react-redux'
import { StoreState } from '../reducers'
import * as classnames from 'classnames'

import { ActionType as ServiceInfoAction, Actions as ServiceInfoActions } from '../actions/service'

import { LoadingSpinner } from '../components/LoadingSpinner'
import { PasswordChecker } from '../components/PasswordChecker'

import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'

import { Api } from '../services/api/api'
import * as Auth from '../services/auth/auth'
import { EventType, EventService } from '../services/events/events'

import { ROUTES } from '../constants/routes'
import * as Types from '../types'

import '../styles/LinkAccount.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface CreatePasswordProps {
	haulerInfo: Types.HaulerInfo
	isRegistrationInProgress: boolean
	routePush: (path: string) => RouterAction
	setHaulerRegistrationEnd: () => ServiceInfoAction
}

enum FormFields {
	Pass = 'passwordInput',
	RepeatPass = 'repeatPasswordInput'
}

interface FormType {
	[FormFields.Pass]: FieldValidatedValue
	[FormFields.RepeatPass]: FieldValidatedValue
}

interface CreatePasswordState {
	canSubmit: boolean
	sending: boolean
    serverError: boolean
	passwordError: boolean
	error: boolean
	errorText?: string
	form: FormType
}

class CreatePassword extends React.Component<CreatePasswordProps, CreatePasswordState> {

	private formValidator: FormValidator<FormType>

	constructor(props: any) {
		super(props)
		this.formValidator = this.initForm()
		this.state = {
            serverError: false,
			passwordError: false,
			error: false,
			errorText: '',
			form: this.formValidator.values(),
			sending: false,
			canSubmit: false
		}
	}
	componentDidMount() {
		EventService.pushEvent(EventType.NEW_HAULER_GET_STARTED)
		if (!this.props.isRegistrationInProgress) {
			this.props.routePush(ROUTES.ROOT)
		}
	}
	routeToOverview = (e: any) => {
		e.preventDefault()
		this.formValidator.validate()
		this.setState({
			form: this.formValidator.values(),
			error: !this.formValidator.isValid(),
			errorText: this.formValidator.getError()
		}, () => {
			if (this.formValidator.isValid() && this.state.canSubmit && this.props.isRegistrationInProgress) {
				this.setState({
					sending: true
				})
				Api.registerHauler({
					firstName: this.props.haulerInfo.firstName ? this.props.haulerInfo.firstName : '',
					lastName: this.props.haulerInfo.lastName ? this.props.haulerInfo.lastName : '',
					mailingAddress: this.props.haulerInfo.mailingAddress ? this.props.haulerInfo.mailingAddress : '',
					primaryPhone: this.props.haulerInfo.primaryPhone ? this.props.haulerInfo.primaryPhone : '',
					zip: this.props.haulerInfo.zip ? this.props.haulerInfo.zip : '',
					password: this.state.form[FormFields.Pass].value ? this.state.form[FormFields.Pass].value : ''
				})
				.then(body => {
					Auth.signIn({
						login: this.props.haulerInfo.mailingAddress ? this.props.haulerInfo.mailingAddress : '',
						password: this.state.form[FormFields.Pass].value
					})
					.then(result => {
						this.setState({
							sending: false
						})
						this.props.setHaulerRegistrationEnd()
						this.props.routePush(`${ROUTES.EMAIL_CONFIRM}/${true}`)
					})
					.catch(error => {
						console.log('Request failed', error)
						this.setState({
							serverError: true,
							sending: false
						})
						this.props.setHaulerRegistrationEnd()
						this.props.routePush(`${ROUTES.EMAIL_CONFIRM}/${false}`)
					})
				})
				.catch(error => {
					if (error.response && error.response.data && error.response.data.error) {
						if (error.response.data.error.code === Types.Enums.ErrorCodes.GENERAL_ERROR) {
							this.setState({
								error: true,
								sending: false,
								errorText: JSON.parse(error.response.data.error.description).message
							})
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
	onChange = (e) => {
		this.formValidator.setState([
			{
				name: e.target.name,
				value: e.target.value
			}
		])
		this.setState({
			form: this.formValidator.values(),
			error: !this.formValidator.isValid(),
			errorText: this.formValidator.getError()
		})
	}
	onPasswordCheckerChange = (result: boolean) => {
		this.setState({
			canSubmit: result
		})
	}
	render() {
		return (
			<div className="scrollable">
				<div className="tabTitle">
					<h1 className="title">{StringResources.getString(Strings.CreatePassword.Title)}</h1>
					<p className="description">
						{StringResources.getString(Strings.CreatePassword.SubTitle)}
					</p>
				</div>
				<LoadingSpinner show={this.state.sending} text={StringResources.getString(Strings.GetStarted.SpinnerText)} />
				<div>
					<form className={classnames('inputsContainer', { error: this.state.error })} onSubmit={this.routeToOverview}>
						<input
							type="password"
							name={FormFields.Pass}
							placeholder={StringResources.getString(Strings.CreatePassword.Inputs.Password.placeholder)}
							onChange={this.onChange}
						/>
						<input
							type="password"
							name={FormFields.RepeatPass}
							placeholder={StringResources.getString(Strings.CreatePassword.Inputs.ConfirmPassword.placeholder)}
							onChange={this.onChange}
						/>
						<div className="row center">
							<div className="passwordCheckerContainer">
								<div>
									<div className="passwordCheckerContainerTitle">
										{StringResources.getString(Strings.CreatePassword.PasswordCheckerTitle)}
									</div>
									<PasswordChecker
										password={this.state.form[FormFields.Pass].value}
										confirmPassword={this.state.form[FormFields.RepeatPass].value}
										onChange={this.onPasswordCheckerChange}
									/>
								</div>
							</div>
						</div>
						<br className="separatorDiv"/>
						<div className="row center">
							<button
								type="submit"
								className={classnames('btn normal', { disabled: !this.state.canSubmit })}
								disabled={!this.state.canSubmit}
							>
								{StringResources.getString(Strings.CreatePassword.Buttons.Submit.title)}
							</button>
						</div>
					</form>
				</div>

				<div className={classnames('alertMessage', { active: this.state.error })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate, this.state.errorText)}
				</div>

                <div className={classnames('alertMessage', { active: this.state.serverError })}>
	                {StringResources.getString(Strings.Common.Errors.InternalError)}
                </div>

			</div>
		)
	}

	private initForm = () => {
		let formValidator = new FormValidator<FormType>([
			{
				name: FormFields.Pass,
				value: '',
				validator: (value: string) => undefined
			},
			{
				name: FormFields.RepeatPass,
				value: '',
				validator: (value: string) => undefined
			}
		])
		return formValidator
	}
}

function mapStateToProps(state: StoreState) {
	return {
		isRegistrationInProgress: state.serviceInfo.isHaulerRegistrationInProcess,
		haulerInfo: state.personalInfo
	}
}

function mapDispatchToProps(dispatch: Dispatch<RouterAction | ServiceInfoAction>) {
	return {
		routePush: (location: string) => dispatch(routerActions.push(location)),
		setHaulerRegistrationEnd: () => dispatch(ServiceInfoActions.setHaulerRegistrationEnd())
	}
}

export const CreatePasswordContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(CreatePassword)
