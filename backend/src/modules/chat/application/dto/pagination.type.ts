export interface CursorPagination {
  cursor?: string;
  limit?: number;
  roomId?: string;
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasmore: boolean;
}
