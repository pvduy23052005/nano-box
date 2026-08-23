export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasmore: boolean;
}
