import { Typography } from "@/src/components/ui/typography";

interface RoomErrorProps {
  message?: string;
}

export default function RoomError({
  message = "Không thể tải danh sách phòng chat",
}: RoomErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
      <Typography variant="caption">{message}</Typography>
    </div>
  );
}

export { RoomError };
