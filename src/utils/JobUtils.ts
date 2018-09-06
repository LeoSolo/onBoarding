export interface JobCancellationToken {
	cancel: () => void
}

class JobCancellationTokenImpl implements JobCancellationTokenImpl {

	public outerTimeoutCancelToken: any
	public innerTimeoutCancelToken: any
	public shouldContinue: boolean

	constructor() {
		this.outerTimeoutCancelToken = undefined
		this.innerTimeoutCancelToken = undefined
		this.shouldContinue = false
	}

	public cancel = () => {
		this.shouldContinue = false
		if (this.innerTimeoutCancelToken) {
			clearTimeout(this.innerTimeoutCancelToken)
			this.innerTimeoutCancelToken = undefined
		}
		if (this.outerTimeoutCancelToken) {
			clearTimeout(this.outerTimeoutCancelToken)
			this.outerTimeoutCancelToken = undefined
		}
	}
}

export class JobUtils {

	static repeatJob(job: () => Promise<any>, timeout: number, interval: number, continueOnError: boolean = false): JobCancellationToken {
		let cancelToken = new JobCancellationTokenImpl()
		cancelToken.shouldContinue = true
		let jobRunner = () => {
			if (cancelToken.shouldContinue) {
				job()
				.then(() => {
					cancelToken.innerTimeoutCancelToken = setTimeout(jobRunner, timeout)
				})
				.catch(() => {
					if (continueOnError) {
						cancelToken.innerTimeoutCancelToken = setTimeout(jobRunner, timeout)
					}
				})
			}
		}
		cancelToken.outerTimeoutCancelToken = setTimeout(() => {
			cancelToken.outerTimeoutCancelToken = undefined
			cancelToken.cancel()
		}, interval)
		jobRunner()
		return cancelToken
	}
}
