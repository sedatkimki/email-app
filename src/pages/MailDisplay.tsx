import { format } from "date-fns";
import { Archive, ArchiveX, Trash, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MailDto,
  UserMailDto,
  UserMailDtoMailBoxTypesEnum,
} from "@/api/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { EmailAPI } from "@/api";
import { useEmails } from "@/lib/queries/useEmails";
import { ErrorMessage } from "./types";
import { useMail } from "@/lib/useMail";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MailDisplayProps {
  mail: UserMailDto | null;
}
const replyMailFormSchema = z.object({
  content: z.string().min(6),
});
type ReplyMailFormValues = z.infer<typeof replyMailFormSchema>;

// Mail detayları burada gösteriliyor ve maile cevap verme formu burada bulunuyor
export function MailDisplay({ mail }: MailDisplayProps) {
  const form = useForm<ReplyMailFormValues>({
    resolver: zodResolver(replyMailFormSchema),
    defaultValues: {
      content: "",
    },
  });
  const [selectedMail, setMail] = useMail();
  const { mutate, updateEmail, deleteEmail } = useEmails();
  const getAllParentsAsArray = (mail: UserMailDto | null): MailDto[] => {
    const parents: MailDto[] = [];
    let currentMail = mail?.mail?.parent?.[0];
    let i = 0;

    while (currentMail) {
      parents.push(currentMail);
      currentMail = currentMail.parent?.[i];
      i++;
    }

    return parents.reverse();
  };

  const changeBoxType = async (boxType: UserMailDtoMailBoxTypesEnum) => {
    await updateEmail({
      ...mail,
      mailBoxTypes: boxType,
    });
  };

  async function onSubmit(values: ReplyMailFormValues) {
    try {
      // Gönderilen mailin içeriği ve başlığı kontrol ediliyor
      await EmailAPI.sendEmail({
        to: [
          {
            email: mail?.mail?.sender?.email ?? "",
          } ?? "",
        ],
        title: mail?.mail?.title?.includes("Reply:")
          ? mail?.mail?.title
          : `Reply: ${mail?.mail?.title}`,
        content: values.content,
        tags: [],
        repliedMail: mail?.mail,
      });
      form.reset({
        content: "",
      });
      setMail({
        ...selectedMail,
        selected: -1,
      });
      toast.success("Email sent");
      mutate();
    } catch (error) {
      toast.error(
        String((error as ErrorMessage).response.data.message as string)
      );
    }
  }
  // Gönderilen mailin parentları burada gösteriliyor
  const renderParents = (mail: UserMailDto | null) => {
    const parents = getAllParentsAsArray(mail);

    return parents.map((parent) => (
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage
                  alt={
                    parent.sender?.firstName + (parent.sender?.lastName ?? "")
                  }
                />
                <AvatarFallback>
                  {parent.sender?.firstName?.[0] ?? ""}
                  {parent.sender?.lastName?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">
                  {parent.sender?.firstName ||
                    "" + parent.sender?.lastName ||
                    ""}
                </div>
                <div className="line-clamp-1 text-xs">{parent?.title}</div>
              </div>
            </div>
            {parent?.creationTime && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(parent?.creationTime), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {parent?.content}
          </div>
          <Separator className="mt-auto" />
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={
                  !mail ||
                  mail.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Archive
                }
                onClick={() => {
                  changeBoxType(UserMailDtoMailBoxTypesEnum.Archive);
                  setMail({
                    ...selectedMail,
                    selected: -1,
                  });
                }}
              >
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={
                  !mail ||
                  mail.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Junk
                }
                onClick={() => {
                  changeBoxType(UserMailDtoMailBoxTypesEnum.Junk);
                  setMail({
                    ...selectedMail,
                    selected: -1,
                  });
                }}
              >
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          {mail?.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Junk && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!mail}
                  onClick={() => {
                    deleteEmail(mail);
                    setMail({
                      ...selectedMail,
                      selected: -1,
                    });
                  }}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail}
                onClick={() => {
                  setMail({
                    ...selectedMail,
                    selected: -1,
                  });
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Separator />
      {mail ? (
        <>
          <div className="flex h-screen flex-col">
            <ScrollArea className="h-[calc(100vh-250px)]">
              {renderParents(mail)}

              <div className="flex items-start p-4">
                <div className="flex items-start gap-4 text-sm">
                  <Avatar>
                    <AvatarImage alt={mail.mail?.sender?.firstName} />
                    <AvatarFallback>
                      {mail.mail?.sender?.firstName?.[0] ?? ""}
                      {mail.mail?.sender?.lastName?.[0] ?? ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">
                      {mail.mail?.sender?.firstName ||
                        "" + mail.mail?.sender?.lastName ||
                        ""}
                    </div>
                    <div className="line-clamp-1 text-xs">
                      {mail.mail?.title}
                    </div>
                  </div>
                </div>
                {mail.mail?.creationTime && (
                  <div className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(mail.mail?.creationTime), "PPpp")}
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
                {mail.mail?.content}
              </div>
            </ScrollArea>
            <Separator className="mt-auto" />
            <div className="p-4 flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={`Reply ${mail.mail?.sender?.firstName}...`}
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        type="submit"
                        className="ml-auto"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? "…Loading" : "Send"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
