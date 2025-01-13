import { Sequelize } from 'sequelize'
import { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_USERNAME } from '../config'
import { UserModel, RoleModel, InventoryModel, PaymentTransactionModel } from './Models'
export const UserAuthentication: any = {}

const initialize = async () => {
	const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
		host: DATABASE_HOST,
		dialect: 'mysql',
		port: 3306,
		logging: false,
	})

	UserAuthentication.sequelize = sequelize
	UserAuthentication.User = UserModel(sequelize)
	UserAuthentication.Role = RoleModel(sequelize)
	UserAuthentication.Inventory = InventoryModel(sequelize)
	UserAuthentication.PaymentTransaction = PaymentTransactionModel(sequelize)

	await sequelize.sync()
}

initialize()
