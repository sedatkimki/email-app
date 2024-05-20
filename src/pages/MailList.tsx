import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMail } from "@/lib/useMail";
import { UserMailDto } from "@/api/client";

import { useEmails } from "@/lib/queries/useEmails";

interface MailListProps {
  items: UserMailDto[];
}

// Mail listesi

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail();
  const { updateEmail } = useEmails();

  const handleMailSelection = async (mailId: number) => {
    const mailItem = items.find((item) => item.mail?.id === mailId);
    setMail({
      ...mail,
      selected: mailId,
    });

    if (!mailItem?.read) {
      await updateEmail({
        ...mailItem,
        read: true,
      });
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.mail?.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.mail?.id && "bg-muted"
            )}
            onClick={() => handleMailSelection(item.mail?.id ?? 0)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {item.mail?.sender?.firstName ??
                      "" + item.mail?.sender?.lastName ??
                      ""}
                  </div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.mail?.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(
                    new Date(item.mail?.creationTime ?? ""),
                    {
                      addSuffix: true,
                    }
                  )}
                </div>
              </div>
              <div className="text-xs font-medium">{item.mail?.title}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.mail?.content?.substring(0, 300) ?? ""}
            </div>
            {item.mail?.tags?.length ? (
              <div className="flex items-center gap-2">
                {item.mail?.tags.map((label) => (
                  <Badge key={label.name} variant={"outline"}>
                    {label.name}
                  </Badge>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
