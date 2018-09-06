import * as React from 'react'
import Select from 'react-select'

import { Uploader } from '../components/Uploader'
import { mockingOptions } from '../mocks/mock'
import * as classnames from 'classnames'
import { Dispatch, connect } from 'react-redux'

import { ImageUtils } from '../utils'
import { FormValidator, FieldValidatedValue } from '../utils/validation/FormValidator'
import * as Validators from '../utils/validation/Validators'
import * as StringUtils from '../utils/StringUtils'
import * as DeviceUtils from '../utils/DeviceUtils'

import { EventType, EventService } from '../services/events/events'

import { Api } from '../services/api/api'

import { VehicleAction, Actions as VehicleActions } from '../actions/vehicle'
import { TabAction, Actions } from '../actions/tab'
import { OverviewTab } from '../constants/overviewTabs'
import { StoreState } from '../reducers'

import * as Types from '../types'

import '../styles/VehicleInfo.scss'
import { ObjectUtils } from '../utils/ObjectUtils'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'

interface VehicleInfoProps {
	vehicleInfo: Types.VehicleInfo
	haulerInfo: Types.HaulerInfo
	setVehicleInfo: (VehicleInfo: Types.VehicleInfo) => VehicleAction
	enableLoader: () => TabAction
	disableLoader: () => TabAction
	goToOverview: () => TabAction
}

enum FormFields {
	Brand = 'Brand',
	Model = 'Model',
	Year = 'Year',
	Profile = 'Profile',
	CarPhoto1 = 'CarPhoto1',
	CarPhoto2 = 'CarPhoto2',
	CarPhoto3 = 'CarPhoto3',
	CarPhoto4 = 'CarPhoto4'
}

interface FormType {
	[FormFields.Brand]: FieldValidatedValue
	[FormFields.Model]: FieldValidatedValue
	[FormFields.Year]: FieldValidatedValue
	[FormFields.Profile]: FieldValidatedValue
	[FormFields.CarPhoto1]: FieldValidatedValue
	[FormFields.CarPhoto2]: FieldValidatedValue
	[FormFields.CarPhoto3]: FieldValidatedValue
	[FormFields.CarPhoto4]: FieldValidatedValue
}

interface VehicleInfoStates {
	form: FormType
	done: boolean
	serverError: boolean
	fieldsError: boolean
	errorText?: string
	carBlob1: any
	carBlob2: any
	carBlob3: any
	carBlob4: any
	carBlob1Link: string
	carBlob2Link: string
	carBlob3Link: string
	carBlob4Link: string
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

class VehicleInfo extends React.Component<VehicleInfoProps, VehicleInfoStates> {

	private formValidator: FormValidator<FormType>
	private isComponentMounted: boolean = false

	constructor(props: any) {
		super(props)
		this.formValidator = this.initForm()
		this.state = {
			form: this.formValidator.values(),
			done: false,
			serverError: false,
			fieldsError: false,
			carBlob1: null,
			carBlob2: null,
			carBlob3: null,
			carBlob4: null,
			carBlob1Link: '',
			carBlob2Link: '',
			carBlob3Link: '',
			carBlob4Link: '',
			isPhotoChanged: false,
			isFormChanged: false
		}
	}
	componentDidMount() {
		EventService.pushEvent(EventType.HAULER_VEHICLE_INFO_TAB_ACTIVATED)
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
	handleSelectChange = (name) => {
		return (value: any) => {
			if (name === FormFields.Brand && value !== this.formValidator.value(FormFields.Brand).value) {
				let newModelName = this.getFirstModelValue(value)
				this.formValidator.setState([{
					name: FormFields.Model,
					value: newModelName
				}])
			}
			this.formValidator.setState([{
				name: name,
				value: value ? value.value : null
			}])
			this.setState({
				form: this.formValidator.values(),
				fieldsError: !this.formValidator.isValid(),
				errorText: this.formValidator.getError(),
				serverError: false,
				done: false,
				isFormChanged: this.isFormChanged(this.formValidator.values())
			})
		}
	}
	getFirstModelValue = (brand: string) => {
		// TODO remove this
		if (brand) {
			return mockingOptions[brand] ? mockingOptions[brand][0] : ''
		} else {
			return undefined
		}
	}
	onImageLoaded = (name) => {
		return (imageBlob, imageAsDataUrl) => {
			this.formValidator.setState([{
				name: name,
				value: imageAsDataUrl
			}])
			this.setState((prevState: VehicleInfoStates) => {
				return {
					form: this.formValidator.values(),
					fieldsError: !this.formValidator.isValid(),
					errorText: this.formValidator.getError(),
					serverError: false,
					done: false,
					carBlob1: name === FormFields.CarPhoto1 ? imageBlob : prevState.carBlob1,
					carBlob2: name === FormFields.CarPhoto2 ? imageBlob : prevState.carBlob2,
					carBlob3: name === FormFields.CarPhoto3 ? imageBlob : prevState.carBlob3,
					carBlob4: name === FormFields.CarPhoto4 ? imageBlob : prevState.carBlob4,
					isPhotoChanged: true
				}
			})
		}
	}
	createPixelCrop = (image) => {
		return ImageUtils.generatePixelCrop(image, widthRate, heightRate)
	}
	generatePathForUploadImgs = (name) => {
		let type = name === FormFields.CarPhoto1 ?
			Types.Enums.AttachmentType.VEHICLE_PICTURE_A :
			(name === FormFields.CarPhoto2 ?
				Types.Enums.AttachmentType.VEHICLE_PICTURE_B :
				(name === FormFields.CarPhoto3 ?
					Types.Enums.AttachmentType.VEHICLE_PICTURE_C :
					(name === FormFields.CarPhoto4 ?
						Types.Enums.AttachmentType.VEHICLE_PICTURE_D :
						undefined)
				)
			)
		let blob = name === FormFields.CarPhoto1 ?
			this.state.carBlob1 :
			(name === FormFields.CarPhoto2 ?
				this.state.carBlob2 :
				(name === FormFields.CarPhoto3 ?
					this.state.carBlob3 :
					(name === FormFields.CarPhoto4 ?
						this.state.carBlob4 :
						undefined)
				)
			)
		if (!blob || !type) {
			return new Promise((resolve, reject) => {
				reject()
			})
		}
		return new Promise((resolve, reject) => {
			Api.requestAttachmentUrl({
				type: type as Types.Enums.AttachmentType,
				ownerId: this.props.haulerInfo.mailingAddress ? this.props.haulerInfo.mailingAddress : '',
				overwrite: true
			})
				.then(result => {
					console.log('Response ', result)
					this.setState({
						carBlob1Link: name === FormFields.CarPhoto1 ? result.url : '',
						carBlob2Link: name === FormFields.CarPhoto2 ? result.url : '',
						carBlob3Link: name === FormFields.CarPhoto3 ? result.url : '',
						carBlob4Link: name === FormFields.CarPhoto4 ? result.url : ''
					}, () => {
						Api.attachBlob(result.url, blob)
							.then(body => {
								resolve(body)
							})
							.catch(error => {
								reject(error)
							})
					})
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	isFormChanged = (form: FormType) => {
		let newDomain = this.mapFormToDomainObject(form)
		let isChanged = !ObjectUtils.isEquals(newDomain, this.props.vehicleInfo)
		return isChanged
	}
	mapFormToDomainObject = (form: FormType) => {
		let result: Types.VehicleInfo = {
			brand: form[FormFields.Brand].value,
			model: form[FormFields.Model].value,
			year: form[FormFields.Year].value,
			profile: form[FormFields.Profile].value
		}
		return result
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
				if (this.state.carBlob1 && !this.state.form[FormFields.CarPhoto1].error) {
					currentPromise = currentPromise.then(() => { return this.generatePathForUploadImgs(FormFields.CarPhoto1) })
				}
				if (this.state.carBlob2 && !this.state.form[FormFields.CarPhoto2].error) {
					currentPromise = currentPromise.then(() => { return this.generatePathForUploadImgs(FormFields.CarPhoto2) })
				}
				if (this.state.carBlob3 && !this.state.form[FormFields.CarPhoto3].error) {
					currentPromise = currentPromise.then(() => { return this.generatePathForUploadImgs(FormFields.CarPhoto3) })
				}
				if (this.state.carBlob4 && !this.state.form[FormFields.CarPhoto4].error) {
					currentPromise = currentPromise.then(() => { return this.generatePathForUploadImgs(FormFields.CarPhoto4) })
				}
				let vehicleInfo: Types.VehicleInfo = {
					...this.mapFormToDomainObject(this.state.form),
					infoStatus: Types.Enums.HaulerInfoStatus.REVIEW_PENDING
				}
				if (this.state.isFormChanged) {
					currentPromise = currentPromise.then(() => { return Api.updateHaulerInfo({ vehicleInformation: vehicleInfo }) })
				}
				currentPromise
					.then(body => {
						this.props.setVehicleInfo({
							...vehicleInfo,
							pictureA: this.state.form[FormFields.CarPhoto1].value,
							pictureB: this.state.form[FormFields.CarPhoto2].value,
							pictureC: this.state.form[FormFields.CarPhoto3].value,
							pictureD: this.state.form[FormFields.CarPhoto4].value
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
		let selectCarBrandOptions = mockingOptions.carsBrands.map((item: string): Object => {
			return { label: item, value: item }
		})

		let selectCarModelOptions
		if (this.state.form[FormFields.Brand].value && mockingOptions[this.state.form[FormFields.Brand].value]) {
			selectCarModelOptions = mockingOptions[this.state.form[FormFields.Brand].value].map((item: string): Object => {
				return { label: item, value: item }
			})
		} else {
			selectCarModelOptions = [{
				label: 'none', value: 'none'
			}]
		}
		let currentYearPlus1 = (new Date()).getFullYear() + 1
		const startYear = 2000
		let count = currentYearPlus1 - startYear + 1
		let selectCarYearOptions: any[] = []
		for (let i = 0; i < count; i++) {
			let year = (startYear + i).toString(10)
			selectCarYearOptions.push({
				label: year, value: year
			})
		}
		let selectCarProfileOptions = mockingOptions.carsProfiles.map((item: any): Object => {
			return { label: item.title, value: item.value }
		})
		return (
			<div>
				<div className="tabTitle">
					<div className="vehicleImg" />
					<p className="description">{StringResources.getString(Strings.VehicleInfo.SubTitle)}</p>
				</div>

				<div className="inputsContainer">
					<div className="overviewContainerTitle">{StringResources.getString(Strings.VehicleInfo.ContainerTitle)}</div>

					<div className="imgsContainer">
						<div className={classnames('carPhoto', { error: this.state.form[FormFields.CarPhoto1].error })}>
							{StringResources.getString(Strings.VehicleInfo.Inputs.VehiclePicture1.placeholder)}
							<Uploader
								useCrop={true}
								img={this.state.form[FormFields.CarPhoto1].value}
								name={FormFields.CarPhoto1}
								crop={defaultCrop}
								createPixelCrop={this.createPixelCrop}
								onCropEnded={this.onImageLoaded(FormFields.CarPhoto1)}
								onLoadStart={this.props.enableLoader}
								onLoadEnd={this.props.disableLoader}
							/>
						</div>
						<div className="carPhoto">
							{StringResources.getString(Strings.VehicleInfo.Inputs.VehiclePicture2.placeholder)}
							<Uploader
								useCrop={true}
								img={this.state.form[FormFields.CarPhoto2].value}
								name={FormFields.CarPhoto2}
								crop={defaultCrop}
								createPixelCrop={this.createPixelCrop}
								onCropEnded={this.onImageLoaded(FormFields.CarPhoto2)}
								onLoadStart={this.props.enableLoader}
								onLoadEnd={this.props.disableLoader}
							/>
						</div>
						<div className="carPhoto">
							{StringResources.getString(Strings.VehicleInfo.Inputs.VehiclePicture3.placeholder)}
							<Uploader
								useCrop={true}
								img={this.state.form[FormFields.CarPhoto3].value}
								name={FormFields.CarPhoto3}
								crop={defaultCrop}
								createPixelCrop={this.createPixelCrop}
								onCropEnded={this.onImageLoaded(FormFields.CarPhoto3)}
								onLoadStart={this.props.enableLoader}
								onLoadEnd={this.props.disableLoader}
							/>
						</div>
						<div className="carPhoto">
							{StringResources.getString(Strings.VehicleInfo.Inputs.VehiclePicture4.placeholder)}
							<Uploader
								useCrop={true}
								img={this.state.form[FormFields.CarPhoto4].value}
								name={FormFields.CarPhoto4}
								crop={defaultCrop}
								createPixelCrop={this.createPixelCrop}
								onCropEnded={this.onImageLoaded(FormFields.CarPhoto4)}
								onLoadStart={this.props.enableLoader}
								onLoadEnd={this.props.disableLoader}
							/>
						</div>
					</div>

					<div className="separatorDiv" />
					<form onSubmit={this.onSubmit}>
						<div className="selectsContainer">
							<Select
								options={selectCarBrandOptions}
								value={this.state.form[FormFields.Brand].value}
								searchable={!DeviceUtils.isMobileDevice()}
								clearable={true}
								onChange={this.handleSelectChange(FormFields.Brand)}
								className={classnames('selectComponent', {
									error: this.state.form[FormFields.Brand].error,
									success: !this.state.form[FormFields.Brand].error && this.state.form[FormFields.Brand].touched
								})}
								placeholder={StringResources.getString(Strings.VehicleInfo.Inputs.Brand.placeholder)}
								classes={{
									selectValue: 'selectValue',
									selectArrow: 'selectArrow'
								}}
							/>
							<Select
								options={selectCarYearOptions}
								value={this.state.form[FormFields.Year].value}
								searchable={!DeviceUtils.isMobileDevice()}
								clearable={true}
								onChange={this.handleSelectChange(FormFields.Year)}
								className={classnames('selectComponent', {
									error: this.state.form[FormFields.Year].error,
									success: !this.state.form[FormFields.Year].error && this.state.form[FormFields.Year].touched
								})}
								placeholder={StringResources.getString(Strings.VehicleInfo.Inputs.Year.placeholder)}
								classes={{
									selectValue: 'selectValue',
									selectArrow: 'selectArrow'
								}}
							/>
							<Select
								options={selectCarModelOptions}
								searchable={!DeviceUtils.isMobileDevice()}
								value={this.state.form[FormFields.Model].value}
								clearable={!DeviceUtils.isMobileDevice()}
								onChange={this.handleSelectChange(FormFields.Model)}
								className={classnames('selectComponent', {
									error: this.state.form[FormFields.Model].error,
									disabled: (this.state.form[FormFields.Brand].value ? false : true) || this.state.form[FormFields.Brand].error,
									success: !this.state.form[FormFields.Model].error && this.state.form[FormFields.Model].touched
								})}
								disabled={
									(this.state.form[FormFields.Brand].value ? false : true) || this.state.form[FormFields.Brand].error
								}
								placeholder={StringResources.getString(Strings.VehicleInfo.Inputs.Model.placeholder)}
								classes={{
									selectValue: 'selectValue',
									selectArrow: 'selectArrow'
								}}
							/>
							<Select
								options={selectCarProfileOptions}
								value={this.state.form[FormFields.Profile].value}
								searchable={false}
								clearable={false}
								onChange={this.handleSelectChange(FormFields.Profile)}
								className="selectComponent"
								placeholder={StringResources.getString(Strings.VehicleInfo.Inputs.Profile.placeholder)}
								classes={{
									selectValue: 'selectValue',
									selectArrow: 'selectArrow'
								}}
							/>
						</div>
						<div className="separatorDiv h30" />
						<div className="row right justify-center-xs">
							<button className="btn normal" disabled={(!this.state.isPhotoChanged && !this.state.isFormChanged) || this.state.fieldsError} onClick={this.onSubmit} type="submit" >{StringResources.getString(Strings.VehicleInfo.Buttons.Update.title)}</button>
						</div>
					</form>
				</div>

				<div className={classnames('alertMessage', { active: this.state.serverError })}>
					{StringResources.getString(Strings.Common.Errors.InternalError)}
				</div>
				<div className={classnames('alertMessage', { active: this.state.fieldsError && StringUtils.isNotEmpty(this.state.errorText) })}>
					{StringResources.getString(Strings.Common.Errors.ErrorTemplate,this.state.errorText)}
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
				name: FormFields.Brand,
				value: this.props.vehicleInfo.brand,
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.VehicleInfo.Errors.Messages.EmptyBrand)
				}
			},
			{
				name: FormFields.Year,
				value: this.props.vehicleInfo.year,
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.VehicleInfo.Errors.Messages.EmptyYear)
				}
			},
			{
				name: FormFields.Model,
				value: this.props.vehicleInfo.model ? this.props.vehicleInfo.model : 'Other',
				validator: Validators.empty,
				messages: {
					empty: StringResources.getString(Strings.VehicleInfo.Errors.Messages.EmptyModel)
				}
			},
			{
				name: FormFields.Profile,
				value: this.props.vehicleInfo.profile ? this.props.vehicleInfo.profile : Types.Enums.CarProfileType.PICKUP_ONLY,
				validator: (value: any) => undefined
			},
			{
				name: FormFields.CarPhoto1,
				value: this.props.vehicleInfo.pictureA ? this.props.vehicleInfo.pictureA : '',
				validator: (value: any) => {
					return !value &&
						!this.formValidator.value(FormFields.CarPhoto2).value &&
						!this.formValidator.value(FormFields.CarPhoto3).value &&
						!this.formValidator.value(FormFields.CarPhoto4).value ? 'photo' : undefined
				},
				onPostValidation: (value: any) => {
					this.formValidator.validate(FormFields.CarPhoto2, true)
					this.formValidator.validate(FormFields.CarPhoto3, true)
					this.formValidator.validate(FormFields.CarPhoto4, true)
				},
				messages: {
					photo: StringResources.getString(Strings.VehicleInfo.Errors.Messages.NoPhoto)
				}
			},
			{
				name: FormFields.CarPhoto2,
				value: this.props.vehicleInfo.pictureB ? this.props.vehicleInfo.pictureB : '',
				validator: (value: any) => {
					return !value &&
						!this.formValidator.value(FormFields.CarPhoto1).value &&
						!this.formValidator.value(FormFields.CarPhoto3).value &&
						!this.formValidator.value(FormFields.CarPhoto4).value ? 'photo' : undefined
				},
				onPostValidation: (value: any) => {
					this.formValidator.validate(FormFields.CarPhoto1, true)
					this.formValidator.validate(FormFields.CarPhoto3, true)
					this.formValidator.validate(FormFields.CarPhoto4, true)
				},
				messages: {
					photo: StringResources.getString(Strings.VehicleInfo.Errors.Messages.NoPhoto)
				}
			},
			{
				name: FormFields.CarPhoto3,
				value: this.props.vehicleInfo.pictureC ? this.props.vehicleInfo.pictureC : '',
				validator: (value: any) => {
					return !value &&
						!this.formValidator.value(FormFields.CarPhoto1).value &&
						!this.formValidator.value(FormFields.CarPhoto2).value &&
						!this.formValidator.value(FormFields.CarPhoto4).value ? 'photo' : undefined
				},
				onPostValidation: (value: any) => {
					this.formValidator.validate(FormFields.CarPhoto1, true)
					this.formValidator.validate(FormFields.CarPhoto2, true)
					this.formValidator.validate(FormFields.CarPhoto4, true)
				},
				messages: {
					photo: StringResources.getString(Strings.VehicleInfo.Errors.Messages.NoPhoto)
				}
			},
			{
				name: FormFields.CarPhoto4,
				value: this.props.vehicleInfo.pictureD ? this.props.vehicleInfo.pictureD : '',
				validator: (value: any) => {
					return !value &&
						!this.formValidator.value(FormFields.CarPhoto1).value &&
						!this.formValidator.value(FormFields.CarPhoto2).value &&
						!this.formValidator.value(FormFields.CarPhoto3).value ? 'photo' : undefined
				},
				onPostValidation: (value: any) => {
					this.formValidator.validate(FormFields.CarPhoto1, true)
					this.formValidator.validate(FormFields.CarPhoto2, true)
					this.formValidator.validate(FormFields.CarPhoto3, true)
				},
				messages: {
					photo: StringResources.getString(Strings.VehicleInfo.Errors.Messages.NoPhoto)
				}
			}

		])
	}
}

function mapStateToProps(state: StoreState) {
	return {
		vehicleInfo: state.vehicleInfo,
		haulerInfo: state.personalInfo
	}
}

function mapDispatchToProps(dispatch: Dispatch<VehicleAction>) {
	return {
		setVehicleInfo: (vehicleInfo: Types.VehicleInfo) => dispatch(VehicleActions.updateVehicleInfo(vehicleInfo)),
		enableLoader: () => dispatch(Actions.startLoading()),
		disableLoader: () => dispatch(Actions.endLoading()),
		goToOverview: () => dispatch(Actions.selectTab(OverviewTab.APP_OVERVIEW_TAB))
	}
}

export const VehicleInfoContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(VehicleInfo)
