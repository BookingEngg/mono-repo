import { Router } from "express";

export interface Routes {
  path: string;
  router: Router;
}

export type CreateOptionals<T> = {
  [Property in keyof T]+?: T[Property];
};