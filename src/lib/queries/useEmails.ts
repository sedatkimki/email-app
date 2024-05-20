import { EmailAPI } from "@/api";
import { UserMailDto } from "@/api/client";
import { ErrorMessage } from "@/pages/types";
import { toast } from "sonner";
import useSWR from "swr";
import { useUser } from "./useUser";

const userFetcher = async (): Promise<UserMailDto[]> => {
  const response = await EmailAPI.getUserEmails();
  return response.data;
};

const updateEmailApi = async (
  mailItem: UserMailDto,
  emails?: UserMailDto[]
): Promise<UserMailDto[]> => {
  const response = await EmailAPI.updateUserEmail(mailItem);
  return [
    ...(emails ?? []).map((email) =>
      email.mail?.id === mailItem.mail?.id ? response.data : email
    ),
  ];
};

const deleteEmailApi = async (
  mailItem: UserMailDto,
  emails?: UserMailDto[]
): Promise<UserMailDto[]> => {
  await EmailAPI.deleteUserEmail(mailItem);
  return (emails ?? []).filter((email) => email.mail?.id !== mailItem.mail?.id);
};

export function useEmails() {
  const { user } = useUser();
  const { data, error, isLoading, mutate } = useSWR<UserMailDto[]>(
    user ? `emails` : null,
    userFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  const updateEmail = async (mailItem: UserMailDto) => {
    try {
      await mutate(updateEmailApi(mailItem, data), {
        optimisticData: [
          ...(data ?? []).map((email) =>
            email.mail?.id === mailItem.mail?.id ? mailItem : email
          ),
        ],
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      });
    } catch (error) {
      toast.error(
        String((error as ErrorMessage).response.data.message as string)
      );
    }
  };

  const deleteEmail = async (mailItem: UserMailDto) => {
    try {
      await mutate(deleteEmailApi(mailItem, data), {
        optimisticData: (data ?? []).filter(
          (email) => email.mail?.id !== mailItem.mail?.id
        ),
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      });
    } catch (error) {
      toast.error(
        String((error as ErrorMessage).response.data.message as string)
      );
    }
  };

  return {
    emails: data,
    isLoading: isLoading,
    isError: error,
    updateEmail,
    mutate,
    deleteEmail,
  };
}
