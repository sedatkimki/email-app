import { atom, useAtom } from "jotai";
import { MailDto } from "@/api/client";

type Config = {
  selected: MailDto["id"] | null;
};

const configAtom = atom<Config>({
  selected: null,
});

export function useMail() {
  return useAtom(configAtom);
}
