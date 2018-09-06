export const BankingInfo = {
	SubTitle: 'Please enter  your banking information so that you can get paid. You can either provide a bank debit card or your banking account details. Go Trashy does not save this information.',
	BankAccountTitle: 'Bank Account Information',
	DebitCardTitle: 'Debit Card Information',
	Inputs: {
		RoutingNumber: {
			placeholder: 'Routing Number'
		},
		AccountNumber: {
			placeholder: 'Account Number'
		},
		DebitCardNumber: {
			placeholder: 'Debit Card Number'
		},
		Expiration: {
			placeholder: 'Expiration: MM/YY'
		},
		CVV: {
			placeholder: 'CVV'
		},
		SSN: {
			placeholder: 'Social Security Number'
		},
		EIN: {
			placeholder: 'Employer Identification Number'
		},
		SSN4: {
			placeholder: 'Social Security Number (last 4 digits)'
		},
		StripeAgreement: {
			BeforeLink: 'Stripe ',
			Link: 'Agreement',
			AfterLink: ' Confirm'
		}
	},
	Buttons: {
		Update: {
			title: 'Update'
		}
	},
	Errors: {
		Messages: {
			InvalidRoutingNumber: 'Please enter a valid Routing Number.',
			InvalidAccountNumber: 'Please enter a valid Account Number.',
			InvalidSSN: 'Please enter a valid Social Security Number in the format: 000-00-0000',
			InvalidSSN4: 'Please enter valid last 4 digits of Social Security Number in the format: 0000',
			InvalidEIN: 'Please enter a valid EID in the format: 00-0000000',
			InvalidCardNumber: 'Pleaes enter a valid Credit Card Number.',
			InvalidExpireDate: 'Please enter a valid Credit Card Expiration Date in the format: MM/YY',
			InvalidCVV: 'Please enter a valid CCV number.',
			NoAgreement: 'Please check the agreement box.',
			NoBankData: 'Please fill-in Bank Account or Debit Card information.',
			TabStatusesInvalid: 'Please wait for personal information background check result first'
		}
	}
}
