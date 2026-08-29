import { IUser } from '@/interfaces/user.interface';
import express from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
      type?: string;
      session?: {
        auth: string;
      };
      headers?: {
        paltform?: string;
      };
      _startTime?: number;
      /**
       * Unparsed request body, captured by express.json's `verify` hook in
       * app.ts. Gateway webhooks sign the exact bytes they sent, so a
       * re-serialized req.body can never reproduce the HMAC.
       */
      rawBody?: string;
    }

    export interface Response {
      sendformat: <Data>(data: Data, code?: number) => express.Response<Data>;
    }
  }
}