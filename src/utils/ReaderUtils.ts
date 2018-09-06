
export enum ReadType {
	BLOB = 'blob',
	DATA_URL = 'dataUrl'
}
export async function read(file, readType: ReadType) {
	return new Promise<any>((resolve, reject) => {
		let reader = new FileReader()
		reader.onloadend = () => {
			resolve(reader.result)
		}
		reader.onerror = (err) => {
			reject(err)
		}
		switch (readType) {
			case ReadType.BLOB: {
				reader.readAsArrayBuffer(file)
				break
			}
			case ReadType.DATA_URL:
			default: {
				reader.readAsDataURL(file)
				break
			}
		}
	})
}

export async function loadImage(img: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		let image = new Image()
		image.onload = () => {
			resolve(image)
		}
		image.onerror = reject
		image.src = img
	})
}
