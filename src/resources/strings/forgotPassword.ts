export const ForgotPassword = {
	Title: 'Forgot password',
	SubTitle: {
		EmailWaiting: 'Enter your email address and you will be sent a verification code',
		VerificationCodeWaiting: 'An email has been sent to you. Please enter your verification code and your new password.'
	},
	Inputs: {
		Email: {
			placeholder: 'Enter your email'
		},
		VerificationCode: {
			placeholder: 'Verification code'
		},
		Password: {
			placeholder: 'Password'
		},
		ConfirmPassword: {
			placeholder: 'Confirm Password'
		}
	},
	Buttons: {
		Submit: {
			title: 'Submit'
		},
		ChangePassword: {
			title: 'Change password'
		}
	},
	PasswordRequirement: {
		title: 'Password Requirement'
	},
	Errors: {
		Messages: {
			WrongEmail: 'Email is incorrect',
			VerificationCodeIncorrect: 'Verification code cannot be empty'
		}
	}
}
