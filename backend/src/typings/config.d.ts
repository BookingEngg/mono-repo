import type { Dialect } from "sequelize";

export interface IServer {
  url: string;
  port: number;
}

export interface IUiConfig {
  url: string;
  port: number;
}

export interface IDataBaseConfig {
  praman: IDataBase;
}

export interface IRedisConfig {
  host: string;
  username: string;
  password: string;
  port: number;
}

export interface IPublisher {
  [key: string]: {
    stream: string;
    queue: string;
  };
}

export interface IDataBase {
  name: string;
  username: string;
  password: string;
  port: number;
  url: string;
  post_url: string;
}

// Postgres backs the creator-hub payments domain. Field names deliberately
// match Sequelize's connection options (name/username/password/host/port/
// dialect) so the whole object can be spread straight into `new Sequelize()`
// options, the same way IDataBase mirrors what mongoose.createConnection needs.
export interface IPostgresConfig {
  name: string;
  username: string;
  password: string;
  host: string;
  port: number;
  dialect: Dialect;
  ssl?: boolean;
}

export interface INodeMailer {
  host: string;
  port: number;
  user: string;
  password: string;
  expire_in_minutes: number;
}

export interface IToken {
  secret_key: string;
  token_ttl_max_days: number;
  secure_token: boolean;
}

export interface IOAuth {
  google: IGoogleOAuth;
  github: IGithubOAuth;
}

/**
 * Payment gateway credentials. `key_id` is the only public half — it is sent
 * to the browser so the checkout widget can identify the merchant. `key_secret`
 * and `webhook_secret` never leave the server: they sign/verify amounts and
 * callbacks, so leaking either would let anyone forge a "payment succeeded".
 *
 * Keyed by provider so a second gateway is a new entry here, not a reshape.
 */
export interface IPaymentGatewayCredentials {
  key_id: string;
  key_secret: string;
  webhook_secret: string;
}

export interface IPaymentConfig {
  // Which gateway new payments are routed to. Existing rows keep whatever
  // gateway they were created with, so flipping this is always safe.
  active_gateway: string;
  // Refundable onboarding deposit that doubles as a brand's ads balance.
  // Server-owned: the client never sends an amount (see payment.service).
  security_deposit_amount: number;
  currency: string;
  razorpay: IPaymentGatewayCredentials;
}

export interface IGoogleOAuth {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  client_secret: string;
}

export interface IGithubOAuth {
  client_id: string;
  client_secret: string;
  scope: string;
  state: string;
  redirect_url_endpoint: string;
}
