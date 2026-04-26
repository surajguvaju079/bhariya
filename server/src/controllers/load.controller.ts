import { Request, Response } from "express";
import { loadServ } from "@/services/load.service";
import { StatusCodes } from "@/utils/statusCodes";

export class LoadController {
  public async getLoads(req: Request, res: Response) {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;
    const page =
      rawPage === undefined || rawPage === null || rawPage === ""
        ? 1
        : Number(rawPage);
    const limit =
      rawLimit === undefined || rawLimit === null || rawLimit === ""
        ? 10
        : Number(rawLimit);

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
