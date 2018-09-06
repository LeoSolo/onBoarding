import * as StringUtils from '../utils/StringUtils'

export class StringResources {
	static getString(text: string, ...args): string {
		return StringUtils.format(text, args)
	}
}
