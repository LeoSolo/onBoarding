import * as React from 'react'
import { RouterAction, routerActions } from 'react-router-redux'
import { connect, Dispatch } from 'react-redux'
import { StoreState } from '../reducers'
import * as classnames from 'classnames'

import { LoadingSpinner } from '../components/LoadingSpinner'

import { ROUTES } from '../constants/routes'

import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'

import { EventType, EventService } from '../services/events/events'
import { Api } from '../services/api/api'
import * as Auth from '../services/auth/auth'

import { PersonalInfoAction, Actions as PersonalInfoActions } from '../actions/personalInfo'
import { VehicleAction, Actions as VehicleActions } from '../actions/vehicle'
import { DriverLicenseAction, Actions as DriverLicenseActions } from '../actions/driversLicense'
import { ActionType as ServiceInfoAction, Actions as ServiceInfoActions } from '../actions/service'
import { ActionType as StoreAction, Actions as StoreActions } from '../actions/store'

import { HaulerInfo, DriverLicenseInfo, VehicleInfo } from '../types'

import '../styles/AuthContainer.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface LoginProps {
	routePush: (path: string) => RouterAction
	setPersonalInfo: (haulerInfo: HaulerInfo) => PersonalInfoAction
	setVehicleInfo: (vehicleInfo: VehicleInfo) => VehicleAction
	setDriverLicenseInfo: (driverLicense: DriverLicenseInfo) => DriverLicenseAction
	setHaulerInfoLoaded: () => ServiceInfoAction
	cleanState: () => StoreAction
}

enum FromFields {
	UserName = 'formFields',
	Password = 'password'
}

interface FormType {
	[FromFields.UserName]: FieldValidatedValue,
	[FromFields.Password]: FieldValidatedValue
}

interface LoginState {
	form: FormType
    redirectFlag: boolean
	error: boolean
	errorText: string
	fieldsError: boolean
}

class Login extends React.Component<LoginProps, LoginState> {

	private formValidator: FormValidator<FormType>

	constructor(props: any) {
		super(props)
		this.formValidator = this.initForm()
        this.state = {
			form: this.formValidator.values(),
            redirectFlag: false,
	        error: false,
	        errorText: '',
	        fieldsError: false
        }
	}
	routeToCreateAccount = (e: any) => {
		e.preventDefault()
        this.props.routePush(ROUTES.ROOT)
	}
	routeToForgotPassword = (e: any) => {
		e.preventDefault()
		this.props.routePush(ROUTES.FORGOT_PASS)
	}
	componentDidMount() {
		EventService.pushEvent(EventType.LOGIN_PAGE_LOADED)
		this.props.cleanState()
	}

	logIn = (e) => {
		e.preventDefault()
		this.formValidator.validate()
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid()
		})
		if (this.formValidator.isValid()) {
			this.setState({
				redirectFlag: true
			})
			Auth.signIn({
				login: this.state.form[FromFields.UserName].value.toLowerCase().trim(),
				password: this.state.form[FromFields.Password].value
			})
			.then(result => {
				Api.loadHaulerOverview()
				.then(body => {
					console.log(body)

					this.setState({
						redirectFlag: false
					})

					this.props.setPersonalInfo(body)

					if (body.driveLicenseInformation) {
						this.props.setDriverLicenseInfo(body.driveLicenseInformation)
					}
            		if (body.vehicleInformation) {
						this.props.setVehicleInfo(body.vehicleInformation)
					}
					if (body.status) {
						this.props.setHaulerInfoLoaded()
						EventService.pushEvent(EventType.EXISTED_HAULER_AUTHENTICATED)
						this.props.routePush(ROUTES.OVERVIEW)
            		} else {
						this.setState({
                			error: true,
                    		errorText: StringResources.getString(Strings.Login.Errors.Messages.UserNotExists)
						})
					  EventService.pushEvent(EventType.AUTHENTICATION_FAILED)
            		}
				})
				.catch(error => {
					console.log('Request failed', error)
            		this.setState({
            			error: true,
                		redirectFlag: false,
                		errorText: StringResources.getString(Strings.Login.Errors.Messages.UserNotExists)
					})
					EventService.pushEvent(EventType.AUTHENTICATION_FAILED)
				})
			})
			.catch(error => {
				console.log(error)
				EventService.pushEvent(EventType.AUTHENTICATION_FAILED)
				if (error.code === 'UserNotFoundException') {
                	this.setState({
		                errorText: StringResources.getString(Strings.Login.Errors.Messages.UserNotExists),
		                error: true,
		                redirectFlag: false
	                })
	            } else if (error.code === 'NotAuthorizedException') {
		            this.setState({
			            errorText: StringResources.getString(Strings.Login.Errors.Messages.IncorrectCredentials),
			            error: true,
			            redirectFlag: false
		            })
	            }
			})
		}
    }
    onChange = (e) => {
		this.formValidator.setState([{
			name: e.target.name,
			value: e.target.value
		}])
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid()
		})
	}
    render() {
        return (
            <div className="scrollable">
				<LoadingSpinner show={this.state.redirectFlag} text={StringResources.getString(Strings.Login.SpinnerTitle)} />

                <div className="tabTitle">
					<h1 className="title">{StringResources.getString(Strings.Login.Title)}</h1>
					<p className="description">{StringResources.getString(Strings.Login.SubTitle)}</p>
				</div>

	            <div>
					<form onSubmit={this.logIn} className={classnames('authContainer', { error: this.state.fieldsError })}>
						<input
							type="text"
							name={FromFields.UserName}
							placeholder={StringResources.getString(Strings.Login.Inputs.Email.placeholder)}
							onChange={this.onChange}
						/>
						<input
							type="password"
							name={FromFields.Password}
							placeholder={StringResources.getString(Strings.Login.Inputs.Password.placeholder)}
							onChange={this.onChange}
						/>
						<div className="extraOptions">
							<a href="#" className="block" onClick={this.routeToForgotPassword}>
								{StringResources.getString(Strings.Login.Links.ForgotPassword.title)}
							</a>
							<a href="#" className="block" onClick={this.routeToCreateAccount}>
								{StringResources.getString(Strings.Login.Links.CreateNewAccount.title)}
							</a>
						</div>
						<div className="separatorDiv h30"/>
						<div className="row right justify-center-xs">
							<button className="btn normal" type="submit" onClick={this.logIn}>{StringResources.getString(Strings.Login.Buttons.Login.title)}</button>
						</div>
					</form>
	            </div>

	            <div className={classnames('alertMessage', { active: this.state.error })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate, this.state.errorText)}
		        </div>

            </div>
        )
	}

	private initForm = () => {
		let formValidator = new FormValidator<FormType>([
			{
				name: FromFields.UserName,
				value: '',
				validator: Validators.minLength(3),
				messages: {
					min: StringResources.getString(Strings.Login.Errors.Messages.LoginLength.short)
				}
			},
			{
				name: FromFields.Password,
				value: '',
				validator: Validators.minLength(3),
				messages: {
					min: StringResources.getString(Strings.Login.Errors.Messages.PasswordLength.short)
				}
			}
		])
		return formValidator
	}
}

function mapStateToProps(state: StoreState) {
    return {}
}

function mapDispatchToProps(dispatch: Dispatch<RouterAction | PersonalInfoAction | VehicleAction | DriverLicenseAction | ServiceInfoAction>) {
	return {
		routePush: (location: string) => { dispatch(routerActions.push(location)) },
		setPersonalInfo: (haulerInfo: HaulerInfo) => { dispatch(PersonalInfoActions.updatePersonalInfo(haulerInfo)) },
		setVehicleInfo: (vehicleInfo: VehicleInfo) => { dispatch(VehicleActions.updateVehicleInfo(vehicleInfo)) },
		setDriverLicenseInfo: (driverLicense: DriverLicenseInfo) => { dispatch(DriverLicenseActions.updateLicenseInfo(driverLicense)) },
		setHaulerInfoLoaded: () => { dispatch(ServiceInfoActions.setHaulerInfoLoaded()) },
		cleanState: () => dispatch(StoreActions.cleanAll())
	}
}

export const LoginContainer = connect(
    mapStateToProps,
	mapDispatchToProps
)(Login)
