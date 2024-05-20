import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/queries/useUser";
import { Mail, User2 } from "lucide-react";

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

export function Account({ isCollapsed }: AccountSwitcherProps) {
  const { user, logout } = useUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 [&>button]:line-clamp-1 [&>button]:flex [&>button]:w-full [&>button]:items-center [&>button]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 "
        )}
        asChild
        aria-label="Select account"
      >
        <Button
          variant="outline"
          className={cn("overflow-hidden  gap-2 w-full", isCollapsed && "w-9")}
        >
          <User2 />
          {!isCollapsed && user?.firstName + " " + user?.lastName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
            <Mail />
            {user?.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
