import fetch from 'node-fetch'
import { PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL } from '../config'
import { UserAuthentication } from '../Database/UserAuthentication'
import { Request, Response } from 'express'
import { Validator } from 'node-input-validator'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { generateTrancationReference } from '../Helpers/Helpers'

const HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json',
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
}

const PaymentService = {
	pay: async (request: Request, response: Response) => {
		try {
			const validator = new Validator(request.body, {
				amount: 'required',
			})

			const matched = await validator.check()
			if (!matched) {
				return response.status(422).json({
					status: 'Failed',
					message: 'Validation Failed',
					data: validator.errors,
				})
			}

			const authheader: any = request.headers.authorization

			const authUser: any = jwt.decode(authheader)

			const query = {
				where: {
					ID: authUser.ID,
				},
			}

			const user = await UserAuthentication.User.findOne(query)

			const { amount, productId } = request.body

			const payload = {
				amount: amount * 100,
				email: user.email,
				reference: generateTrancationReference(),
			}

			const body = JSON.stringify(payload)
			const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/initialize`, { method: 'POST', headers: HEADERS, body })
			const responseData = await paystackResponse.json()

			if (responseData.status === true) {
				const transaction = await UserAuthentication.PaymentTransaction.create({
					productId: productId,
					amount: amount,
					paymentUrl: responseData.data.authorization_url,
					transactionReference: payload.reference,
					paymentReference: responseData.data.reference,
					status: 'pending',
				})

				return response.status(200).json({
					status: 'Successful',
					message: 'Transaction Initialize',
					data: transaction,
				})

			}

			return response.status(400).json({
				status: 'Failed',
				message: 'Unable to initialize transaction',
				data: null,
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},

	verifyPayment: async (reference: string) => {
        const query = {
            where: {
                transactionReference: reference,
            },
        }

		const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/verify/${reference}`, { method: 'GET', headers: HEADERS })
		const responseData = await paystackResponse.json()

        let updatedData: any = {
            status: responseData.data.status,
            paymentReference: responseData.data.reference,
        }
        
        if(responseData.data.status == 'success'){
            //update transaction to success
            updatedData = {
                status: 'success',
                paymentReference: responseData.data.reference
            }
        }

        await UserAuthentication.PaymentTransaction.update(updatedData, query)
	},

    webhook: async (request: Request, response: Response) => {
        try {

            const { transactionReference, status } = request.body;

            const query = {
                where: {
                    transactionReference: transactionReference,
                },
            }

            const transaction = await UserAuthentication.PaymentTransaction.findOne(query)

            if (!transaction) {
                return response.status(404).json({
                    status: 'Failed',
                    message: 'transaction not found',
                    data: null,
                })
            }

            if(status == 'success'){
                const updatedData = {
                    status: 'paid',
                    paymentReference: transactionReference
                }

                await UserAuthentication.PaymentTransaction.update(updatedData, query)
            }
        
            return response.status(200).json({
                status: 'Success',
                message: 'Webhook received and processed successfully',
            })

        } catch (error) {
        console.error("Error processing webhook:", error);
        return response.status(500).json({
            status: 'Failed',
            message: 'Failed to process webhook',
            data: null,
        })
        }
    }
}

export = PaymentService
