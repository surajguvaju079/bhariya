import { API } from "@/service/axios";

export const Load = {
  show: async () => {
    return await API.get("/");
  },
  accept: async (id: string, driverId: string) => {
    return await API.patch(`/${id}/accept`, { driverId });
  },
};
