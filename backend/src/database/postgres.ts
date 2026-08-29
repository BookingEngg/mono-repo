import { Sequelize } from "sequelize";
import cls from "cls-hooked";
import { postgresDbConfig, isProduction } from "@/config";

// Creator-hub payments domain (brand wallets, ledgers, settlements, payouts)
// lives in Postgres, not the `praman` Mongo instance — this data is
// relational and money-moving, and needs real transactions/foreign
// keys/numeric precision that the rest of the app's document-shaped data
// doesn't.
//
// CLS (continuation-local storage) namespace binding means a transaction
// started anywhere — `sequelize.transaction(async (t) => {...})` — is
// automatically picked up by every model call nested under it, so service
// code doesn't have to thread a `{ transaction }` option through every DAO
// call by hand. This matters here specifically because a single payment
// event can touch multiple tables (payment row + earning ledger rows) that
// must commit or roll back together.
const namespace = cls.createNamespace("backend");
Sequelize.useCLS(namespace);

export const sequelize = new Sequelize(
  postgresDbConfig.name,
  postgresDbConfig.username,
  postgresDbConfig.password,
  {
    ...postgresDbConfig,
    ...(isProduction ? {} : { logging: (sql: string) => console.log(sql) }),
  },
);

sequelize.authenticate().catch((error) => {
  console.error("Unable to connect to the Postgres database:", error);
});
