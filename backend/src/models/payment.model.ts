import { DataTypes, Model, Op } from "sequelize";
import { sequelize } from "@/database/postgres";
import { IPayment } from "@/interfaces/payment.interface";
import { PaymentProviderEnum, PaymentStatusEnum } from "@/interfaces/enum";

export interface PaymentInstance extends Model<IPayment, IPayment>, IPayment {}

const PaymentModel = sequelize.define<PaymentInstance>(
  "payment",
  {
    seller_id: { type: DataTypes.TEXT, allowNull: false },
    order_id: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.TEXT, allowNull: false },

    payable_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: "INR" },

    transaction_id: { type: DataTypes.TEXT }, // partner/gateway order id

    online_request: { type: DataTypes.JSONB },
    online_response: { type: DataTypes.JSONB },

    payment_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [Object.values(PaymentStatusEnum)] },
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
  },
  {
    tableName: "payments",
    underscored: true,
    timestamps: true,
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

export default PaymentModel;
