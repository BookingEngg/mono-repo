import {
  Sequelize,
  DataTypes,
  Model,
  Op,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import {
  ConversionEventSourceEnum,
  ConversionTriggerEnum,
  EarningStatusEnum,
} from "@/interfaces/enum";

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
  declare order_id: string | null; // brand's order id, once they report one

  // --- the conversion this accrued from -------------------------------
  declare job_application_short_id: string | null;
  declare visitor_id: string | null; // brand-reported identifier, dedupes retries
  declare trigger: ConversionTriggerEnum | null;
  declare event_source: ConversionEventSourceEnum | null;
  declare awb_no: string | null;
  declare recorded_at: Date | null; // when the event happened, not when we wrote it

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
      order_id: { type: DataTypes.STRING },

      job_application_short_id: { type: DataTypes.STRING },
      visitor_id: { type: DataTypes.STRING },
      trigger: {
        type: DataTypes.STRING,
        validate: { isIn: [Object.values(ConversionTriggerEnum)] },
      },
      event_source: {
        type: DataTypes.STRING,
        validate: { isIn: [Object.values(ConversionEventSourceEnum)] },
      },
      awb_no: { type: DataTypes.STRING },
      recorded_at: { type: DataTypes.DATE },

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
        { fields: ["job_application_short_id"] },
        // One visitor can only register the same trigger once per
        // application — what makes accrual idempotent against webhook
        // retries. Partial so a reversal (no visitor_id) can't collide with
        // the accrual it reverses.
        {
          unique: true,
          fields: ["job_application_short_id", "visitor_id", "trigger"],
          where: { visitor_id: { [Op.ne]: null } },
        },
        { fields: ["payment_id"] },
        { fields: ["payment_cycle_id"] },
      ],
    },
  );

  return EarningModel;
}
