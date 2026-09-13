import { Sequelize } from "sequelize";
import cls from "cls-hooked";
import { postgresDbConfig, isProduction } from "@/config";
import PaymentModel from "@/models/payment.model";
import WalletModel from "@/models/wallet.model";
import EarningModel from "@/models/earning.model";

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

    pool: {
      max: 10,
      /**
       * The important one. Sequelize defaults to min 0 and evicts idle
       * connections after 10s, so on anything but constant traffic the next
       * request pays to open a fresh connection — TCP, TLS and auth — before
       * it can run a single statement. That is seconds against a managed
       * Postgres, and it is why a redirect that normally answers in ~100ms
       * occasionally took five: not the query, the connect.
       *
       * Holding two connections open means a request after a quiet spell
       * finds one waiting.
       */
      min: 2,
      // Well above the eviction window, so a warm connection survives a gap
      // in traffic rather than being closed and immediately reopened.
      idle: 60_000,
      // Bounded so a pool starved by a stuck query fails fast and visibly
      // instead of hanging a request for a minute (the default).
      acquire: 10_000,
      // Recycled periodically anyway — long-lived connections behind a load
      // balancer get dropped server-side without the client noticing.
      evict: 300_000,
    },

    // Detects a connection a network device has silently dropped, rather than
    // handing it to a query that then waits for a timeout.
    dialectOptions: {
      keepAlive: true,
    },

    retry: {
      // A connection killed between checkout and use is retried once rather
      // than surfacing as a request failure.
      max: 2,
    },
  },
);

sequelize.authenticate().catch((error) => {
  console.error("Unable to connect to the Postgres database:", error);
});

// Single registry of the Postgres-backed models, each bound to this
// connection via its factory function — mirrors how MONGO_INSTANCES is the
// one place mongoose connections live.
export const DB = {
  Payment: PaymentModel(sequelize),
  Wallet: WalletModel(sequelize),
  Earning: EarningModel(sequelize),
  sequelize,
  Sequelize,
};
