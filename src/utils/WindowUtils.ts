export function isInIFrame(): boolean {
	return window.self !== window.top
}
