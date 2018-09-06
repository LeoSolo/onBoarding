export const DriversLicense = {
	SubTitle: 'Please upload a photo of the front and back of your drivers license. This information is used for age and payment verification.',
	ContainerTitle: 'Drivers License Information',
	Inputs: {
		FrontImage: {
			placeholder: 'Drivers License Front View'
		},
		BackImage: {
			placeholder: 'Drivers License Rear View'
		},
		DriversLicenseNumber: {
			placeholder: 'Drivers License Number'
		},
		State: {
			placeholder: 'State'
		},
		ExpirationDate: {
			placeholder: 'Expires'
		}
	},
	Buttons: {
		Update: {
			title: 'Update'
		}
	},
	Errors: {
		Messages: {
			InvalidLicenseNumber: 'Drivers license number is invalid.',
			ExpireDate: {
				Empty: 'Please enter the Expiration Date.',
				Invalid: 'Please enter a future Expiration Date'
			},
			EmptyState: 'Please select a State.',
			Photo: {
				Front: {
					empty: 'Please upload a photo of the front of your Drivers Licence.'
				},
				Rear: {
					empty: 'Please upload a photo of the back of your Drivers Licence.'
				}
			}
		}
	}
}
