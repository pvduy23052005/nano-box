import { Typography } from "@/src/components/ui/typography";

interface RoomEmptyStateProps {
  message: string;
}

export default function RoomEmptyState({ message }: RoomEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
      <Typography variant="small">{message}</Typography>
    </div>
  );
}

export { RoomEmptyState };
