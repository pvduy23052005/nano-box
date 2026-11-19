import { GetRoomDetailQuery } from "@/src/types/graphql/graphql";

export type RoomDetailData = NonNullable<GetRoomDetailQuery["getRoomDetail"]>;
export type RoomDetailMember = NonNullable<RoomDetailData["members"]>[number];
