import { DataTypes } from 'sequelize'

export const UserModel = (sequelize: any) => {
	const attributes = {
		ID: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		firstName: { type: DataTypes.STRING, allowNull: true },
		lastName: { type: DataTypes.STRING, allowNull: true },
		email: { type: DataTypes.STRING, allowNull: true },
		password: { type: DataTypes.STRING, allowNull: true },
		role: { type: DataTypes.STRING, allowNull: true },
	}

	return sequelize.define('User', attributes, {
		timestamps: true,
		paranoid: true,
	})
}

export const RoleModel = (sequelize: any) => {
	const attributes = {
		ID: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		Name: { type: DataTypes.STRING, allowNull: true },
		CreatedBy: { type: DataTypes.STRING, allowNull: true },
	}

	return sequelize.define('Role', attributes, {
		timestamps: true,
		paranoid: true,
	})
}

export const InventoryModel = (sequelize: any) => {
	const attributes = {
		ID: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		productName: { type: DataTypes.STRING, allowNull: true },
		tag: { type: DataTypes.STRING, allowNull: true },
		category: { type: DataTypes.STRING, allowNull: true },
		createdBy: { type: DataTypes.STRING, allowNull: true },
	}

	return sequelize.define('Inventory', attributes, {
		timestamps: true,
		paranoid: true,
	})
}

export const PaymentTransactionModel = (sequelize: any) => {
	const attributes = {
		ID: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		productId: { type: DataTypes.STRING, allowNull: false },
		amount: { type: DataTypes.STRING, allowNull: false },
		paymentUrl: { type: DataTypes.STRING, allowNull: false },
		transactionReference: { type: DataTypes.STRING, allowNull: false },
		paymentReference: { type: DataTypes.STRING, allowNull: true },
		status: { type: DataTypes.STRING, allowNull: false },
	}

	return sequelize.define('PaymentTransaction', attributes, {
		timestamps: true,
		paranoid: true,
	})
}


