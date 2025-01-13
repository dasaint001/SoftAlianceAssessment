import { UserAuthentication } from '../Database/UserAuthentication'
import { Request, Response } from 'express'
import { isValidEmail, tokenCode } from '../Helpers/Helpers'
import { Validator } from 'node-input-validator'
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { Op } from 'sequelize'


const AuthService = {
	createUser: async (request: Request, response: Response) => {
		try {
			const validator = new Validator(request.body, {
				email: 'required|email',
				password: 'required',
			})

			const properEmail = isValidEmail(request.body.email)

			if(!properEmail){
				return response.status(400).json({
					status: 'Failed',
					message: 'invalid email address',
				})
			}

			const salt = 10
			const hashedPassword = await bcrypt.hash(request.body.password, salt)

			const matched = await validator.check()
			if (!matched) {
				return response.status(422).json({
					status: 'Failed',
					message: 'Validation Failed',
					data: validator.errors,
				})
			}

			const isEmailExist = await UserAuthentication.User.findOne({
				where: {
					email: request.body.email,
				},
			})

			if (isEmailExist) {
				return response.status(400).json({
					status: 'Failed',
					message: 'User with email already exist',
				})
			}

			const isFirstNameExist = await UserAuthentication.User.findOne({
				where: {
					firstName: request.body.firstName,
				},
			})

			if (isFirstNameExist) {
				return response.status(400).json({
					status: 'Failed',
					message: 'First name already exist',
				})
			}

			const isLastNameExist = await UserAuthentication.User.findOne({
				where: {
					lastName: request.body.lastName,
				},
			})

			if (isLastNameExist) {
				return response.status(400).json({
					status: 'Failed',
					message: 'Last name already exist',
				})
			}

			const user = await UserAuthentication.User.create({
				firstName: request.body.firstName,
				lastName: request.body.lastName,
				email: request.body.email,
				password: hashedPassword,
				role: 'user',
			})

			return response.status(201).json({
				status: 'Successful',
				message: 'User created Successfully',
				data: { user },
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
				data: null,
			})
		}
	},

	login: async (request: Request, response: Response) => {
		try {
			const validator = new Validator(request.body, {
				email: 'required',
				password: 'required',
			})

			const properEmail = isValidEmail(request.body.email)

			if (!properEmail) {
				return response.status(400).json({
					status: 'Failed',
					message: 'invalid email address',
				})
			}

			const matched = await validator.check()

			if (!matched) {
				return response.status(422).json({
					status: 'Failed',
					message: 'Validation Failed',
					data: validator.errors,
				})
			}

			const salt = 10

			const user = request.body

			const { email, password } = user

			const isUserExist = await UserAuthentication.User.findOne({ where: { email: email } })

			if (!isUserExist) {
				return response.status(404).json({
					status: 'Failed',
					message: 'User email does not exist',
				})
			}

			const isPasswordMatched = await bcrypt.compare(password, isUserExist.password)

			if (!isPasswordMatched) {
				return response.status(400).json({
					status: 'Failed',
					message: 'Wrong password',
				})
			}

			const token = jwt.sign({ ID: isUserExist?.ID, email: isUserExist?.email }, 'YOUR_SECRET', {
				expiresIn: '1d',
			})

			return response.status(200).json({
				status: 'Successful',
				message: 'Login successfully',
				data: token,
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},

	forgotPassword: async (request: Request, response: Response) => {
		const { email } = request.body;
		const properEmail = isValidEmail(email)

		if (!properEmail) {
			return response.status(400).json({
				status: 'Failed',
				message: 'invalid email address',
			})
		}

		try {
			const user = await UserAuthentication.User.findOne({ where: { email } });

			if (!user) {
				return response.status(404).json({
					status: 'failed',
					message: 'User not found',
				})
			}

			const resetToken = uuidv4();

			// Update user record with resetToken and expiration date
			await UserAuthentication.User.update({ resetToken, resetTokenExpiresAt: new Date(Date.now() + 3600000) }, { where: { id: user.id } }); 

			// Send reset password email with a link containing the reset token

			return response.status(200).json({
				status: 'Successful',
				message: 'Password reset email sent',
			})
		} catch (error: any) {
			console.error(error);
			return response.status(500).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},

	recoverPassword: async (request: Request, response: Response) => {
		const { token, newPassword } = request.body;

		try {
			// Find the user by reset token
			const user = await UserAuthentication.User.findOne({ where: { token, resetTokenExpiresAt: { [Op.gt]: new Date() } } }); 

			if (!user) {
			return response.status(400).json({ error: 'Invalid or expired token' });
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			await UserAuthentication.User.update({ hashedPassword, resetToken: null, resetTokenExpiresAt: null }, { where: { id: user.id } });

			return response.status(200).json({
				status: 'Successful',
				message: 'Password reset successfully',
			})
		} catch (error) {
			console.error(error);
			return response.status(500).json({
				status: 'Failed',
				message: 'Failed to reset password',
			})
		}
	},

	resendAuthCode: async (request: Request, response: Response) => {
		const { email } = request.body;
		const properEmail = isValidEmail(email)

		if (!properEmail) {
			return response.status(400).json({
				status: 'Failed',
				message: 'invalid email address',
			})
		}

		try {
			const user = await UserAuthentication.User.findOne({ where: { email } });

			if (!user) {
				return response.status(404).json({
					status: 'failed',
					message: 'User not found',
				})
			}

			// Generate a new auth code
			const authCode = tokenCode;

			// Send auth code to user (email/SMS logic here)

			await UserAuthentication.User.update({ authCode, authCodeExpiresAt: new Date(Date.now() + 3600000) }, { where: { id: user.id } }); 

			return response.status(200).json({
				status: 'Successful',
				message: 'Auth code resent successfully',
			})
		} catch (error: any) {
			console.error(error);
			return response.status(500).json({
				status: 'Failed',
				message: 'Failed to resend auth code',
			})
		}
 	}
}

export = AuthService

