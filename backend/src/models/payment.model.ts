import {
  Sequelize,
  DataTypes,
  Model,
  Op,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { PaymentProviderEnum, PaymentStatusEnum, PaymentTypeEnum } from "@/interfaces/enum";

export class PaymentModel extends Model<
  InferAttributes<PaymentModel>,
  InferCreationAttributes<PaymentModel>
> {
  declare id: CreationOptional<number>;

  declare seller_id: string | null;
  declare order_id: string;
  declare user_id: string | null;

  declare payable_amount: number;
  declare currency: CreationOptional<string>;

  declare transaction_id: string | null; // partner/gateway order id

  declare online_request: CreationOptional<object | null>;
  declare online_response: CreationOptional<object | null>;

  declare payment_type: PaymentTypeEnum;
  declare payment_status: CreationOptional<PaymentStatusEnum>;
  declare payment_gateway: PaymentProviderEnum;
  declare payment_cycle_id: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default function (sequelize: Sequelize): typeof PaymentModel {
  PaymentModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },

      seller_id: { type: DataTypes.TEXT },
      order_id: { type: DataTypes.TEXT, allowNull: false },
      user_id: { type: DataTypes.TEXT },

      payable_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: "INR" },

      transaction_id: { type: DataTypes.TEXT },

      online_request: { type: DataTypes.JSONB },
      online_response: { type: DataTypes.JSONB },

      payment_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [Object.values(PaymentTypeEnum)] },
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: PaymentStatusEnum.INITIATED,
        validate: { isIn: [Object.values(PaymentStatusEnum)] },
      },
      payment_gateway: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [Object.values(PaymentProviderEnum)] },
      },
      payment_cycle_id: { type: DataTypes.TEXT },

      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    },
    {
      tableName: "payments",
      sequelize,
      underscored: true,
      indexes: [
        { fields: ["seller_id"] },
        { fields: ["user_id"] },
        { fields: ["order_id"] },
        { fields: ["payment_cycle_id"] },
        { fields: ["payment_status"] },
        // idempotent on gateway retries once a partner transaction id is assigned
        {
          unique: true,
          fields: ["payment_gateway", "transaction_id"],
          where: { transaction_id: { [Op.ne]: null } },
        },
      ],
    },
  );

  return PaymentModel;
}
