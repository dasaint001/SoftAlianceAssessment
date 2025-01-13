import { UserAuthentication } from '../Database/UserAuthentication'
import { Request, Response } from 'express'
import moment from 'moment'
import { Validator } from 'node-input-validator'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { generateTagName } from '../Helpers/Helpers'

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const timeStamp = moment().format(TIME_FORMAT).toString()

const InventoryService = {
	getProducts: async (request: Request, response: Response) => {
		try {
			const authheader: any = request.headers.authorization

			const authUser: any = jwt.decode(authheader)

			const query = {
				where: {
					ID: authUser.ID,
				},
			}

			const user = await UserAuthentication.User.findOne(query)

			if (user.role === 'admin') {
				const inventories = await UserAuthentication.Inventory.findAll()

				return response.status(200).json({
					status: 'Successful',
					message: 'All Inventory',
					data: inventories
				})
			}

			return response.status(400).json({
				status: 'Failed',
				message: 'You are not authorized',
				data: null,
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},

	createProduct: async (request: Request, response: Response) => {
		try {
			const validator = new Validator(request.body, {
				productName: 'required',
				category: 'required',
			})

			const matched = await validator.check()
			if (!matched) {
				return response.status(422).json({
					status: 'Failed',
					message: 'Validation Failed',
					data: validator.errors,
				})
			}

			const { productName, tag, category } = request.body

			const productExist = await UserAuthentication.Inventory.findOne({ where: { productName: productName } })

			if (productExist) {
				return response.status(400).json({
					status: 'Failed',
					message: 'This is an existing product',
					data: null,
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

			if (user.role === 'admin') {
				const product = await UserAuthentication.Inventory.create({
					productName: productName,
					tag: tag ?? generateTagName(productName),
					category: category,
					createdBy: user.firstName + ' ' + user.lastName,
				})

				return response.status(201).json({
					status: 'Successful',
					message: 'Product Inventory created successfully',
					data: product
				})
			}

			return response.status(400).json({
				status: 'Failed',
				message: 'You are not authorized',
				data: null,
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},

	getProduct: async (request: Request, response: Response) => {
		try {
			const authheader: any = request.headers.authorization

			const authUser: any = jwt.decode(authheader)

			const query = {
				where: {
					ID: authUser.ID,
				},
			}

			const user = await UserAuthentication.User.findOne(query)

			if (user.role === 'admin') {
				const inventory = await UserAuthentication.Inventory.findByPk(request.params.productId)

				if(!inventory){
					return response.status(404).json({
						status: 'Failed',
						message: 'product not found',
						data: null,
					})
				}

				return response.status(200).json({
					status: 'Successful',
					message: 'Inventory',
					data: inventory,
				})
			}

			return response.status(400).json({
				status: 'Failed',
				message: 'You are not authorized',
				data: null,
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},
	updateProduct: async (request: Request, response: Response) => {
		try {
			
			const { productName, tag, category } = request.body
			const authheader: any = request.headers.authorization

			const authUser: any = jwt.decode(authheader)

			const userQuery = {
				where: {
					ID: authUser.ID,
				},
			}

			const user = await UserAuthentication.User.findOne(userQuery)
			if (user.role === 'admin') {
				const query = {
					where: {
						ID: parseInt(request.params.productId),
					},
				}

				const productExists = await UserAuthentication.Inventory.findByPk(request.params.productId)


				if (!productExists) {
					return response.status(404).json({
						status: 'Failed',
						message: 'Product does not exist',
					})
				}

				const checkValues = await UserAuthentication.Inventory.findOne({
					where: {
						[Op.or]: {
							productName: productName,
						},
					},
				})

				if (checkValues) {
					return response.status(400).json({
						status: 'Failed',
						message: 'Product exist with value(s) in the inventory',
						data: checkValues,
					})
				}

				const updatedData: any = {
					productName: productName ?? productExists.productName,
					tag: tag ?? generateTagName(productName),
					category: category ?? productExists.category,
					createdBy: user.firstName + ' ' + user.lastName,
				}

				await UserAuthentication.Inventory.update(updatedData, query)

				return response.status(200).json({
					status: 'Successful',
					message: 'User updated successfully',
					data: updatedData,
				})
			}
			
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},
	deleteProduct: async (request: Request, response: Response) => {
		try {
			const authheader: any = request.headers.authorization

			const authUser: any = jwt.decode(authheader)

			const query = {
				where: {
					ID: authUser.ID,
				},
			}

			const productQuery = {
				where: {
					ID: parseInt(request.params.productId),
				},
			}

			const user = await UserAuthentication.User.findOne(query)

			if (user.role === 'admin') {
				
				await UserAuthentication.Inventory.destroy(productQuery)

				return response.status(200).json({
					status: 'Successful',
					message: 'Product deleted succefully from inventory'
				})
			}

			return response.status(400).json({
				status: 'Failed',
				message: 'You are not authorized to carry out this action'
			})
		} catch (error: any) {
			return response.status(400).json({
				status: 'Failed',
				message: error.message,
			})
		}
	},
}

export = InventoryService