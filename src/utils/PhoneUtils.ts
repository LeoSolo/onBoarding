export class PhoneUtils {
    static cleanPhoneNumber(rawPhone?: string, addCode: boolean = true): string {
        if (!rawPhone) {
            return ''
        }
        let mobilePhone = ''
        let { length } = rawPhone
        for (let i = 0; i < length; i++) {
            if (!isNaN(Number(rawPhone[i])) && rawPhone[i] !== ' ') {
                mobilePhone += rawPhone[i]
            }
        }
        if (addCode) {
            return (mobilePhone.length === 10 ? ('+1') : ('+')) + mobilePhone
        } else {
            return (mobilePhone.length === 10 ? mobilePhone : (mobilePhone.length === 11 ? mobilePhone.substring(1) : mobilePhone))
        }
    }
}
