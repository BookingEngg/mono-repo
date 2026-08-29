import {
  Sequelize,
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

// Generic per-user wallet — one row per brand or creator, not per role.
// balance: general withdrawable/spendable balance (a creator's paid-out earnings).
// ads_balance: a brand's marketing spend limit, drawn down by job budget reservations.
// security_deposit: the refundable onboarding deposit that backs ads_balance
// (see backend/src/models/creator_hub.txt).
export class WalletModel extends Model<
  InferAttributes<WalletModel>,
  InferCreationAttributes<WalletModel>
> {
  declare id: CreationOptional<number>;
  declare user_id: string;
  declare balance: CreationOptional<number>;
  declare ads_balance: CreationOptional<number>;
  declare security_deposit: CreationOptional<number>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default function (sequelize: Sequelize): typeof WalletModel {
  WalletModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      ads_balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      security_deposit: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "wallets",
      sequelize,
      underscored: true,
    },
  );

  return WalletModel;
}
