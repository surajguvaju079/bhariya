import { LOAD_STATUS } from "@/constants/loadStatus";
import { ILoad, Load } from "@/models/load.model";
import { ApiError } from "@/utils/apiError";
import { StatusCodes } from "@/utils/statusCodes";
import { logger } from "@/utils/logger";
import type { CreateLoadInput } from "@/validations/load.validation";

export class LoadService {
  /**
   * Geocode a place name → [longitude, latitude] using Nominatim .
   * Falls back gracefully — if geocoding fails we still create the load,
   * but coords will be [0, 0] which means it won't appear in nearby queries.
   */
  private async geocode(placeName: string): Promise<[number, number]> {
    try {
      const encoded = encodeURIComponent(placeName);
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "BhariyaApp/1.0 (freight management)",
        },
      });

      const data = await res.json();

      if (!data || data.length === 0) {
        logger.warn(`Geocoding failed for: ${placeName}`);
        return [0, 0];
      }

      const lng = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);
      return [lng, lat];
    } catch (err) {
      logger.error("Nominatim geocoding error", err);
      return [0, 0];
    }
  }

  /**
   * Get pending loads, optionally filtered by proximity to driver's location.
   * If lat/lng are provided, uses MongoDB $near to return loads sorted
   * by distance (closest first) within the given radius.
   * Falls back to standard createdAt sort if no location given.
   */
  public async getPendingLoads(
    page: number,
    limit: number,
    lat?: number,
    lng?: number,
    radiusKm: number = 10,
  ): Promise<{
    loads: ILoad[];
    pagination: { page: number; limit: number; hasMore: boolean };
    nearbyMode: boolean;
  }> {
    const offset = (page - 1) * limit;
    const nearbyMode = lat !== undefined && lng !== undefined;

    let loads: ILoad[];

    if (nearbyMode) {
      const allNearby = await Load.find({
        status: "PENDING",
        originCoords: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng!, lat!],
            },
            $maxDistance: radiusKm * 1000,
          },
        },
      });

      const paginated = allNearby.slice(offset, offset + limit + 1);
      const hasMore = paginated.length > limit;
      loads = hasMore ? paginated.slice(0, limit) : paginated;

      return {
        loads,
        pagination: { page, limit, hasMore },
        nearbyMode: true,
      };
    }

    const results = await Load.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit + 1);

    const hasMore = results.length > limit;
    loads = hasMore ? results.slice(0, limit) : results;

    return {
      loads,
      pagination: { page, limit, hasMore },
      nearbyMode: false,
    };
  }

  /**
   * Accept a load — atomic findOneAndUpdate ensures only one driver wins
   * even under concurrent requests (race condition safe).
   */
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

  /**
   * Create a load. Geocodes origin and destination automatically
   * if coords are not provided in the request body.
   */
  async createLoad(loadData: CreateLoadInput): Promise<ILoad> {
    if (!loadData.originCoords) {
      const [lng, lat] = await this.geocode(loadData.origin);
      (loadData as any).originCoords = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    if (!loadData.destinationCoords) {
      const [lng, lat] = await this.geocode(loadData.destination);
      (loadData as any).destinationCoords = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    const load = new Load(loadData);
    await load.save();
    return load;
  }
}

export const loadServ = new LoadService();
