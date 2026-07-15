import { api } from "./api";

export const getCourses = async () => {
  const { data } = await api.get("/courses");
  return data;
};