import {
  Sequelize,
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { EarningStatusEnum } from "@/interfaces/enum";

// One row per accrual event — the source of truth for what a user is owed.
// Generic like PaymentModel (order_id/seller_id/user_id, not job-specific
// naming) so it isn't locked to the creator-hub job/conversion shape.
// Append-only: a reversed earning is a new row pointing back at the one it
// reverses, never an edit to the original.
export class EarningModel extends Model<
  InferAttributes<EarningModel>,
  InferCreationAttributes<EarningModel>
> {
  declare id: CreationOptional<number>;

  declare user_id: string; // who earned this
  declare seller_id: string | null;
  declare order_id: string; // the order/job-application this accrued from

  declare amount: number;
  declare currency: CreationOptional<string>;

  declare earning_status: CreationOptional<EarningStatusEnum>;
  declare reversed_earning_id: number | null;

  // FK -> payments.id, set once this earning is actually paid out
  declare payment_id: number | null;
  declare payment_cycle_id: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default function (sequelize: Sequelize): typeof EarningModel {
  EarningModel.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },

      user_id: { type: DataTypes.STRING, allowNull: false },
      seller_id: { type: DataTypes.STRING },
      order_id: { type: DataTypes.STRING, allowNull: false },

      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "INR" },

      earning_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: EarningStatusEnum.ACCRUED,
        validate: { isIn: [Object.values(EarningStatusEnum)] },
      },
      reversed_earning_id: {
        type: DataTypes.BIGINT,
        references: { model: "earnings", key: "id" },
      },

      payment_id: {
        type: DataTypes.BIGINT,
        references: { model: "payments", key: "id" },
      },
      payment_cycle_id: { type: DataTypes.STRING },

      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: { allowNull: false, type: DataTypes.DATE },
    },
    {
      tableName: "earnings",
      sequelize,
      underscored: true,
      indexes: [
        { fields: ["user_id", "earning_status"] },
        { fields: ["seller_id"] },
        { fields: ["order_id"] },
        { fields: ["payment_id"] },
        { fields: ["payment_cycle_id"] },
      ],
    },
  );

  return EarningModel;
}
