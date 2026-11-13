import { User } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";

export interface GroupAvatarProps {
  avatars?: (string | null | undefined)[] | null;
  singleAvatar?: string | null;
  title?: string | null;
  size?: "sm" | "md";
  className?: string;
}

const slotColors = [
  "bg-primary/15 text-primary",
  "bg-secondary text-secondary-foreground",
  "bg-muted text-muted-foreground",
];

export function GroupAvatar({
  avatars,
  singleAvatar,
  title,
  size = "md",
  className,
}: GroupAvatarProps) {
  const hasCustomSingleAvatar =
    Boolean(singleAvatar) && singleAvatar !== "/images/default-avatar.webp";

  if (hasCustomSingleAvatar && singleAvatar) {
    const initials = title ? title.slice(0, 2).toUpperCase() : "GR";
    return (
      <Avatar
        className={cn(
          "rounded-full after:hidden",
          size === "md" ? "size-11" : "size-8",
          className,
        )}
      >
        <AvatarImage
          src={singleAvatar}
          alt={title || "Group avatar"}
          className="rounded-full object-cover"
        />
        <AvatarFallback className="rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  const validAvatars = (avatars || []).filter((url): url is string =>
    Boolean(url && url.trim() !== "" && url !== "/images/default-avatar.webp"),
  );

  const slotPositions = [
    size === "md"
      ? "top-0.5 left-1/2 -translate-x-1/2"
      : "top-0 left-1/2 -translate-x-1/2",
    size === "md" ? "bottom-0.5 left-0.5" : "bottom-0 left-0",
    size === "md" ? "bottom-0.5 right-0.5" : "bottom-0 right-0",
  ];

  return (
    <div
      role="img"
      aria-label={title || "Ảnh nhóm"}
      className={cn(
        "relative shrink-0 rounded-full select-none",
        size === "md" ? "size-11" : "size-8",
        className,
      )}
    >
      {[0, 1, 2].map((index) => {
        const avatarSrc = validAvatars[index];
        return (
          <div
            key={index}
            className={cn(
              "absolute size-[52%] rounded-full overflow-hidden flex items-center justify-center shadow-xs",
              size === "md"
                ? "ring-[1.5px] ring-background"
                : "ring-1 ring-background",
              slotPositions[index],
            )}
          >
            <Avatar className="size-full rounded-full after:hidden">
              {avatarSrc && (
                <AvatarImage
                  src={avatarSrc}
                  alt={`Thành viên ${index + 1}`}
                  className="object-cover size-full"
                />
              )}
              <AvatarFallback
                className={cn(
                  "flex items-center justify-center size-full",
                  size === "md" ? "[&_svg]:size-2.5" : "[&_svg]:size-2",
                  slotColors[index],
                )}
              >
                <User />
              </AvatarFallback>
            </Avatar>
          </div>
        );
      })}
    </div>
  );
}
