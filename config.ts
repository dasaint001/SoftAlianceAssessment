import dotenv from 'dotenv'
dotenv.config()

export const APP_ENV = process.env.ENV ?? 'local'

// DB
export const DATABASE_HOST = process.env.DATABASE_HOST ?? ''
export const DATABASE_NAME = process.env.DATABASE_NAME ?? ''
export const DATABASE_USERNAME = process.env.DATABASE_USERNAME ?? ''
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? ''
export const DATABASE_PORT = process.env.DATABASE_PORT ?? ''

//Payment
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? ''
export const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL ?? ''