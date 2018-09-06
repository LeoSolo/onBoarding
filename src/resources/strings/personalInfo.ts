export const PersonalInfo = {
	SubTitle: 'Please upload a photo and complete your profile information. Be sure to smile, our Clients appreciate a happy Provider!',
	Inputs: {
		ProfilePicture: {
			placeholder: 'Choose profile picture'
		},
		CompanyName: {
			placeholder: 'Company Name'
		},
		FirstName: {
			placeholder: 'First Name'
		},
		LastName: {
			placeholder: 'Last Name'
		},
		Email: {
			placeholder: 'E-mail Address'
		},
		Phone: {
			placeholder: 'Telephone number'
		},
		Street: {
			placeholder: 'Street'
		},
		City: {
			placeholder: 'City'
		},
		State: {
			placeholder: 'State'
		},
		ZipCode: {
			placeholder: 'Zip Code'
		},
		DateOfBirth: {
			placeholder: 'Date of Birth'
		}
	},
	Buttons: {
		Submit: {
			title: 'Update'
		}
	},
	BlockTitle: {
		ContactInformation: 'Contact Information'
	},
	Messages: {
		EmailUpdateSuccessful: 'We sent you an email. Please verify your email account before proceeding.'
	},
	Errors: {
		Messages: {
			CompanyRequired: 'Corporate providers must provide a company name.',
			WrongName: 'Name is not valid.',
			WrongLastName: 'Last name is not valid.',
			WrongEmail: 'Email is not valid.',
			WrongPhone: 'Telephone is not valid.',
			InvalidZip: 'ZIP code is not valid.',
			Street: {
				Empty: 'Street address cannot be empty.',
				Short: 'Street name is too short.'
			},
			InvalidCity: 'City name cannot be empty.',
			InvalidState: 'Please select a State.',
			Age: {
				Empty: 'Please enter your Date of Birth.',
				Less: 'Provider must be 21 years of age or older.'
			},
			EmptyProviderType: 'Please select Provider Type. ',
			EmptyProfilePicutre: 'Please upload a Profile Photo. '
		}
	}
}
