import { Request, Response, NextFunction } from 'express'
import jwt, { Secret, JwtPayload } from 'jsonwebtoken'

export const SECRET_KEY: Secret = 'YOUR_SECRET'

export interface CustomRequest extends Request {
	token: string | JwtPayload
}

export const auth = (request: Request, response: Response, next: NextFunction) => {
	try {
		const token = request.header('Authorization')?.replace('Bearer ', '')

		if (!token) {
			throw new Error()
		}

		const decoded: any = jwt.verify(token, SECRET_KEY)
		;(request as CustomRequest).token = decoded

		next()
	} catch (err: any) {
		response.status(401).json({
			status: 'Failed',
			message: 'Please authenticate',
		})
	}
}
