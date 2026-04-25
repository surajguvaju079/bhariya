import { LOAD_STATUS } from "@/constants/loadStatus";
import { ILoad, Load } from "@/models/load.model";
import { ApiError } from "@/utils/apiError";
import { StatusCodes } from "@/utils/statusCodes";
import { CreateLoadInput } from "@/validations/load.validation";
export class LoadService {
  /**
   *
   * @returns fetch pending loads according to queries
   */

  public async getPendingLoads(
    page: number,
    limit: number,
  ): Promise<{
    loads: ILoad[];
    pagination: { page: number; limit: number; hasMore: boolean };
  }> {
    const offset = (page - 1) * limit;

    const filters = {
      status: "PENDING",
    };

    const loads = await Load.find(filters)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit + 1);
    const hasMore = loads.length > limit;
    const data = hasMore ? loads.slice(0, limit) : loads;
    return {
      loads: data,
      pagination: {
        limit,
        page,
        hasMore,
      },
    };
  }

  /**
   * Accept a load by its ID
   * @param id - unique load identifier
   * @returns updated load
   **/

  async acceptLoad(loadId: string, driverId: string): Promise<ILoad> {
    const load = await Load.findOneAndUpdate(
      { _id: loadId, status: LOAD_STATUS.PENDING },
      { status: LOAD_STATUS.ACCEPTED, driverId },
      { new: true },
    );

    if (!load) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Load already accepted");
    }
    // TODO:   ADD SERVICE RESPOSE IN THE SERVICE LAYER

    return load;
  }

  /**
   * @returns  created load
   * @body {origin, destination, weight, vehicleTypeRequired, price, status, driverId} - load details
   * status is optional and defaults to PENDING, driverId is optional and can be added when load is accepted
   * */

  async createLoad(loadData: CreateLoadInput): Promise<ILoad> {
    const load = new Load(loadData);
    await load.save();
    return load;
  }
}

export const loadServ = new LoadService();
