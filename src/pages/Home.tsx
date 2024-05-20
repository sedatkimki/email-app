import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMail } from "@/lib/useMail";
import { cn, getCookie } from "@/lib/utils";
import { Archive, ArchiveX, Inbox, Search, Send } from "lucide-react";
import React, { useMemo } from "react";
import { MailDisplay } from "./MailDisplay";
import { Nav } from "./Nav";
import { Account } from "./Account";
import { useEmails } from "@/lib/queries/useEmails";
import { UserMailDto, UserMailDtoMailBoxTypesEnum } from "@/api/client";
import Loading from "@/components/ui/loading";
import { MailList } from "./MailList";
import { useParams } from "react-router-dom";

interface MailProps {
  mails: UserMailDto[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Mail({
  mails,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [search, setSearch] = React.useState("");
  const [mail] = useMail();
  const params = useParams<{ boxName?: string }>(); // Add a question mark to make boxName optional

  const boxType = useMemo(
    () =>
      UserMailDtoMailBoxTypesEnum[
        ((params.boxName?.charAt(0).toUpperCase() ?? "") +
          (params.boxName?.slice(1) ??
            "")) as keyof typeof UserMailDtoMailBoxTypesEnum
      ],
    [params.boxName]
  );

  const filteredMails = useMemo(
    () => mails.filter((mail) => mail.mail?.content?.includes(search)),
    [search, mails]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <Account isCollapsed={isCollapsed} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Inbox",
                label: filteredMails
                  .filter((item) => {
                    return (
                      item.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Inbox
                    );
                  })
                  .length.toString(),
                icon: Inbox,
                to: "/inbox",
                variant:
                  boxType === UserMailDtoMailBoxTypesEnum.Inbox
                    ? "default"
                    : "ghost",
              },
              {
                title: "Sent",
                label: filteredMails
                  .filter((item) => {
                    return (
                      item.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Sent
                    );
                  })
                  .length.toString(),
                icon: Send,
                to: "/sent",
                variant:
                  boxType === UserMailDtoMailBoxTypesEnum.Sent
                    ? "default"
                    : "ghost",
              },
              {
                title: "Archive",
                label: filteredMails
                  .filter((item) => {
                    return (
                      item.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Archive
                    );
                  })
                  .length.toString(),
                icon: Archive,
                to: "/archive",
                variant:
                  boxType === UserMailDtoMailBoxTypesEnum.Archive
                    ? "default"
                    : "ghost",
              },
              {
                title: "Junk",
                label: filteredMails
                  .filter((item) => {
                    return (
                      item.mailBoxTypes === UserMailDtoMailBoxTypesEnum.Junk
                    );
                  })
                  .length.toString(),
                icon: ArchiveX,
                to: "/junk",
                variant:
                  boxType === UserMailDtoMailBoxTypesEnum.Junk
                    ? "default"
                    : "ghost",
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-8"
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    value={search}
                  />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList
                items={filteredMails.filter((item) => {
                  return item.mailBoxTypes === boxType;
                })}
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList
                items={filteredMails.filter((item) => {
                  return !item.read && item.mailBoxTypes === boxType;
                })}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <MailDisplay
            mail={mails.find((item) => item.mail?.id === mail.selected) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

export function Home() {
  const layout = getCookie("react-resizable-panels:layout");
  const collapsed = getCookie("react-resizable-panels:collapsed");
  const defaultLayout = layout ? JSON.parse(layout) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed) : undefined;
  const { emails, isLoading } = useEmails();
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen">
      <Mail
        mails={emails || []}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  );
}
