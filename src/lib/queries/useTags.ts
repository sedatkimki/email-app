import { TagsAPI } from "@/api";
import { Tag } from "@/api/client";
import { Option } from "@/components/ui/multi-select";

import useSWR from "swr";

const tagsFetcher = async (): Promise<Tag[]> => {
  const response = await TagsAPI.getAllTags();
  return response.data;
};

export function useTags() {
  const { data, error, isLoading } = useSWR<Tag[]>(`tags`, tagsFetcher);

  return {
    tagsOptions: data?.map((item) => ({
      label: item.name,
      value: item.name,
    })) as Option[],
    isLoading: isLoading,
    isError: error,
  };
}
