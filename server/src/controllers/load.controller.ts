import { Request, Response } from "express";
import { loadServ } from "@/services/load.service";
import { StatusCodes } from "@/utils/statusCodes";

export class LoadController {
  public async getLoads(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const loads = await loadServ.getPendingLoads(page, limit);
    res.status(StatusCodes.OK).json({ success: true, data: loads });
  }

  public async acceptLoad(req: Request, res: Response) {
    const { id } = req.params;
    const driverId = req.body.driverId;
    const load = await loadServ.acceptLoad(String(id), String(driverId));
    res.status(StatusCodes.OK).json({ success: true, data: load });
  }

  public async createLoad(req: Request, res: Response) {
    const load = await loadServ.createLoad(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: load });
  }
}

export const loadController = new LoadController();
