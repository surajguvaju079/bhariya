import { BASE_URL } from "@/constants/BaseUrl";
import axios from "axios";

export const API = axios.create({
  baseURL: BASE_URL,
});
