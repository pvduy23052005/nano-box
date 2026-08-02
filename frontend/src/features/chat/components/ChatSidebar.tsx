import { Search } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Typography } from "@/src/components/ui/typography";

const MOCK_USERS = [
  {
    id: "1",
    name: "Trợ lý AI",
    avatar: "/avatars/02.png",
    lastMessage: "Chào bạn! Mình có thể giúp gì cho bạn hôm nay?",
    time: "10:42 AM",
    unread: 2,
  },
  {
    id: "2",
    name: "Anh Tuấn",
    avatar: "/avatars/03.png",
    lastMessage: "Nhớ check PR trên GitHub giúp anh nhé!",
    time: "09:15 AM",
    unread: 0,
  },
  {
    id: "3",
    name: "Nhóm Frontend Dev",
    avatar: "/avatars/10.png",
    lastMessage: "Duy: Mọi người đã tối ưu phần layout chat xong chưa?",
    time: "Hôm qua",
    unread: 5,
  },
  {
    id: "4",
    name: "Anh A (Code Review)",
    avatar: "/avatars/04.png",
    lastMessage: "Đoạn code clean architecture này nhìn ổn đấy.",
    time: "20/07",
    unread: 0,
  },
];

export default function ChatSidebar() {
  return (
    <>
      <aside className="w-50 md:w-70 border-r flex flex-col h-full bg-background shrink-0">
        <div className="h-12 p-2 border-b flex items-center">
          <InputGroup className="h-7">
            <InputGroupAddon>
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-7 py-0 text-xs"
              placeholder="Tìm kiếm cuộc trò truyện..."
            />
          </InputGroup>
        </div>

        <div className="w-full flex flex-col gap-5 p-2 overflow-auto">
          {MOCK_USERS.map((user) => (
            <div key={user.id} className="flex items-center gap-2 rounded-sm">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col flex-1 gap-2 overflow-hidden">
                <div className="flex justify-between">
                  <Typography variant="small">{user.name}</Typography>
                  <Typography variant="caption">{user.time}</Typography>
                </div>
                <Typography variant="caption" className="truncate">
                  {user.lastMessage}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
