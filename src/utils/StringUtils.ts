export function isEmpty(value: string | undefined | null): boolean {
	return !isNotEmpty(value)
}

export function isNotEmpty(value: string | undefined | null) {
	return value ? (value.trim() ? true : false) : false
}

export function format(format: string, ...properties) {
	let args = Array.prototype.slice.call(arguments, 1)
	return format.replace(/{(\d+)}/g, function (match, n: number) {
		return typeof args[n] !== 'undefined'
			? args[n]
			: match
	})
}
