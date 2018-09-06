import { ErrorCode } from './errorCode'
import { Strings } from '../strings'
import * as StringUtils from '../../utils/StringUtils'

export class ErrorResources {
	static getErrorText(errorCode: ErrorCode, ...args): string {
		return StringUtils.format(this.errorCodeToErrorMessage(errorCode), args)
	}
	private static errorCodeToErrorMessage(errorCode: ErrorCode): string {
		switch (errorCode) {
			case ErrorCode.CARD_INVALID_CARD_TYPE: {
				return Strings.Common.Errors.PaymentService.DebitCardIsExpected
			}
			default: {
				return Strings.Common.Errors.InternalError
			}
		}
	}
}
