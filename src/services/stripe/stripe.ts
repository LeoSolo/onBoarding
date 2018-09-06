import { STRIPE_TEST_PUBLISH_KEY } from '../../config/stripe'

export interface CardInfo {
    cardNumber: string
    expireMonth: number
    expireYear: number
    cvc: number
    name: string
    country: string
    currency: string
}

export enum BankAccountType {
    INDIVIDUAL = 'individual',
    COMPANY = 'company'
}

export interface BankAccountInfo {
    country: string
    currency: string
    routingNumber: string
    accountNumber: string
    accountHolderName: string
    accountHolderType: BankAccountType
}

export class Stripe {

    private constructor(private stripe: any) {}

    public createToken(cardInfo: CardInfo): Promise<string> {
        return new Promise((resolve, reject) => {
            this.stripe.card.createToken({
                address_country: cardInfo.country,
                currency: cardInfo.currency,
                number: cardInfo.cardNumber,
                cvc: cardInfo.cvc,
                exp_month: cardInfo.expireMonth,
                exp_year: cardInfo.expireYear,
                name: cardInfo.name
            }, (status, response) => {
                if (response.error) {
                    console.log('Stripe error', response.error.message)
                    reject(response.error)
                } else {
                    console.log('Stripe response', response)
                    resolve(response.id)
                }
            })
        })
    }

    public createTokenWithBankInfo(bankInfo: BankAccountInfo): Promise<string> {
        return new Promise((resolve, reject) => {
            this.stripe.bankAccount.createToken({
                country: bankInfo.country,
                currency: bankInfo.currency,
                routing_number: bankInfo.routingNumber,
                account_number: bankInfo.accountNumber,
                account_holder_name: bankInfo.accountHolderName,
                account_holder_type: bankInfo.accountHolderType
            }, (status, response) => {
                if (response.error) {
                    console.log('Stripe error', response.error.message)
                    reject(response.error)
                } else {
                    console.log('Stripe response', response)
                    resolve(response.id)
                }
            })
        })
    }

    public createTokenWithPII(pii: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.stripe.piiData.createToken({
                personal_id_number: pii
            }, (status, response) => {
                if (response.error) {
                    console.log('Stripe error', response.error.message)
                    reject(response.error)
                } else {
                    console.log('Stripe response', response)
                    resolve(response.id)
                }
            })
        })
    }

    public validateCardNumber(cardNumber: string): boolean {
        let result = this.stripe.card.validateCardNumber(cardNumber)
        return result
    }

    public validateExpireDate(expMonth: number, expYear: number): boolean {
        return this.stripe.card.validateExpiry(expMonth, expYear)
    }
    public validateExpireDateStr(expire: string): boolean {
        return this.stripe.card.validateExpiry(expire)
    }

    public validateCvc(cvc: string): boolean {
        return this.stripe.card.validateCVC(cvc)
    }

    public validateRoutingNumber(routingNumber: string, country: string) {
        return this.stripe.bankAccount.validateRoutingNumber(routingNumber, country)
    }

    public validateAccountNumber(accountNumber: string, country: string) {
        return this.stripe.bankAccount.validateAccountNumber(accountNumber, country)
    }

    static getStripe(): Promise<Stripe> {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                window.Stripe.setPublishableKey(STRIPE_TEST_PUBLISH_KEY)
                resolve(new Stripe(window.Stripe))
            } else {
                let script = document.querySelector('#stripe-js')
                if (script) {
                    script.addEventListener('load', () => {
                        window.Stripe.setPublishableKey(STRIPE_TEST_PUBLISH_KEY)
                        resolve(new Stripe(window.Stripe))
                    })
                } else {
                    reject('There is no stripe js')
                }
            }
        })
    }

}
