export const GetStarted = {
	Title: 'Get Started',
	SubTitle: '',
	CheckBoxGroupTitle: 'Please check all that apply:',
	SpinnerText: 'Sending...',
	Inputs: {
		Email: {
			placeholder: 'E-mail address'
		},
		Phone: {
			placeholder: 'Telephone number'
		},
		FirstName: {
			placeholder: 'First Name'
		},
		LastName: {
			placeholder: 'Last Name'
		},
		ZipCode: {
			placeholder: 'Zip Code'
		},
		OwnTruck: {
			label: 'I have my own truck'
		},
		Age: {
			label: 'I am 21 years of age'
		},
		WillingToCheck: {
			label: 'I agree to a background check as part of this application'
		},
		HowDidYouHear: {
			placeholder: 'How did you hear about Go Trashy?'
		}
	},
	Buttons: {
		Send: {
			Title: 'send'
		}
	},
	Errors: {
		Messages: {
			InvalidName: 'Please enter your name',
			InvalidLastName: 'Please enter your last name',
			InvalidEmail: 'Please enter a valid e-mail',
			InvalidPhone: 'Please enter a valid telephone number',
			InvalidZip: 'Please enter a valid zip code',
			NoTruck: 'Please confirm you have your own truck',
			NoAge: 'Please confirm you are 21 years of age',
			NoWilling: 'Please confirm you are willing to submit to a background check',
			NoCaptcha: 'Please check the captcha',
			HaulerExists: {
				BeforeLink: 'It looks like you already have an account. ',
				Link: 'Can we help you find your login info?',
				AfterLink: ''
			}
		}
	}
}
