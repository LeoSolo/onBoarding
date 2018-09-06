export interface PaymentInfo {
    paymentToken: string,
    userAcceptedAgreement: boolean,
	ssnToken?: string,
	ein?: string,
	ssnLast4?: string
}
