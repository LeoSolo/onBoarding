import * as React from 'react'
import * as classnames from 'classnames'
import { Dispatch, connect, ComponentClass } from 'react-redux'

import { BankInfoAction, Actions as BankInfoActions } from '../actions/bankInfo'
import { TabAction, Actions } from '../actions/tab'
import { OverviewTab } from '../constants/overviewTabs'

import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'
import * as StringUtils from '../utils/StringUtils'

import { EventType, EventService } from '../services/events/events'
import { Stripe, BankAccountType } from '../services/stripe/stripe'
import { Api } from '../services/api/api'

import { StoreState } from '../reducers'

import * as Types from '../types'

import { Countries } from '../constants/countries'
import { Currencies } from '../constants/currencies'

import '../styles/BankingInfoStyles.scss'
import { Masker } from '../utils/masker/Masker'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'
import { HaulerInfoStatus } from '../types/enum'
import { ErrorResources } from '../resources/error/errorResources'
import { ErrorCode } from '../resources/error/errorCode'

export interface BankingInfoCallbackProps {
}

interface BankingInfoProps extends BankingInfoCallbackProps {
	haulerInfo: Types.HaulerInfo
	vehicleInfo: Types.VehicleInfo
	driversLicenseInfo: Types.DriverLicenseInfo
	isBankingInfoProvided: boolean
	setBankInfoProvided: () => BankInfoAction
	enableLoader: () => TabAction
	disableLoader: () => TabAction
	goToOverview: () => TabAction
}

enum BankChoose {
	BankAccount = 'bankAccount',
	DebitCard = 'debitCard'
}

enum FormFields {
	BankChoose = 'bankChooseInput',
	BankRouting = 'bankRoutingNumberInput',
	BankAccountNumber = 'bankAccountNumberInput',
	SocialSecurityNumber = 'socialSecurityNumber',
	SocialSecurityNumberShort = 'socialSecurityNumberShort',
	EmployerIdentificationNumber = 'employerIdentificationNumber',
	DebitCardNumber = 'debitCardInfoInput',
	ExpireDate = 'expiredCardDateInput',
	CVCNumber = 'cardCVСNumberInput',
	StripeAgreement = 'stripeAgreement'
}

interface FormType {
	[FormFields.BankChoose]: FieldValidatedValue
	[FormFields.BankRouting]: FieldValidatedValue
	[FormFields.BankAccountNumber]: FieldValidatedValue
	[FormFields.SocialSecurityNumber]: FieldValidatedValue
	[FormFields.SocialSecurityNumberShort]: FieldValidatedValue
	[FormFields.EmployerIdentificationNumber]: FieldValidatedValue
	[FormFields.DebitCardNumber]: FieldValidatedValue
	[FormFields.ExpireDate]: FieldValidatedValue
	[FormFields.CVCNumber]: FieldValidatedValue
	[FormFields.StripeAgreement]: FieldValidatedValue
}

interface BankingInfoStates {
	form: FormType
	fieldsError: boolean
	serverError: boolean
	errorText?: string
	done: boolean
}

class BankingInfo extends React.Component<BankingInfoProps, BankingInfoStates> {

	private formValidator: FormValidator<FormType>
	private stripe: Stripe

	constructor(props: any) {
		super(props)
		this.formValidator = this.initForm(this.props.haulerInfo.type, this.showSsnOrEin())
		Stripe.getStripe()
			.then(stripe => {
				this.stripe = stripe
			})
			.catch((error) => {
				console.log(error)
			})
		this.state = {
			form: this.formValidator.values(),
			fieldsError: false,
			serverError: false,
			errorText: '',
			done: false
		}
	}
	componentDidMount() {
		EventService.pushEvent(EventType.HAULER_BANKING_TAB_ACTIVATED)
	}
	componentWillUnmount() {
		this.formValidator = this.initForm(this.props.haulerInfo.type, this.showSsnOrEin())
	}
	onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.name === FormFields.BankChoose) {
			this.formValidator = this.initForm(this.props.haulerInfo.type, this.showSsnOrEin())
			if (this.state.form[FormFields.StripeAgreement].value) {
				this.formValidator.setState([{
					name: FormFields.StripeAgreement,
					value: this.state.form[FormFields.StripeAgreement].value
				}])
			}
			if (this.showSsnOrEin()) {
				if (this.props.haulerInfo.type === Types.Enums.HaulerType.INDEPENDENT_HAULER) {
					if (this.state.form[FormFields.SocialSecurityNumber].value) {
						this.formValidator.setState([{
							name: FormFields.SocialSecurityNumber,
							value: this.state.form[FormFields.SocialSecurityNumber].value
						}])
					}
				} else {
					let update: any[] = []
					if (this.state.form[FormFields.EmployerIdentificationNumber].value) {
						update.push({
							name: FormFields.EmployerIdentificationNumber,
							value: this.state.form[FormFields.EmployerIdentificationNumber].value
						})
					}
					if (this.state.form[FormFields.SocialSecurityNumberShort].value) {
						update.push({
							name: FormFields.SocialSecurityNumberShort,
							value: this.state.form[FormFields.SocialSecurityNumberShort].value
						})
					}
					if (update.length > 0) {
						this.formValidator.setState(update)
					}
				}
			}
		}
		let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
		this.formValidator.setState([{
			name: e.target.name,
			value: value
		}])
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid(),
			errorText: this.formValidator.getError(),
			serverError: false,
			done: false
		})
	}
	onSubmit = (e: any) => {
		e.preventDefault()
		this.formValidator.validate()
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid(),
			errorText: this.formValidator.getError(),
			serverError: false,
			done: false
		}, () => {
			if (!this.state.fieldsError) {
				let isStatusesValid = true
				isStatusesValid = isStatusesValid && this.props.haulerInfo.infoStatus === HaulerInfoStatus.APPROVED
				isStatusesValid = isStatusesValid && this.props.vehicleInfo.infoStatus === HaulerInfoStatus.APPROVED
				isStatusesValid = isStatusesValid && this.props.driversLicenseInfo.infoStatus === HaulerInfoStatus.APPROVED
				if (!isStatusesValid) {
					this.setState({
						errorText: StringResources.getString(Strings.BankingInfo.Errors.Messages.TabStatusesInvalid),
						fieldsError: true,
						done: false,
						serverError: false
					})
				} else if (!this.stripe) {
					console.log('stripe is undefined')
				} else {
					this.props.enableLoader()
					// PLEASE TAKE CARE ABOUT PROMISES ORDER
					let promises: Promise<any>[] = []
					if (this.state.form[FormFields.BankChoose].value === BankChoose.BankAccount) {
						promises.push(this.stripe.createTokenWithBankInfo({
							accountHolderName: `${this.props.haulerInfo.firstName} ${this.props.haulerInfo.lastName}`,
							accountHolderType: this.props.haulerInfo.type === Types.Enums.HaulerType.INDEPENDENT_HAULER ? BankAccountType.INDIVIDUAL : BankAccountType.COMPANY,
							accountNumber: this.state.form[FormFields.BankAccountNumber].value,
							routingNumber: this.state.form[FormFields.BankRouting].value,
							country: Countries.US,
							currency: Currencies.USD
						})) // 0-index
					} else {
						promises.push(this.stripe.createToken({
							cardNumber: this.state.form[FormFields.DebitCardNumber].value,
							name: `${this.props.haulerInfo.firstName} ${this.props.haulerInfo.lastName}`,
							cvc: this.state.form[FormFields.CVCNumber].value,
							expireMonth: this.state.form[FormFields.ExpireDate].masked.split('/')[0],
							expireYear: this.state.form[FormFields.ExpireDate].masked.split('/')[1],
							country: Countries.US,
							currency: Currencies.USD
						})) // 0-index
					}
					if (this.showSsnOrEin()) {
						if (this.props.haulerInfo.type === Types.Enums.HaulerType.INDEPENDENT_HAULER && this.state.form[FormFields.SocialSecurityNumber].value) {
							promises.push(this.stripe.createTokenWithPII(this.state.form[FormFields.SocialSecurityNumber].value)) // 1-index
						} else {
							promises.push(Promise.resolve(undefined)) // 1-index
						}
						if (this.props.haulerInfo.type === Types.Enums.HaulerType.DONATION_HAULER) {
							promises.push(Promise.resolve(this.state.form[FormFields.EmployerIdentificationNumber].value)) // 2-index
							promises.push(Promise.resolve(this.state.form[FormFields.SocialSecurityNumberShort].value)) // 3-index
						}
					} else {
						promises.push(Promise.resolve(undefined)) // 1-index
						promises.push(Promise.resolve(undefined)) // 2-index
						promises.push(Promise.resolve(undefined)) // 3-index
					}
					Promise.all(promises)
					.then((tokens: string[] | undefined[]) => {
						Api.updatePaymentInfo({
							paymentToken: tokens[0] as string,
							ssnToken: tokens[1],
							ein: tokens[2],
							ssnLast4: tokens[3],
							userAcceptedAgreement: true
						})
						.then(() => {
							this.setState({
								done: true
							})
							this.props.setBankInfoProvided()
							this.props.disableLoader()
							this.props.goToOverview()
						})
						.catch((error) => {
							console.log('Error on sending payment info to server', error.response)
							let errorCode = error && error.response && error.response.data && error.response.data.error && error.response.data.error.code ? error.response.data.error.code : ErrorCode.UNKNOWN
							this.setState({
								done: false,
								serverError: true,
								errorText: ErrorResources.getErrorText(errorCode)
							})
							this.props.disableLoader()
						})
					})
					.catch(error => {
						console.log('Error from stripe', error)
						this.setState({
							done: false,
							serverError: true
						})
						this.props.disableLoader()
					})
				}
			}
		})
	}

	showSsnOrEin = () => {
		return !this.props.isBankingInfoProvided && !this.props.haulerInfo.stripeStatus
	}
	render() {
		let classes = (name, isActive: boolean) => {
			return {
				error: this.state.form[name].error,
				success: isActive && !this.state.form[name].error && this.state.form[name].touched && this.state.form[FormFields.BankChoose].value
			}
		}
		let isBankAccountChoosed = this.state.form[FormFields.BankChoose].value === BankChoose.BankAccount
		let isCardChoosed = this.state.form[FormFields.BankChoose].value === BankChoose.DebitCard
		return (
			<div>
				<div className="tabTitle">
					<div className="bankingImg" />
					<p className="description">{StringResources.getString(Strings.BankingInfo.SubTitle)}</p>
				</div>
				<div className="card">
					<form onSubmit={this.onSubmit}>
						<div className={classnames('bankAccountInfo', { active: isBankAccountChoosed })} >
							<div className="row left">
								<label className="radioContainer">
									<input
										type="radio"
										id={FormFields.BankChoose + '_1'}
										name={FormFields.BankChoose}
										onChange={this.onChange}
										value={BankChoose.BankAccount}
									/>
									<div className="checkmark"><div /></div>
									<label htmlFor={FormFields.BankChoose + '_1'}> {StringResources.getString(Strings.BankingInfo.BankAccountTitle)}</label>
								</label>
							</div>
							<input
								className={classnames(classes(FormFields.BankRouting, isBankAccountChoosed))}
								name={FormFields.BankRouting}
								type="text"
								placeholder={StringResources.getString(Strings.BankingInfo.Inputs.RoutingNumber.placeholder)}
								onChange={this.onChange}
								disabled={!isBankAccountChoosed}
								value={this.state.form[FormFields.BankRouting].value}
							/>
							<input
								className={classnames(classes(FormFields.BankAccountNumber, isBankAccountChoosed))}
								name={FormFields.BankAccountNumber}
								type="text"
								placeholder={StringResources.getString(Strings.BankingInfo.Inputs.AccountNumber.placeholder)}
								onChange={this.onChange}
								disabled={!isBankAccountChoosed}
								value={this.state.form[FormFields.BankAccountNumber].value}
							/>

						</div>

						<div
							className={classnames('debitCardInfo', { active: isCardChoosed })}
						>
							<div className="row left">
								<label className="radioContainer">
									<input
										type="radio"
										id={FormFields.BankChoose + '_2'}
										name={FormFields.BankChoose}
										onChange={this.onChange}
										value={BankChoose.DebitCard}
									/>
									<div className="checkmark"><div /></div>
									<label htmlFor={FormFields.BankChoose + '_2'}>{StringResources.getString(Strings.BankingInfo.DebitCardTitle)}</label>
								</label>
							</div>
							<input
								className={classnames('card-number', classes(FormFields.DebitCardNumber, isCardChoosed))}
								name={FormFields.DebitCardNumber}
								type="text"
								placeholder={StringResources.getString(Strings.BankingInfo.Inputs.DebitCardNumber.placeholder)}
								disabled={!isCardChoosed}
								onChange={this.onChange}
								value={this.state.form[FormFields.DebitCardNumber].value}
							/>
							<input
								className={classnames(classes(FormFields.ExpireDate, isCardChoosed))}
								type="text"
								name={FormFields.ExpireDate}
								value={this.state.form[FormFields.ExpireDate].masked}
								onChange={this.onChange}
								placeholder={StringResources.getString(Strings.BankingInfo.Inputs.Expiration.placeholder)}
								disabled={!isCardChoosed}
								maxLength={5}
							/>

							<input
								className={classnames(classes(FormFields.CVCNumber, isCardChoosed))}
								name={FormFields.CVCNumber}
								type="text"
								placeholder={StringResources.getString(Strings.BankingInfo.Inputs.CVV.placeholder)}
								onChange={this.onChange}
								disabled={!isCardChoosed}
								value={this.state.form[FormFields.CVCNumber].value}
								maxLength={3}
							/>

							<span className="bankAnswer" />
						</div>
						{
							(this.showSsnOrEin()) &&
							<div className="row left ssn">
								{this.props.haulerInfo.type === Types.Enums.HaulerType.INDEPENDENT_HAULER &&
									<input
										className={classnames(classes(FormFields.SocialSecurityNumber, true))}
										name={FormFields.SocialSecurityNumber}
										type="text"
										placeholder={StringResources.getString(Strings.BankingInfo.Inputs.SSN.placeholder)}
										onChange={this.onChange}
										value={this.state.form[FormFields.SocialSecurityNumber].masked}
									/>
								}
								{this.props.haulerInfo.type === Types.Enums.HaulerType.DONATION_HAULER &&
									<div className="ein">
										<input
											className={classnames(classes(FormFields.EmployerIdentificationNumber, true))}
											name={FormFields.EmployerIdentificationNumber}
											type="text"
											placeholder={StringResources.getString(Strings.BankingInfo.Inputs.EIN.placeholder)}
											onChange={this.onChange}
											value={this.state.form[FormFields.EmployerIdentificationNumber].masked}
										/>
										<input
											className={classnames(classes(FormFields.SocialSecurityNumberShort, true))}
											name={FormFields.SocialSecurityNumberShort}
											type="text"
											placeholder={StringResources.getString(Strings.BankingInfo.Inputs.SSN4.placeholder)}
											onChange={this.onChange}
											value={this.state.form[FormFields.SocialSecurityNumberShort].masked}
										/>
									</div>
								}
							</div>
						}
						<div className="row left">
							<label className={classnames('checkboxLabel', { error: this.state.form[FormFields.StripeAgreement].error })}>
								<input
									type="checkbox"
									name={FormFields.StripeAgreement}
									checked={this.state.form[FormFields.StripeAgreement].value}
									onChange={this.onChange}
								/>
								<div className="checkmark-box" />
								<span className="label-text">{StringResources.getString(Strings.BankingInfo.Inputs.StripeAgreement.BeforeLink)}<a href="https://stripe.com/us/legal" target="_blank">{StringResources.getString(Strings.BankingInfo.Inputs.StripeAgreement.Link)}</a>{StringResources.getString(Strings.BankingInfo.Inputs.StripeAgreement.AfterLink)}</span>
							</label>
						</div>
						<div className="separatorDiv h30 separatorDiv-if" />
						<div className="row right justify-center-xs">
							<button className="btn normal" disabled={this.state.fieldsError} onClick={this.onSubmit} type="submit" >{StringResources.getString(Strings.BankingInfo.Buttons.Update.title)}</button>
						</div>
					</form>
				</div>

				<div className={classnames('alertMessage', { active: this.state.fieldsError && StringUtils.isNotEmpty(this.state.errorText) })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate, this.state.errorText)}
				</div>
				<div className={classnames('alertMessage', { active: this.state.serverError })}>
					{this.state.errorText ? StringResources.getString(Strings.Common.Errors.ErrorTemplate, this.state.errorText) : StringResources.getString(Strings.Common.Errors.InternalError)}
				</div>
				<div className={classnames('alertMessage done', { active: this.state.done })}>
					{StringResources.getString(Strings.Common.Messages.UpdateSuccess)}
				</div>

				<div className="logosContainer">
					<div className="logo" />
				</div>
			</div>
		)
	}

	private initForm = (haulerType: Types.Enums.HaulerType | undefined, showSsnOrEin: boolean) => {
		let fields: any[] = [
			{
				name: FormFields.BankChoose,
				value: '',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.BankingInfo.Errors.Messages.NoBankData)
				}
			},
			{
				name: FormFields.BankRouting,
				value: '',
				validator: (value: any) => {
					return (this.state.form[FormFields.BankChoose].value === BankChoose.BankAccount &&
						(!this.stripe || !this.stripe.validateRoutingNumber(value, Countries.US))) ?
						'routingNumber' :
						undefined
				},
				messages: {
					routingNumber: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidRoutingNumber)
				}
			},
			{
				name: FormFields.BankAccountNumber,
				value: '',
				validator: (value: any) => {
					return (this.state.form[FormFields.BankChoose].value === BankChoose.BankAccount &&
						(!this.stripe || !this.stripe.validateAccountNumber(value, Countries.US))) ?
						'accountNumber' :
						undefined
				},
				messages: {
					accountNumber: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidAccountNumber)
				}
			},
			{
				name: FormFields.DebitCardNumber,
				value: '',
				validator: (value: any) => {
					return (this.state.form[FormFields.BankChoose].value === BankChoose.DebitCard &&
						(!this.stripe || !this.stripe.validateCardNumber(value))) ?
						'cardNumber' :
						undefined
				},
				messages: {
					cardNumber: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidCardNumber)
				}
			},
			{
				name: FormFields.ExpireDate,
				value: '',
				validator: (value: any) => {
					return (this.state.form[FormFields.BankChoose].value === BankChoose.DebitCard &&
						(!this.stripe || !this.stripe.validateExpireDateStr(value))) ?
						'expire' :
						undefined
				},
				messages: {
					expire: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidExpireDate)
				},
				masker: new Masker(Masker.expireDateMask, Masker.placeSymbol),
				passMaskedToValidation: true
			},
			{
				name: FormFields.CVCNumber,
				value: '',
				validator: (value: any) => {
					return (this.state.form[FormFields.BankChoose].value === BankChoose.DebitCard &&
						(!this.stripe || !this.stripe.validateCvc(value))) ?
						'cvc' :
						undefined
				},
				messages: {
					cvc: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidCVV)
				}
			},
			{
				name: FormFields.StripeAgreement,
				value: false,
				validator: (value: any) => {
					return !value ? 'agr' : undefined
				},
				messages: {
					agr: StringResources.getString(Strings.BankingInfo.Errors.Messages.NoAgreement)
				}
			}
		]
		if (showSsnOrEin) {
			if (haulerType === Types.Enums.HaulerType.INDEPENDENT_HAULER) {
				fields.push({
					name: FormFields.SocialSecurityNumber,
					value: '',
					validator: Validators.ssn,
					messages: {
						ssn: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidSSN)
					},
					masker: new Masker(Masker.ssnMask, Masker.placeSymbol)
				})
			} else {
				fields.push({
					name: FormFields.EmployerIdentificationNumber,
					value: '',
					validator: Validators.ein,
					messages: {
						ein: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidEIN)
					},
					masker: new Masker(Masker.einMask, Masker.placeSymbol)
				})
				fields.push({
					name: FormFields.SocialSecurityNumberShort,
					value: '',
					validator: Validators.ssn4,
					messages: {
						ssn4: StringResources.getString(Strings.BankingInfo.Errors.Messages.InvalidSSN4)
					},
					masker: new Masker(Masker.ssn4Mask, Masker.placeSymbol)
				})
			}
		}
		return new FormValidator<FormType>(fields)
	}

}

function mapStateToProps(state: StoreState) {
	return {
		haulerInfo: state.personalInfo,
		vehicleInfo: state.vehicleInfo,
		driversLicenseInfo: state.driverLicense,
		isBankingInfoProvided: state.bankInfo.bankInfoProvided
	}
}

function mapDispatchToProps(dispatch: Dispatch<BankInfoAction | TabAction>) {
	return {
		setBankInfoProvided: () => dispatch(BankInfoActions.setBankInfoProvided(true)),
		enableLoader: () => dispatch(Actions.startLoading()),
		disableLoader: () => dispatch(Actions.endLoading()),
		goToOverview: () => dispatch(Actions.selectTab(OverviewTab.APP_OVERVIEW_TAB))
	}
}

export const BankInfoContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(BankingInfo) as ComponentClass<BankingInfoCallbackProps>
