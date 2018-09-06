export class SsnUtils {
    static cleanNumber(rawNumber?: string): string {
        if (!rawNumber) {
            return ''
        }
        let n = ''
        let { length } = rawNumber
        for (let i = 0; i < length; i++) {
            if (!isNaN(Number(rawNumber[i])) && rawNumber[i] !== ' ') {
                n += rawNumber[i]
            }
        }
        return n
    }
}
