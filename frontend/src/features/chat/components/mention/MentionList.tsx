"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";

export interface MentionSuggestionItem {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string | null;
}

export interface MentionListProps {
  items: MentionSuggestionItem[];
  command: (item: { id: string; label: string }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command({ id: item.id, label: item.name });
      }
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }): boolean => {
        if (!items.length) {
          return false;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="z-50 min-w-48 overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-md">
          <p className="text-center text-xs text-muted-foreground">
            Không tìm thấy thành viên
          </p>
        </div>
      );
    }

    return (
      <div className="z-50 min-w-56 max-h-70 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
        {items.map((item, index) => {
          const initials = item.name.trim().slice(0, 2).toUpperCase();
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "relative flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs outline-none transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground font-medium"
                  : "hover:bg-muted/60 text-foreground",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(index);
              }}
              onClick={() => selectItem(index)}
            >
              <Avatar className="size-6 shrink-0 rounded-full after:hidden">
                {item.avatar ? (
                  <AvatarImage
                    src={item.avatar}
                    alt={item.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 items-center justify-between min-w-0">
                <span className="truncate">{item.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  },
);

MentionList.displayName = "MentionList";

export default MentionList;
