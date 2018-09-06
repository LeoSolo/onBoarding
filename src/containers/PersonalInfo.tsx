import * as React from 'react'
import * as moment from 'moment'
import * as classnames from 'classnames'

import Select from 'react-select'
import { Uploader } from '../components/Uploader'
import { RolodexDatePicker } from '../components/RolodexDatePicker'
import { mockingOptions } from '../mocks/mock'

import 'react-image-crop/dist/ReactCrop.css'

import { EventType, EventService } from '../services/events/events'

import { Api } from '../services/api/api'

import { PersonalInfoAction, Actions as PersonalInfoActions } from '../actions/personalInfo'
import { TabAction, Actions } from '../actions/tab'
import { Actions as ServiceActions, ActionType as ServiceActionType } from '../actions/service'
import { OverviewTab } from '../constants/overviewTabs'

import { PhoneUtils } from '../utils'
import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'
import * as ValidatorUtils from '../utils/validation/Validator'
import * as StringUtils from '../utils/StringUtils'
import * as DeviceUtils from '../utils/DeviceUtils'
import { Masker } from '../utils/masker/Masker'

import * as Enums from '../types/enum'
import { HaulerInfo } from '../types'

import { StoreState } from '../reducers'
import { Dispatch, connect } from 'react-redux'

import '../styles/PersonalInfo.scss'
import { ObjectUtils } from '../utils/ObjectUtils'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

enum FormFields {
	Avatar = 'avatarInput',
	CompanyName = 'companyNameInput',
	HaulerType = 'haulerTypeInput',
	FirstName = 'firstNameInput',
	LastName = 'lastNameInput',
	Email = 'emailInput',
	Phone = 'phoneInput',
	Street = 'streetInput',
	City = 'cityInput',
	State = 'stateSelect',
	Zip = 'zipInput',
	BirthDate = 'birthDate'
}

interface FormType {
	[FormFields.Avatar]: FieldValidatedValue
	[FormFields.CompanyName]: FieldValidatedValue
	[FormFields.HaulerType]: FieldValidatedValue
	[FormFields.FirstName]: FieldValidatedValue
	[FormFields.LastName]: FieldValidatedValue
	[FormFields.Email]: FieldValidatedValue
	[FormFields.Phone]: FieldValidatedValue
	[FormFields.Street]: FieldValidatedValue
	[FormFields.City]: FieldValidatedValue
	[FormFields.State]: FieldValidatedValue
	[FormFields.Zip]: FieldValidatedValue
	[FormFields.BirthDate]: FieldValidatedValue
}

interface PersonalInfoProps {
	haulerInfo: HaulerInfo
	setPersonalInfo: (haulerInfo: HaulerInfo) => PersonalInfoAction
	enableLoader: () => TabAction
	disableLoader: () => TabAction
	goToOverview: () => TabAction
	setCheckNoSlots: () => ServiceActionType
}

interface PersonalInfoStates {
	form: FormType
	error: boolean
	errorText?: string
	done: boolean
	fieldsError: boolean
	serverError: boolean
	avatarBlob: any
	avatarLink: string
	isPhotoChanged: boolean
	isFormChanged: boolean
	isEmailChanged: boolean
}

class PersonalInfo extends React.Component<PersonalInfoProps, PersonalInfoStates> {

	private formValidator: FormValidator<FormType>
	private isComponentMounted: boolean = false

	constructor(props: any) {
		super(props)
		this.formValidator = this.initForm()
		this.state = {
			form: this.formValidator.values(),
			errorText: '',
			done: false,
			fieldsError: false,
			serverError: false,
			avatarBlob: null,
			avatarLink: '',
			error: false,
			isPhotoChanged: false,
			isFormChanged: false,
			isEmailChanged: false
		}
	}
	componentDidMount() {
		EventService.pushEvent(EventType.HAULER_PERSONAL_INFO_TAB_ACTIVATED)
		this.props.setCheckNoSlots()
		if (!this.isComponentMounted) {
			this.formValidator = this.initForm()
			this.updateStateByValidator()
			this.isComponentMounted = true
		}
	}
	updateStateByValidator = () => {
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid(),
			errorText: this.formValidator.getError(),
			error: false,
			serverError: false,
			done: false,
			isFormChanged: this.isFormChanged(this.formValidator.values()),
			isEmailChanged: this.props.haulerInfo.mailingAddress !== this.formValidator.value(FormFields.Email).value
		})
	}
	handleChange = (date: moment.Moment) => {
		this.formValidator.setState([{
			name: FormFields.BirthDate,
			value: moment(date).utc().valueOf()
		}])
		this.updateStateByValidator()
	}
	handleSelectChange = (name) => {
		return (value: any) => {
			this.formValidator.setState([{
				name: name,
				value: value ? value.value : null
			}])
			if (name === FormFields.HaulerType) {
				this.formValidator.setState([{
					name: FormFields.CompanyName,
					value: this.state.form[FormFields.CompanyName].value
				}])
			}
			this.updateStateByValidator()
		}
	}
	onChange = (e: React.ChangeEvent<HTMLInputElement> & Event) => {
		this.formValidator.setState([
			{
				name: e.target.name,
				value: e.target.value
			}
		])
		this.updateStateByValidator()
	}

	generatePathForUploadImgs = () => {
		return new Promise((resolve, reject) => {
			Api.requestAttachmentUrl({
				type: Enums.AttachmentType.AVATAR_PICTURE,
				ownerId: this.props.haulerInfo.mailingAddress ? this.props.haulerInfo.mailingAddress : '',
				overwrite: true
			})
				.then(body => {
					Api.attachBlob(body.url, this.state.avatarBlob)
						.then(result => {
							this.setState({
								avatarLink: body.url
							}, () => {
								resolve()
							})
						})
						.catch(error => {
							reject(error)
						})
				})
				.catch(error => {
					reject(error)
				})
		})
	}

	getAvatar = (imgBlob: any, imageAsDataUri: string) => {
		this.formValidator.setState([{
			name: FormFields.Avatar,
			value: imageAsDataUri
		}])
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid(),
			errorText: this.formValidator.getError(),
			avatarBlob: imgBlob,
			error: false,
			serverError: false,
			done: false,
			isPhotoChanged: true
		})
	}
	isFormChanged = (form: FormType) => {
		let newDomain = this.mapFormToDomain(form)
		let isChanged = !ObjectUtils.isEquals(newDomain, this.props.haulerInfo)
		return isChanged
	}
	mapFormToDomain = (form: FormType) => {
		let domain: HaulerInfo = {
			companyId: form[FormFields.CompanyName].value.trim() ? form[FormFields.CompanyName].value.trim() : ' ',
			type: form[FormFields.HaulerType].value.trim(),
			firstName: form[FormFields.FirstName].value.trim(),
			lastName: form[FormFields.LastName].value.trim(),
			mailingAddress: form[FormFields.Email].value.trim(),
			primaryPhone: PhoneUtils.cleanPhoneNumber(form[FormFields.Phone].value.trim()),
			address: form[FormFields.Street].value.trim(),
			city: form[FormFields.City].value.trim(),
			state: form[FormFields.State].value.trim(),
			zip: form[FormFields.Zip].value.trim(),
			birthday: form[FormFields.BirthDate].value
		}
		return domain
	}
	onSubmit = (e: any) => {
		e.preventDefault()
		this.formValidator.validate()
		this.setState({
			form: this.formValidator.values(),
			fieldsError: !this.formValidator.isValid(),
			errorText: this.formValidator.getError(),
			error: false,
			serverError: false,
			done: false
		}, () => {
			if (!this.state.fieldsError) {
				this.props.enableLoader()
				let haulerInfo: HaulerInfo = {
					...this.mapFormToDomain(this.state.form),
					infoStatus: Enums.HaulerInfoStatus.REVIEW_PENDING
				}
				let currentPromise = Promise.resolve({})
				if (this.state.avatarBlob && !this.state.form[FormFields.Avatar].error) {
					currentPromise = currentPromise.then(() => { return this.generatePathForUploadImgs() })
				}
				if (this.state.isFormChanged) {
					currentPromise = currentPromise.then(() => { return Api.updateHaulerInfo(haulerInfo) })
				}
				currentPromise
					.then(body => {
						this.props.setPersonalInfo({
							...haulerInfo,
							avatar: this.state.form[FormFields.Avatar].value.trim()
						})
						this.setState({
							done: true,
							serverError: false
						})
						this.props.disableLoader()
						this.props.goToOverview()
					})
					.catch(error => {
						this.setState({
							errorText: error && error.response && error.response.data && error.response.data.error && error.response.data.error.description,
							done: false,
							serverError: true
						})
						this.props.disableLoader()
					})
			}
		})
	}
	render() {
		let selectWhoseHaulerOptions = mockingOptions.whoseHauler.map((item: any): Object => {
			return { label: item.title, value: item.value }
		})
		let selectStateOptions = mockingOptions.state.map((item: string): Object => {
			return { label: item, value: item }
		})

		return (
			<div>
				<div className="tabTitle">
					<div className={classnames('avatarImg', { error: this.state.form[FormFields.Avatar].error })}>
						{StringResources.getString(Strings.PersonalInfo.Inputs.ProfilePicture.placeholder)}
						<Uploader
							onCropEnded={this.getAvatar}
							img={this.state.form[FormFields.Avatar].value}
							name={FormFields.Avatar}
							useCrop={true}
							onLoadStart={this.props.enableLoader}
							onLoadEnd={this.props.disableLoader}
						/>
					</div>
					<p className="description">{StringResources.getString(Strings.PersonalInfo.SubTitle)}</p>
				</div>

				<div className="separatorDiv" />

				<form className="inputsContainer" onSubmit={this.onSubmit}>
					<div className="overviewContainerTitle">{StringResources.getString(Strings.PersonalInfo.BlockTitle.ContactInformation)}</div>
					<input
						type="text"
						name={FormFields.CompanyName}
						className={classnames({
							error: this.state.form[FormFields.CompanyName].error && this.state.form[FormFields.HaulerType].value === Enums.HaulerType.DONATION_HAULER,
							success: !this.state.form[FormFields.CompanyName].error
								&& this.state.form[FormFields.CompanyName].touched
								&& this.state.form[FormFields.HaulerType].value === Enums.HaulerType.DONATION_HAULER
								&& this.state.form[FormFields.CompanyName].value
						})}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.CompanyName.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.CompanyName].value}
					/>
					<Select
						options={selectWhoseHaulerOptions}
						value={this.state.form[FormFields.HaulerType].value}
						searchable={false}
						clearable={false}
						onChange={this.handleSelectChange(FormFields.HaulerType)}
						className="selectComponent"
						classes={{
							selectValue: 'selectValue',
							selectArrow: 'selectArrow'
						}}
					/>
					<input
						className={classnames({
							error: this.state.form[FormFields.FirstName].error,
							success: !this.state.form[FormFields.FirstName].error && this.state.form[FormFields.FirstName].touched
						})}
						type="text"
						name={FormFields.FirstName}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.FirstName.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.FirstName].value}
					/>
					<input
						className={classnames({
							error: this.state.form[FormFields.LastName].error,
							success: !this.state.form[FormFields.LastName].error && this.state.form[FormFields.LastName].touched
						})}
						type="text"
						name={FormFields.LastName}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.LastName.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.LastName].value}
					/>
					<input
						className={classnames({ error: this.state.form[FormFields.Email].error })}
						type="text"
						name={FormFields.Email}
						readOnly={true}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.Email.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.Email].value}
					/>
					<input
						className={classnames({
							error: this.state.form[FormFields.Phone].error,
							success: !this.state.form[FormFields.Phone].error && this.state.form[FormFields.Phone].touched
						})}
						type="text"
						name={FormFields.Phone}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.Phone.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.Phone].masked}
					/>
					<input
						className={classnames({
							error: this.state.form[FormFields.Street].error,
							success: !this.state.form[FormFields.Street].error && this.state.form[FormFields.Street].touched
						})}
						type="text"
						name={FormFields.Street}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.Street.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.Street].value}
					/>
					<input
						className={classnames({
							error: this.state.form[FormFields.City].error,
							success: !this.state.form[FormFields.City].error && this.state.form[FormFields.City].touched
						})}
						type="text"
						name={FormFields.City}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.City.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.City].value}
					/>
					<Select
						options={selectStateOptions}
						value={this.state.form[FormFields.State].value}
						searchable={!DeviceUtils.isMobileDevice()}
						clearable={true}
						onChange={this.handleSelectChange(FormFields.State)}
						className={classnames('selectComponent', {
							error: this.state.form[FormFields.State].error,
							success: !this.state.form[FormFields.State].error && this.state.form[FormFields.State].touched
						})}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.State.placeholder)}
						classes={{
							selectValue: 'selectValue',
							selectArrow: 'selectArrow'
						}}
					/>
					<input
						className={classnames({
							error: this.state.form[FormFields.Zip].error,
							success: !this.state.form[FormFields.Zip].error && this.state.form[FormFields.Zip].touched
						})}
						type="text"
						name={FormFields.Zip}
						placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.ZipCode.placeholder)}
						onChange={this.onChange}
						value={this.state.form[FormFields.Zip].value}
						maxLength={5}
					/>

					<div className="dateInputContainer">
						<RolodexDatePicker
							className={classnames({
								error: this.state.form[FormFields.BirthDate].error,
								success: !this.state.form[FormFields.BirthDate].error && this.state.form[FormFields.BirthDate].touched
							})}
							placeholder={StringResources.getString(Strings.PersonalInfo.Inputs.DateOfBirth.placeholder)}
							openToDate={this.state.form[FormFields.BirthDate].value ? moment.utc(this.state.form[FormFields.BirthDate].value) : moment().year(moment().year() - 30)}
							maxDate={moment()}
							value={this.state.form[FormFields.BirthDate].value ? moment.utc(this.state.form[FormFields.BirthDate].value) : undefined}
							minDate={moment().year(moment().year() - 100)}
							onChange={this.handleChange}
							format="MM/DD/YYYY"
							readonly={DeviceUtils.isMobileDevice()}
						/>
						<div className="calendarIcon" />
					</div>

					<div className="separatorDiv h30 separatorDiv-if" />
					<div className="row right justify-center-xs">
						<button className="btn normal" disabled={(!this.state.isPhotoChanged && !this.state.isFormChanged) || this.state.fieldsError} onClick={this.onSubmit} type="submit">{StringResources.getString(Strings.PersonalInfo.Buttons.Submit.title)}</button>
					</div>
				</form>

				<div className={classnames('alertMessage', { active: this.state.fieldsError && StringUtils.isNotEmpty(this.state.errorText) })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate,this.state.errorText)}
				</div>
				<div className={classnames('alertMessage', { active: this.state.serverError })}>
					{StringResources.getString(Strings.Common.Errors.InternalError)}
				</div>
				<div className={classnames('alertMessage done', { active: this.state.done })}>
					{this.state.isEmailChanged ? StringResources.getString(Strings.PersonalInfo.Messages.EmailUpdateSuccessful) : StringResources.getString(Strings.Common.Messages.UpdateSuccess)}
				</div>
			</div>
		)
	}

	private initForm = () => {
		return new FormValidator<FormType>([
			{
				name: FormFields.CompanyName,
				value: this.props.haulerInfo.companyId ? this.props.haulerInfo.companyId.trim() : '',
				validator: (value: any) => {
					return this.formValidator.value(FormFields.HaulerType).value === Enums.HaulerType.DONATION_HAULER ? Validators.empty(value) : undefined
				},
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.CompanyRequired)
				}
			},
			{
				name: FormFields.FirstName,
				value: this.props.haulerInfo.firstName,
				validator: Validators.name,
				messages: {
					name: StringResources.getString(Strings.PersonalInfo.Errors.Messages.WrongName)
				}
			},
			{
				name: FormFields.LastName,
				value: this.props.haulerInfo.lastName,
				validator: Validators.name,
				messages: {
					name: StringResources.getString(Strings.PersonalInfo.Errors.Messages.WrongLastName)
				}
			},
			{
				name: FormFields.Email,
				value: this.props.haulerInfo.mailingAddress,
				validator: Validators.email,
				messages: {
					email: StringResources.getString(Strings.PersonalInfo.Errors.Messages.WrongEmail)
				}
			},
			{
				name: FormFields.Phone,
				value: this.props.haulerInfo.primaryPhone ? PhoneUtils.cleanPhoneNumber(this.props.haulerInfo.primaryPhone, false) : this.props.haulerInfo.primaryPhone,
				validator: Validators.phone,
				messages: {
					phone: StringResources.getString(Strings.PersonalInfo.Errors.Messages.WrongPhone)
				},
				masker: new Masker(Masker.numberMask, Masker.placeSymbol)
			},
			{
				name: FormFields.Street,
				value: this.props.haulerInfo.address ? this.props.haulerInfo.address : '',
				validator: ValidatorUtils.composeValidators([
					Validators.empty,
					Validators.minLength(5)
				]),
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.Street.Empty),
					min: StringResources.getString(Strings.PersonalInfo.Errors.Messages.Street.Short)
				}
			},
			{
				name: FormFields.City,
				value: this.props.haulerInfo.city ? this.props.haulerInfo.city : '',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.InvalidCity)
				}
			},
			{
				name: FormFields.State,
				value: this.props.haulerInfo.state ? this.props.haulerInfo.state : '',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.InvalidState)
				}
			},
			{
				name: FormFields.Zip,
				value: this.props.haulerInfo.zip,
				validator: Validators.zipCode,
				messages: {
					zip: StringResources.getString(Strings.PersonalInfo.Errors.Messages.InvalidZip)
				}
			},
			{
				name: FormFields.BirthDate,
				value: this.props.haulerInfo.birthday ? this.props.haulerInfo.birthday : null,
				validator: ValidatorUtils.composeValidators([
					Validators.empty,
					(value: any) => {
						let momenty = moment(value)
						let back21 = moment().year(moment().year() - 21)
						return momenty.valueOf() > back21.valueOf() ? 'age' : undefined
					}
				]),
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.Age.Empty),
					age: StringResources.getString(Strings.PersonalInfo.Errors.Messages.Age.Less)
				}
			},
			{
				name: FormFields.HaulerType,
				value: this.props.haulerInfo.type ? this.props.haulerInfo.type : Enums.HaulerType.INDEPENDENT_HAULER,
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.EmptyProviderType)
				}
			},
			{
				name: FormFields.Avatar,
				value: this.props.haulerInfo.avatar ? this.props.haulerInfo.avatar : '',
				validator: ValidatorUtils.composeValidators([
					Validators.empty,
					Validators.minLength(10)
				]),
				messages: {
					empty: StringResources.getString(Strings.PersonalInfo.Errors.Messages.EmptyProfilePicutre)
				}
			}
		])
	}
}

function mapStatesToProps(state: StoreState) {
	return {
		haulerInfo: state.personalInfo
	}
}

function mapDispatchToProps(dispatch: Dispatch<PersonalInfoAction | TabAction | ServiceActionType>) {
	return {
		setPersonalInfo: (haulerInfo: HaulerInfo) => dispatch(PersonalInfoActions.updatePersonalInfo(haulerInfo)),
		enableLoader: () => dispatch(Actions.startLoading()),
		disableLoader: () => dispatch(Actions.endLoading()),
		goToOverview: () => dispatch(Actions.selectTab(OverviewTab.APP_OVERVIEW_TAB)),
		setCheckNoSlots: () => dispatch(ServiceActions.setIgnoreNoSlots(false))
	}
}

export const PersonalInfoContainer = connect(
	mapStatesToProps,
	mapDispatchToProps
)(PersonalInfo)
