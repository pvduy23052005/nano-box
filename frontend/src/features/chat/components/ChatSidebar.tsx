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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";

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
        <Tabs
          defaultValue="friends"
          className="w-full flex-1 flex flex-col min-h-0"
        >
          <div className="p-2 border-b flex flex-col gap-2">
            <InputGroup className="h-7">
              <InputGroupAddon>
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-6 py-0 text-xs"
                placeholder="Tìm kiếm cuộc trò truyện..."
              />
            </InputGroup>

            <TabsList variant="line" className="grid w-full grid-cols-2">
              <TabsTrigger value="friends" className="text-xs py-1">
                Bạn bè
              </TabsTrigger>
              <TabsTrigger value="strangers" className="text-xs py-1">
                Người lạ
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="friends"
            className="w-full flex flex-col gap-5 p-2 overflow-auto flex-1 mt-0"
          >
            {MOCK_USERS.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 rounded-sm cursor-pointer hover:bg-muted/50 p-1"
              >
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col flex-1 gap-2 overflow-hidden">
                  <div className="flex justify-between">
                    <Typography variant="small" className="truncate">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" className="shrink-0">
                      {user.time}
                    </Typography>
                  </div>
                  <Typography
                    variant="caption"
                    className="truncate text-muted-foreground"
                  >
                    {user.lastMessage}
                  </Typography>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent
            value="strangers"
            className="w-full flex flex-col gap-5 p-2 overflow-auto flex-1 mt-0"
          >
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <Typography variant="small">
                Không có tin nhắn từ người lạ
              </Typography>
            </div>
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
