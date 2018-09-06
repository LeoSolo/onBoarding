export class ObjectUtils {
	static isEquals<T>(first: T, second: T) {
		let isEquals = true
		for (let key in first) {
			isEquals = isEquals && first[key] === second[key]
		}
		return isEquals
	}
}
