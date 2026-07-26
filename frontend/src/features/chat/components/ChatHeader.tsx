import { Avatar, AvatarImage } from "@/src/components/ui/avatar";
import { Typography } from "@/src/components/ui/typography";

export default function ChatHeader() {
  return (
    <header className="flex border-b items-center gap-2 p-2">
      <Avatar>
        <AvatarImage src={"/avatar.png"} />
      </Avatar>
      <div className="flex flex-col">
        <Typography variant="small">Phùng Văn Duy</Typography>

        <Typography
          variant="caption"
          className="flex items-center gap-1.5 mt-0.5"
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Online
        </Typography>
      </div>
    </header>
  );
}
