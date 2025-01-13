import request from 'supertest'
import * as bcrypt from 'bcrypt'
import app from './index'
import { UserAuthentication } from './Database/UserAuthentication'
import sequelize from 'sequelize'

describe('API Tests', () => {
	let user: User

	beforeAll(async () => {
		// Create a test user in the database
		user = await UserAuthentication.User.create({ email: 'testuser@example.com', passwordHash: await bcrypt.hash('password123', 10), firstName: 'Tester', lastName: 'Account', role: 'admin' })
	})

	afterAll(async () => {
		await user.destroy()
		await sequelize.close()
	})

	it('should register a new user', async () => {
		const res = await request(app).post('/register').send({ email: 'newuser@example.com', password: 'password123' })

		expect(res.status).toBe(201)
		expect(res.body.message).toBe('User registered successfully')
	})

	it('should login a user successfully', async () => {
		const res = await request(app).post('/login').send({ email: user.email, password: 'password123' })

		expect(res.status).toBe(200)
		expect(res.body).toHaveProperty('token')
	})

	it('should fail to login with invalid credentials', async () => {
		const res = await request(app).post('/login').send({ email: user.email, password: 'wrongpassword' })

		expect(res.status).toBe(401)
		expect(res.body).toHaveProperty('error')
	})
})
function beforeAll(arg0: () => Promise<void>) {
    throw new Error('Function not implemented.')
}

