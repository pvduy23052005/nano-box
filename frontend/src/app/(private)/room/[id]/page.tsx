"use client";

import { useParams } from "next/navigation";
import RoomDetailView from "@/src/features/room/components/RoomDetail";

export default function RoomPage() {
  const params = useParams<{ id: string }>();
  const roomId = params?.id || "";

  return <RoomDetailView roomId={roomId} />;
}
