export function generatePixelCrop(image: any, widthRate: number = 1, heightRate: number = 1) {
	if (widthRate < 1 || heightRate < 1) {
		return undefined
	}
	let pixelCrop: any = {
		x: 0,
		y: 0
	}
	let hp = image.naturalHeight / heightRate
	let wp = image.naturalWidth / widthRate
	if (hp >= wp) {
		if (hp * widthRate <= image.naturalWidth) {
			pixelCrop = {
				...pixelCrop,
				height: hp * heightRate,
				width: hp * widthRate
			}
		} else if (wp * heightRate <= image.naturalHeight) {
			pixelCrop = {
				...pixelCrop,
				height: wp * heightRate,
				width: wp * widthRate
			}
		}
	} else {
		if (wp * heightRate <= image.naturalHeight) {
			pixelCrop = {
				...pixelCrop,
				height: wp * heightRate,
				width: wp * widthRate
			}
		} else if (hp * widthRate <= image.naturalWidth) {
			pixelCrop = {
				...pixelCrop,
				height: hp * heightRate,
				width: hp * widthRate
			}
		}
	}
	return pixelCrop
}

export async function getBlob(canvas: HTMLCanvasElement, type: string = 'image/jpeg', quality: number = 1) {
	return new Promise<Blob | null>(resolve => {
		canvas.toBlob(blob => {
			resolve(blob)
		}, type, quality)
	})
}
