import * as React from 'react'
import { RolodexDatePicker } from '../components/RolodexDatePicker'
import { Uploader } from '../components/Uploader'
import * as moment from 'moment'
import * as classnames from 'classnames'
import { mockingOptions } from '../mocks/mock'
import Select from 'react-select'

import { Dispatch, connect } from 'react-redux'
import { EventType, EventService } from '../services/events/events'

import { DriverLicenseAction, Actions as DriverLicenseActions } from '../actions/driversLicense'
import { TabAction, Actions } from '../actions/tab'
import { OverviewTab } from '../constants/overviewTabs'

import { ImageUtils } from '../utils'
import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'
import * as ValidatorUtils from '../utils/validation/Validator'
import * as StringUtils from '../utils/StringUtils'
import * as DeviceUtils from '../utils/DeviceUtils'

import { Api } from '../services/api/api'

import * as Types from '../types'
import { StoreState } from '../reducers'

import '../styles/DriversLicense.scss'
import { ObjectUtils } from '../utils/ObjectUtils'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface DriversLicenseProps {
	haulerInfo: Types.HaulerInfo
	driverLicenseInfo: Types.DriverLicenseInfo
	setDriverLicenseInfo: (licenseInfo: Types.DriverLicenseInfo) => DriverLicenseAction
	enableLoader: () => TabAction
	disableLoader: () => TabAction
	goToOverview: () => TabAction
}

enum FormFields {
	State = 'licenseState',
	Number = 'licenseNumber',
	ExpireDate = 'licenseExpireDate',
	FrontImage = 'frontLicensePhoto',
	BackImage = 'backLicensePhoto'
}

interface FormType {
	[FormFields.State]: FieldValidatedValue
	[FormFields.Number]: FieldValidatedValue
	[FormFields.ExpireDate]: FieldValidatedValue
	[FormFields.FrontImage]: FieldValidatedValue
	[FormFields.BackImage]: FieldValidatedValue
}

interface DriversLicenseStates {
	form: FormType
	startDate: any
	serverError: boolean
	fieldsError: boolean
	errorText?: string
	done: boolean
	frontImgBlob: any
	backImgBlob: any
	frontImgLink: string
	backImgLink: string
	isPhotoChanged: boolean
	isFormChanged: boolean
}

const widthRate = 25
const heightRate = 16

const defaultCrop = {
	aspect: widthRate / heightRate,
	x: 0,
	y: 0,
	height: 100
}

class DriversLicense extends React.Component<DriversLicenseProps, DriversLicenseStates> {

	private formValidator: FormValidator<FormType>
	private isComponentMounted: boolean = false

	constructor(props: any) {
		super(props)
		this.formValidator = this.initForm()
		this.state = {
			form: this.formValidator.values(),
			startDate: moment(),
			errorText: '',
			done: false,
			fieldsError: false,
			serverError: false,
			frontImgBlob: null,
			backImgBlob: null,
			frontImgLink: '',
			backImgLink: '',
			isPhotoChanged: false,
			isFormChanged: false
		}
	}
	componentDidMount() {
		EventService.pushEvent(EventType.HAULER_DRIVER_LICENSE_TAB_ACTIVATED)
		if (!this.isComponentMounted) {
			this.formValidator = this.initForm()
			this.setState({
				form: this.formValidator.values(),
				fieldsError: !this.formValidator.isValid(),
				errorText: this.formValidator.getError(),
				serverError: false,
				done: false
			})
			this.isComponentMounted = true
		}
	}

	getImage = (name: string) => {
		return (imageBlob: any, imageAsDataUrl: string) => {
			this.formValidator.setState([{
				name: name,
				value: imageAsDataUrl
			}])
			this.setState((prevState: DriversLicenseStates) => {
				return {
					...prevState,
					form: this.formValidator.values(),
					fieldsError: !this.formValidator.isValid(),
					errorText: this.formValidator.getError(),
					done: false,
					serverError: false,
					frontImgBlob: name === FormFields.FrontImage ? imageBlob : prevState.frontImgBlob,
					backImgBlob: name === FormFields.BackImage ? imageBlob : prevState.backImgBlob,
					isPhotoChanged: true
				}
			})
		}
	}
	generatePathForUploadImgs = (type: Types.Enums.AttachmentType) => {
		return new Promise((resolve, reject) => {
			Api.requestAttachmentUrl({
				type: type,
				ownerId: this.props.haulerInfo.mailingAddress ? this.props.haulerInfo.mailingAddress : '',
				overwrite: true
			})
				.then(body => {
					if (type === Types.Enums.AttachmentType.DRIVER_LICENSE_PICTURE_FRONT) {
						this.setState({
							frontImgLink: body.url
						}, () => {
							Api.attachBlob(body.url, this.state.frontImgBlob)
								.then(res => {
									resolve(res)
								})
								.catch(error => {
									reject(error)
								})
						})
					} else {
						this.setState({
							backImgLink: body.url
						}, () => {
							Api.attachBlob(body.url, this.state.backImgBlob)
								.then(res => {
									resolve(res)
								})
								.catch(error => {
									reject(error)
								})
						})
					}
				})
				.catch(error => {
					reject(error)
				})
		})

	}
	isFormChanged = (form: FormType) => {
		let newDomain = this.mapFormToDomain(form)
		let isChanged = !ObjectUtils.isEquals(newDomain, this.props.driverLicenseInfo)
		return isChanged
	}
	mapFormToDomain = (form: FormType) => {
		let domain: Types.DriverLicenseInfo = {
			state: form[FormFields.State].value,
			number: form[FormFields.Number].value,
			expirationDate: form[FormFields.ExpireDate].value
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
			serverError: false,
			done: false
		}, () => {
			if (this.formValidator.isValid()) {
				this.props.enableLoader()
				let currentPromise = Promise.resolve({})
				if (this.state.frontImgBlob && !this.state.form[FormFields.FrontImage].error) {
					currentPromise = currentPromise.then(() => {
						return this.generatePathForUploadImgs(Types.Enums.AttachmentType.DRIVER_LICENSE_PICTURE_FRONT)
					})
				}
				if (this.state.backImgBlob && !this.state.form[FormFields.BackImage].error) {
					currentPromise = currentPromise.then(() => {
						return this.generatePathForUploadImgs(Types.Enums.AttachmentType.DRIVER_LICENSE_PICTURE_BACK)
					})
				}
				let driverLicenseInfo: Types.DriverLicenseInfo = {
					...this.mapFormToDomain(this.state.form),
					infoStatus: Types.Enums.HaulerInfoStatus.REVIEW_PENDING
				}
				if (this.state.isFormChanged) {
					currentPromise = currentPromise.then(() => { return Api.updateHaulerInfo({ driveLicenseInformation: driverLicenseInfo }) })
				}
				currentPromise
					.then(body => {
						this.props.setDriverLicenseInfo({
							...driverLicenseInfo,
							frontPictures: this.state.form[FormFields.FrontImage].value,
							backPictures: this.state.form[FormFields.BackImage].value
						})
						this.setState({
							done: true,
							serverError: false
						})
						this.props.disableLoader()
						this.props.goToOverview()
					})
					.catch(error => {
						console.log(error)
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
	createPixelCrop = (image: any) => {
		return ImageUtils.generatePixelCrop(image, widthRate, heightRate)
	}
	updateStateByValidator = () => {
		this.setState((prevState) => {
			return {
				...prevState,
				form: this.formValidator.values(),
				fieldsError: !this.formValidator.isValid(),
				errorText: this.formValidator.getError(),
				serverError: false,
				done: false,
				isFormChanged: this.isFormChanged(this.formValidator.values())
			}
		})
	}
	handleChange = (date: any) => {
		this.formValidator.setState([{
			name: FormFields.ExpireDate,
			value: moment(date).utc().valueOf()
		}])
		this.updateStateByValidator()
	}
	handleSelectChange = (name) => {
		return (newValue) => {
			this.formValidator.setState([{
				name: name,
				value: newValue ? newValue.value : null
			}])
			this.updateStateByValidator()
		}
	}
	onChange = (e: React.ChangeEvent<HTMLInputElement> & Event) => {
		this.formValidator.setState([{
			name: e.target.name,
			value: e.target.value
		}])
		this.updateStateByValidator()
	}
	render() {
		let selectStateOptions = mockingOptions.state.map((item: string): Object => {
			return { label: item, value: item }
		})

		return (
			<div>
				<div className="tabTitle">
					<div className="licenseImg" />
					<p className="description">
						{StringResources.getString(Strings.DriversLicense.SubTitle)}
                    </p>
				</div>

				<div className="inputsContainer">
					<div className="overviewContainerTitle">{StringResources.getString(Strings.DriversLicense.ContainerTitle)}</div>
					<div className="imgsContainer">
						<div className={classnames('frontLicense licensePhoto', { error: this.state.form[FormFields.FrontImage].error })}>
							{StringResources.getString(Strings.DriversLicense.Inputs.FrontImage.placeholder)}
							<Uploader
								useCrop={true}
								name={FormFields.FrontImage}
								img={this.state.form[FormFields.FrontImage].value}
								crop={defaultCrop}
								createPixelCrop={this.createPixelCrop}
								onCropEnded={this.getImage(FormFields.FrontImage)}
								onLoadStart={this.props.enableLoader}
								onLoadEnd={this.props.disableLoader}
							/>
						</div>
						<div className={classnames('backLicense licensePhoto', { error: this.state.form[FormFields.BackImage].error })}>
							{StringResources.getString(Strings.DriversLicense.Inputs.BackImage.placeholder)}
							<Uploader
								useCrop={true}
								name={FormFields.BackImage}
								img={this.state.form[FormFields.BackImage].value}
								crop={defaultCrop}
								createPixelCrop={this.createPixelCrop}
								onCropEnded={this.getImage(FormFields.BackImage)}
								onLoadStart={this.props.enableLoader}
								onLoadEnd={this.props.disableLoader}
							/>
						</div>
					</div>
					<form onSubmit={this.onSubmit}>
						<div className="inputRow">
							<input
								className={classnames('driverLicenseInput', {
									error: this.state.form[FormFields.Number].error,
									success: !this.state.form[FormFields.Number].error && this.state.form[FormFields.Number].touched
								})}
								type="text"
								name={FormFields.Number}
								placeholder={StringResources.getString(Strings.DriversLicense.Inputs.DriversLicenseNumber.placeholder)}
								value={this.state.form[FormFields.Number].value}
								onChange={this.onChange}
							/>
							<Select
								options={selectStateOptions}
								value={this.state.form[FormFields.State].value}
								searchable={!DeviceUtils.isMobileDevice()}
								clearable={true}
								onChange={this.handleSelectChange(FormFields.State)}
								className={classnames('selectComponent stateSelect', {
									error: this.state.form[FormFields.State].error,
									success: !this.state.form[FormFields.State].error && this.state.form[FormFields.State].touched
								})}
								placeholder={StringResources.getString(Strings.DriversLicense.Inputs.State.placeholder)}
								classes={{
									selectValue: 'selectValue',
									selectArrow: 'selectArrow'
								}}
							/>
							<div className="forDatePicker">
								<RolodexDatePicker
									className={classnames({
										error: this.state.form[FormFields.ExpireDate].error,
										success: !this.state.form[FormFields.ExpireDate].error && this.state.form[FormFields.ExpireDate].touched
									})}
									placeholder={StringResources.getString(Strings.DriversLicense.Inputs.ExpirationDate.placeholder)}
									minDate={moment().day(moment().day() + 1)}
									value={this.state.form[FormFields.ExpireDate].value ? moment.utc(this.state.form[FormFields.ExpireDate].value) : undefined}
									onChange={this.handleChange}
									format="MM/DD/YYYY"
									readonly={DeviceUtils.isMobileDevice()}
								/>
								<div className="calendarIcon" />
							</div>
						</div>
						<div className="separatorDiv h30 separatorDiv-if" />
						<div className="row right justify-center-xs">
							<button className="btn normal" disabled={(!this.state.isPhotoChanged && !this.state.isFormChanged) || this.state.fieldsError} onClick={this.onSubmit} type="submit">{StringResources.getString(Strings.DriversLicense.Buttons.Update.title)}</button>
						</div>
					</form>
				</div>

				<div className={classnames('alertMessage', { active: this.state.fieldsError && StringUtils.isNotEmpty(this.state.errorText) })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate,this.state.errorText)}
				</div>
				<div className={classnames('alertMessage', { active: this.state.serverError })}>
					{StringResources.getString(Strings.Common.Errors.InternalError)}
				</div>
				<div className={classnames('alertMessage done', { active: this.state.done })}>
					{StringResources.getString(Strings.Common.Messages.UpdateSuccess)}
				</div>
			</div>
		)
	}

	private initForm = () => {
		return new FormValidator<FormType>([
			{
				name: FormFields.Number,
				value: this.props.driverLicenseInfo.number ? this.props.driverLicenseInfo.number : '',
				validator: Validators.license,
				messages: {
					license: StringResources.getString(Strings.DriversLicense.Errors.Messages.InvalidLicenseNumber)
				}
			},
			{
				name: FormFields.ExpireDate,
				value: this.props.driverLicenseInfo.expirationDate ? this.props.driverLicenseInfo.expirationDate : null,
				validator: ValidatorUtils.composeValidators([
					Validators.empty,
					(value: any) => {
						let momenty = moment(value)
						let now = moment()
						return now.valueOf() > momenty.valueOf() ? 'expire' : undefined
					}
				]),
				messages: {
					empty: StringResources.getString(Strings.DriversLicense.Errors.Messages.ExpireDate.Empty),
					expire: StringResources.getString(Strings.DriversLicense.Errors.Messages.ExpireDate.Invalid)
				}
			},
			{
				name: FormFields.State,
				value: this.props.driverLicenseInfo.state ? this.props.driverLicenseInfo.state : '',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.DriversLicense.Errors.Messages.EmptyState)
				}
			},
			{
				name: FormFields.FrontImage,
				value: this.props.driverLicenseInfo.frontPictures ? this.props.driverLicenseInfo.frontPictures : '',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.DriversLicense.Errors.Messages.Photo.Front.empty)
				}
			},
			{
				name: FormFields.BackImage,
				value: this.props.driverLicenseInfo.backPictures ? this.props.driverLicenseInfo.backPictures : '',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.DriversLicense.Errors.Messages.Photo.Rear.empty)
				}
			}
		])
	}
}

function mapStatesToProps(state: StoreState) {
	return {
		haulerInfo: state.personalInfo,
		driverLicenseInfo: state.driverLicense
	}
}

function mapDispatchToProps(dispatch: Dispatch<DriverLicenseAction>) {
	return {
		setDriverLicenseInfo: (licenseInfo: Types.DriverLicenseInfo) => dispatch(DriverLicenseActions.updateLicenseInfo(licenseInfo)),
		enableLoader: () => dispatch(Actions.startLoading()),
		disableLoader: () => dispatch(Actions.endLoading()),
		goToOverview: () => dispatch(Actions.selectTab(OverviewTab.APP_OVERVIEW_TAB))
	}
}

export const DriverLicenseContainer = connect(
	mapStatesToProps,
	mapDispatchToProps
)(DriversLicense)
