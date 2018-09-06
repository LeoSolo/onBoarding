import * as StringUtils from '../StringUtils'

export class Masker {

    public static numberMask = '(xxx) xxx-xxxx'
	public static ssnMask = 'xxx-xx-xxxx'
	public static ssn4Mask = 'xxxx'
    public static einMask = 'xx-xxxxxxx'
    public static expireDateMask = 'xx/xx'
    public static placeSymbol = 'x'

    constructor(private maskValue: string, private place: string) {
        if (StringUtils.isEmpty(maskValue) || StringUtils.isEmpty(place) || place.length !== 1) {
            throw new Error('Invalid values for mask')
        }
    }

    public mask(value?: string): string {
        if (StringUtils.isEmpty(value) || !value) {
            return ''
        } else {
            let valueAsArray = value.split('')
            let maskedValue = this.maskValue
            let curIndex = maskedValue.indexOf(this.place)
            let lastIndex = 0
            while (curIndex > -1) {
                if (valueAsArray.length === 0) {
                    maskedValue = maskedValue.substring(0, lastIndex)
                    break
                }
                let replaceChar = valueAsArray.shift()
                maskedValue = `${maskedValue.substring(0, curIndex)}${replaceChar}${maskedValue.substr(curIndex + this.place.length)}`
                lastIndex = curIndex + 1
                curIndex = maskedValue.indexOf(this.place)
            }
            return maskedValue
        }
    }

    public unmask(masked?: string): string {
        if (!masked || StringUtils.isEmpty(masked)) {
            return ''
        } else {
            let value: string = ''
            let maskedAsArray = masked.split('')
            let maskAsArray = this.maskValue.split('')
            while (maskAsArray.length > 0 && maskedAsArray.length > 0) {
                let maskChar = maskAsArray[0]
                let valueChar = maskedAsArray[0]
                if (maskChar !== this.place && valueChar !== maskChar) {
                    maskAsArray.shift()
                } else if (maskChar !== this.place) {
                    maskAsArray.shift()
                    maskedAsArray.shift()
                } else {
                    value = value + valueChar
                    maskAsArray.shift()
                    maskedAsArray.shift()
                }
            }
            return value
        }
    }
}
