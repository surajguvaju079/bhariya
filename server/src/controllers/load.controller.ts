import { Request, Response } from "express";
import { loadServ } from "@/services/load.service";
import { StatusCodes } from "@/utils/statusCodes";

export class LoadController {
  public async getLoads(req: Request, res: Response) {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;
    const rawLat = req.query.lat;
    const rawLng = req.query.lng;
    const rawRadius = req.query.radius;

    const page = rawPage === undefined || rawPage === "" ? 1 : Number(rawPage);
    const limit =
      rawLimit === undefined || rawLimit === "" ? 10 : Number(rawLimit);

    const lat =
      rawLat !== undefined && rawLat !== "" ? Number(rawLat) : undefined;
    const lng =
      rawLng !== undefined && rawLng !== "" ? Number(rawLng) : undefined;
    const radius =
      rawRadius !== undefined && rawRadius !== "" ? Number(rawRadius) : 10;

    const result = await loadServ.getPendingLoads(
      page,
      limit,
      lat,
      lng,
      radius,
    );

    res.status(StatusCodes.OK).json({ success: true, data: result });
  }

  public async acceptLoad(req: Request, res: Response) {
    const { id } = req.params;
    const { driverId } = req.body;
    const load = await loadServ.acceptLoad(String(id), String(driverId));
    res.status(StatusCodes.OK).json({ success: true, data: load });
  }

  public async createLoad(req: Request, res: Response) {
    const load = await loadServ.createLoad(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: load });
  }
}

export const loadController = new LoadController();
