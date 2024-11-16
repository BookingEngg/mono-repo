import { Routes } from "@interfaces/common.interface";
import { Router, Request, Response, NextFunction } from "express";
import IndexController from "@controllers/index.controller";

class IndexRoutes implements Routes {
  public path = "/";
  public router = Router();

  //Controllers
  private indexController = new IndexController();

  constructor() {
    this.initilizeRoutes(`${this.path}`);
  }

  private initilizeRoutes(path: string) {
    this.router.get(`${path}health`, this.indexController.healthController);
  }
}

export default IndexRoutes;
