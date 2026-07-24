import { axiosClient } from "./axiosClient";
import type { User } from "../types";

export const fetchUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<any, any>("/users");
  return Array.isArray(res) ? res : res.users || [];
};

export const fetchDeletedUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<any, any>("/users", {
    params: { status: "DELETED" },
  });
  return Array.isArray(res) ? res : res.users || [];
};
