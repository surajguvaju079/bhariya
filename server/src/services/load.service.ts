import { LOAD_STATUS } from "@/constants/loadStatus";
import { ILoad, Load } from "@/models/load.model";
import { ApiError } from "@/utils/apiError";
import { StatusCodes } from "@/utils/statusCodes";

export class LoadService {
  public async getPendingLoads(): Promise<ILoad[]> {
    const loads = Load.find({ status: "pending" });
    return loads;
  }

  /**
   * Accept a load by its ID
   * @param id - unique load identifier
   * @returns updated load
   **/

  // TODO:   ADD SERVICE RESPOSE IN THE SERVICE LAYER

  async acceptLoad(loadId: string, driverId: string): Promise<ILoad> {
    const load = await Load.findOneAndUpdate(
      { _id: loadId, status: LOAD_STATUS.PENDING },
      { status: LOAD_STATUS.ACCEPTED, driverId },
      { new: true },
    );

    if (!load) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Load already accepted");
    }

    return load;
  }
}

export const loadService = new LoadService();
