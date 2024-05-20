import { AuthAPI, UserAPI } from "@/api";
import { UserDto } from "@/api/client";
import useSWR from "swr";

import { clearToken, getToken, setToken } from "../utils";

const userFetcher = async (): Promise<UserDto> => {
  const response = await UserAPI.getUserByToken();
  return response.data;
};

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserDto>(
    getToken() ? `user` : null,
    userFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const login = async (email: string, password: string) => {
    const response = await AuthAPI.login({
      email,
      password,
    });
    setToken(response.data.accessToken, 7);
    mutate();
  };

  const logout = () => {
    clearToken();
    mutate(undefined);
  };

  return {
    user: data,
    isLoading: isLoading,
    isError: error,
    logout,
    login,
  };
}
