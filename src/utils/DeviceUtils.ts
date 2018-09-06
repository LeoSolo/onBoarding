export function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini|Mobi/i.test(navigator.userAgent)
}
