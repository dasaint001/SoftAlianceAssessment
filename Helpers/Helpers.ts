import { v4 as uuidv4 } from 'uuid'

export const trimModelAttributes = (model: any) => {
	Object.keys(model.dataValues).forEach((key: any) => {
		if (typeof model.dataValues[key] === 'string') {
			model.dataValues[key] = model.dataValues[key].trim()
		}
	})

	return JSON.parse(JSON.stringify(model))
}


export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	return emailRegex.test(email)
}

export const tokenCode = Math.floor(Math.random() * 900000) + 100000

export const generateTagName = (productName: string) => {
	const firstThreeLetters = productName.substring(0, 3).toUpperCase()
	const randomNumber = Math.floor(Math.random() * 900) + 100
	const tagName = `${firstThreeLetters}${randomNumber}`

	return tagName
}

export const generateTrancationReference = (): string => {
	const uuid = uuidv4()
	const transactionReference = uuid.substring(0, 8)

	return transactionReference
}





