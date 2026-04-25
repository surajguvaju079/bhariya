import { BASE_URL } from "@/constants/BaseUrl";
import { API } from "@/service/axios";
console.log("Base URL is ", BASE_URL);

export const Load = {
  show: async () => {
    return await API.get(`${BASE_URL}/loads`);
  },
  accept: async (id: string, driverId: string) => {
    return await API.patch(`/loads/${id}/accept`, { driverId });
  },
};
