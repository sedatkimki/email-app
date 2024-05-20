import { EmailAPI } from "@/api";
import { MailUserDto } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useTags } from "@/lib/queries/useTags";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorMessage } from "../types";
import { useEmails } from "@/lib/queries/useEmails";

type NewMailDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};
const mailOptionSchema = z.object({
  label: z.string(),
  value: z.string().email(),
});
const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const newMailFormSchema = z.object({
  to: z.array(mailOptionSchema).min(1),
  title: z.string().min(6),
  content: z.string().min(6),
  tags: z.array(optionSchema),
});

type NewMailFormValues = z.infer<typeof newMailFormSchema>;

const NewMailDialog: FC<NewMailDialogProps> = ({ isOpen, setIsOpen }) => {
  const form = useForm<NewMailFormValues>({
    resolver: zodResolver(newMailFormSchema),
    defaultValues: {
      to: [],
      title: "",
      content: "",
      tags: [],
    },
  });
  const { tagsOptions } = useTags();
  const { mutate } = useEmails();

  async function onSubmit(values: NewMailFormValues) {
    try {
      await EmailAPI.sendEmail({
        to: values.to.map(
          (item) =>
            ({
              email: item.value,
            }) as MailUserDto
        ),
        title: values.title,
        content: values.content,
        tags: values.tags.map((item) => item.value),
      });
      mutate();
      setIsOpen(false);
    } catch (error) {
      toast.error(
        String((error as ErrorMessage).response.data.message as string)
      );
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send New Mail </DialogTitle>
          <DialogDescription>
            Fill in the details below to send a new mail.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" grid gap-4">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        placeholder="m@example.com"
                        creatable
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        placeholder="title of the mail"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="content of the mail"
                        className="resize-none"
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultipleSelector
                        placeholder="tags of the mail"
                        options={tagsOptions || []}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "…Loading" : "Send Mail"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMailDialog;
