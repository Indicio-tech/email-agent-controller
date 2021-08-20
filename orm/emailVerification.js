const {Sequelize, DataTypes, Model} = require('sequelize')

const init = require('./init.js')
sequelize = init.connect()

class emailVerification extends Model {}

emailVerification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    email: {
      type: DataTypes.TEXT,
    },
    token: {
      type: DataTypes.TEXT,
    },
    connection_id: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'emailVerification',
    tableName: 'email_verifications',
    timestamps: false,
  },
)

module.exports = {
  emailVerification,
}
