import { Request, Response } from "express";
import { LoadService } from "@/services/load.service";
import { StatusCodes } from "@/utils/statusCodes";

export class LoadController {
  public loadService: LoadService;
  constructor() {
    this.loadService = new LoadService();
  }

  public async getLoads(req: Request, res: Response) {
    const loads = await this.loadService.getPendingLoads();
    res.status(StatusCodes.OK).json({ success: true, data: loads });
  }

  public async acceptLoad(req: Request, res: Response) {
    const { id } = req.params;
    const driverId = req.body.driverId;
    const load = await this.loadService.acceptLoad(
      String(id),
      String(driverId),
    );
    res.status(StatusCodes.OK).json({ success: true, data: load });
  }
}

export const loadController = new LoadController();
