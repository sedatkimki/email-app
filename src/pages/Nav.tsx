import { LucideIcon, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import React from "react";
import NewMailDialog from "./components/NewMailDialog";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    to: string;
    variant: "default" | "ghost" | "outline";
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const [newMailDialog, setNewMailDialog] = React.useState(false);
  const onNewMail = () => {
    setNewMailDialog(true);
  };
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {!isCollapsed ? (
          <Button className="gap-2" variant={"outline"} onClick={onNewMail}>
            <PlusCircle className="h-4 w-4" />
            New Mail
          </Button>
        ) : (
          <Button
            variant={"outline"}
            size={"icon"}
            className="h-9 w-9"
            onClick={onNewMail}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">New Mail</span>
          </Button>
        )}

        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={link.to}
                  className={cn(
                    buttonVariants({ variant: link.variant, size: "icon" }),
                    "h-9 w-9",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              to={link.to}
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start"
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                      "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          )
        )}
      </nav>
      <NewMailDialog isOpen={newMailDialog} setIsOpen={setNewMailDialog} />
    </div>
  );
}
