"use client";

import { useParams } from "next/navigation";
import RoomDetail from "@/src/features/room/components/RoomDetail";

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const roomId = params?.id || "";

  return <RoomDetail roomId={roomId} />;
}
