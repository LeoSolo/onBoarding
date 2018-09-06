import * as React from 'react'
import * as classnames from 'classnames'
import { Modal } from 'react-overlays'
import ReactCrop, { makeAspectCrop } from 'react-image-crop'
import { LoadingSpinner } from './LoadingSpinner'
import { ImageUtils } from '../utils'
import * as ReaderUtils from '../utils/ReaderUtils'
import '../styles/components/Uploader.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'
import * as exif from 'exif-js'

interface UploaderProps {
	onChangeImg?: Function,
	img: string,
	name: string,
	useCrop: boolean
	crop?: any
	onCropEnded?: (imgBlob: any, imgAsDataUrl: string) => void
	createPixelCrop?: (image: any) => any
	onLoadStart?: () => void
	onLoadEnd?: () => void
}

interface UploaderStates {
	imagesPreviewUrl: string,
	file: string,
	crop?: any
	pixelCrop: any,
	showImageEditor: boolean,
	isLoading: boolean,
	img: string,
	prevImg?: string
}

export class Uploader extends React.Component<UploaderProps, UploaderStates> {
	private unmounted: boolean = true
	private fileInput: any
	constructor(props: any) {
		super(props)
		let defaultCrop = this.props.crop ? this.props.crop : {
			x: 0,
			y: 0,
			aspect: 1,
			height: 100
		}
		this.state = {
			file: '',
			imagesPreviewUrl: '',
			pixelCrop: {
				x: 0,
				y: 0,
				height: 100,
				width: 100
			},
			crop: defaultCrop,
			showImageEditor: false,
			isLoading: false,
			img: ''
		}
	}
	componentDidMount() {
		this.unmounted = false
		this.setState({
			imagesPreviewUrl: this.props.img
		})
		this.uploadImage(this.props)
	}
	_handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
	}
	onClick = () => {
		this.fileInput.value = ''
	}
	_handleImageChange = async (e: any) => {
		e.preventDefault()
		e.persist()
		if (this.props.onLoadStart) {
			this.props.onLoadStart()
		}
		let file = e.target.files[0]
		try {
			let fileAsDataUrl = await this.unrotateImage(file)
			if (!this.unmounted) {
				this.setState({
					file: file,
					imagesPreviewUrl: fileAsDataUrl,
					showImageEditor: true
				}, () => {
					if (this.props.onChangeImg && !this.props.useCrop) {
						this.props.onChangeImg(this.state.imagesPreviewUrl, e)
					}
				})
			}
		} finally {
			if (this.props.onLoadEnd) {
				this.props.onLoadEnd()
			}
		}
	}

	unrotateImage = async (imgAsBlob: Blob) => {
		let imgAsByteArray = await ReaderUtils.read(imgAsBlob, ReaderUtils.ReadType.BLOB)
		let tags = exif.readFromBinaryFile(imgAsByteArray)
		if (!tags || tags.Orientation === null || tags.Orientation === undefined) {
			return ReaderUtils.read(imgAsBlob, ReaderUtils.ReadType.DATA_URL)
		}
		const orientation = tags.Orientation

		let imgAsBase64 = await ReaderUtils.read(imgAsBlob, ReaderUtils.ReadType.DATA_URL)
		let image = await ReaderUtils.loadImage(imgAsBase64)
		let width = image.width
		let height = image.height
		let canvas = document.createElement('canvas')
		let ctx = canvas.getContext('2d')

		if (ctx) {
			if (orientation > 4 && orientation < 9) {
				canvas.width = height
				canvas.height = width
			} else {
				canvas.width = width
				canvas.height = height
			}

			switch (orientation) {
				case 2: {
					ctx.transform(-1, 0, 0, 1, width, 0)
					break
				}
				case 3: {
					ctx.transform(-1, 0, 0, -1, width, height)
					break
				}
				case 4: {
					ctx.transform(1, 0, 0, -1, 0 , height)
					break
				}
				case 5: {
					ctx.transform(0, 1, 1, 0, 0, 0)
					break
				}
				case 6: {
					ctx.transform(0, 1, -1, 0, height, 0)
					break
				}
				case 7: {
					ctx.transform(0, -1, -1, 0, height, width)
					break
				}
				case 8: {
					ctx.transform(0, -1, 1, 0, 0, width)
					break
				}
				default: break
			}

			ctx.drawImage(image, 0, 0)
			return canvas.toDataURL()

		} else {
			return ReaderUtils.read(imgAsBlob, ReaderUtils.ReadType.DATA_URL)
		}

	}

	onSaveCroppedResult = async () => {
		if (this.props.onCropEnded) {
			try {
				let imgBlob = await this.getCroppedImg(this.state.imagesPreviewUrl)
				let reducedImageURL = await this.reduceImageSize(imgBlob)
				if (!this.unmounted) {
					this.setState({
						showImageEditor: false
					})
					if (this.props.onCropEnded) {
						this.props.onCropEnded(imgBlob, reducedImageURL)
					}
				}
			} catch (error) {
				console.log(error)
			}
		}
	}

	closeImageEditor = () => {
		if (!this.unmounted) {
			this.setState({
				showImageEditor: false
			})
		}
	}

	onReactCropChange = (crop) => {
		if (!this.unmounted) {
			this.setState({
				crop: crop
			})
		}
	}

	onCompleteReactCrop = (_, pixelCrop) => {
		if (!this.unmounted) {
			this.setState({
				pixelCrop: pixelCrop
			})
		}
	}

	onImageLoaded = (image) => {
		return new Promise((resolve) => {
			let crop = {
				...this.state.crop,
				height: this.state.crop.height >= image.height ? image.height : this.state.crop.height,
				width: this.state.crop.width >= image.width ? image.width : this.state.crop.width
			}
			if (!this.unmounted) {
				this.setState({
					crop: makeAspectCrop({
						...crop
					}, image.width / image.height),
					pixelCrop: this.props.createPixelCrop ?
						this.props.createPixelCrop(image) :
						ImageUtils.generatePixelCrop(image, 1, 1)
				}, () => resolve())
			}
		})
	}

	reduceImageSize = async (blob) => {
		let image = await ReaderUtils.loadImage(window.URL.createObjectURL(blob))
		let width = image.width
		let height = image.height
		let aspect = width / height

		let newWidth = 250
		let newHeight = newWidth / aspect

		let canvas = document.createElement('canvas')
		canvas.width = newWidth
		canvas.height = newHeight

		let context = canvas.getContext('2d')
		if (context) {
			context.drawImage(image, 0, 0, newWidth, newHeight)
			let blob = await ImageUtils.getBlob(canvas, 'image/jpeg', 0.7)
			return ReaderUtils.read(blob, ReaderUtils.ReadType.DATA_URL)
		}
	}

	getCroppedImg = async (imageUrl: string) => {
		let pixelCrop = this.state.pixelCrop
		let image = await ReaderUtils.loadImage(imageUrl)
		const canvas = document.createElement('canvas')
		canvas.width = this.state.pixelCrop.width
		canvas.height = this.state.pixelCrop.height

		const ctx = canvas.getContext('2d')
		if (ctx === null) return null

		ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
			0, 0, pixelCrop.width, pixelCrop.height)
		let base64Image = canvas.toDataURL('image/jpeg')
		base64Image = base64Image.length < 10 ? this.props.img : base64Image
		let imgAsBlob = await ImageUtils.getBlob(canvas)
		if (imgAsBlob != null) {
			imgAsBlob.name = 'avatar'
		}
		return imgAsBlob
	}

	componentWillReceiveProps(nextProps, nextContext) {
		this.uploadImage(nextProps)
	}

	componentWillUnmount() {
		if (this.cancelationToken) {
			clearTimeout(this.cancelationToken)
			this.cancelationToken = undefined
		}
		this.unmounted = true
	}

	cancelationToken: any = undefined

	uploadImage = (props: UploaderProps) => {
		if (props.img && props.img !== this.state.prevImg && !this.unmounted) {
			this.setState({
				isLoading: true,
				prevImg: props.img
			}, async () => {
				let image = await ReaderUtils.loadImage(props.img)
				// When image is cached by browser
				// this actions are performed very quickly
				// on page it looks like blinking
				// setTimeout helps us to make image uploading slower
				if (this.cancelationToken) {
					clearTimeout(this.cancelationToken)
				}
				this.cancelationToken = setTimeout(() => {
					if (!this.unmounted) {
						this.setState({
							isLoading: false,
							img: image.src
						})
					}
					this.cancelationToken = undefined
				}, 300)
			})
		}
	}

	render() {
		let imageUploadContainerStyle: any = {
			backgroundImage: 'url(' + this.state.img + ')',
			backgroundPosition: 'center center',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover'
		}
		return (
			<div className="imageUploadContainer" style={imageUploadContainerStyle} onClick={this.onClick}>
				<LoadingSpinner show={this.state.isLoading} showText={false} classes="shadowForImg" />
				<div className="imageUploadBtn">
					<form onSubmit={this._handleSubmit}>
						<input
							ref={elem => this.fileInput = elem}
							className="fileInput"
							type="file"
							onChange={this._handleImageChange}
							name={this.props.name}
						/>
					</form>
				</div>
				{
					this.props.useCrop &&
					(
						<Modal show={this.state.showImageEditor}>
							<div className={classnames('imageEditorShadow', { active: this.state.showImageEditor })}>
								<h2>{StringResources.getString(Strings.Components.Uploader.Crop.Title)}</h2>
								<div className="closeImageEditorBtn" onClick={this.closeImageEditor} />
								<ReactCrop
									crop={this.state.crop}
									src={this.state.imagesPreviewUrl ? this.state.imagesPreviewUrl : (this.props.img ? this.props.img : '')}
									onChange={this.onReactCropChange}
									onComplete={this.onCompleteReactCrop}
									onImageLoaded={this.onImageLoaded}
								/>
								<div onClick={this.onSaveCroppedResult} className="saveCropedImgBtn">{StringResources.getString(Strings.Components.Uploader.Crop.CropBtn.title)}</div>
							</div>
						</Modal>
					)
				}
			</div>
		)
	}
}
