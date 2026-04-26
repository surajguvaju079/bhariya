import { API } from "@/service/axios";

export const Load = {
  /**
   * Fetch pending loads.
   * @param page - page number
   * @param limit - results per page
   * @param lat - driver's current latitude (optional, enables nearby filter)
   * @param lng - driver's current longitude (optional, enables nearby filter)
   * @param radius - radius in km (default 10)
   */
  show: async (
    page: number,
    limit: number,
    lat?: number,
    lng?: number,
    radius: number = 10,
  ) => {
    return await API.get("/loads", {
      params: {
        page,
        limit,
        ...(lat !== undefined && lng !== undefined ? { lat, lng, radius } : {}),
      },
    });
  },

  accept: async (id: string, driverId: string) => {
    return await API.patch(`/loads/${id}/accept`, { driverId });
  },
};
