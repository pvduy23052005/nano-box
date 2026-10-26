export interface ShouldFetchOlderMessagesParams {
  isInitialScrollDone: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchingLocked: boolean;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  firstVisibleIndex: number;
  topThreshold?: number;
}

export interface ShouldAutoScrollOnNewMessageParams {
  isNewMessageAppended: boolean;
  isNearBottom: boolean;
  isMessageFromMe: boolean;
}

export function shouldFetchOlderMessages({
  isInitialScrollDone,
  hasNextPage,
  isFetchingNextPage,
  isFetchingLocked,
  scrollTop,
  scrollHeight,
  clientHeight,
  firstVisibleIndex,
  topThreshold = 120,
}: ShouldFetchOlderMessagesParams): boolean {
  if (!isInitialScrollDone) return false;
  if (!hasNextPage) return false;
  if (isFetchingNextPage || isFetchingLocked) return false;
  if (firstVisibleIndex > 1) return false;

  const hasScrollableOverflow = scrollHeight > clientHeight;
  if (hasScrollableOverflow) {
    return scrollTop <= topThreshold;
  }

  return true;
}

export interface CalculateScrollCompensationParams {
  newScrollHeight: number;
  prevScrollHeight: number;
  prevScrollTop: number;
}

export function calculateScrollCompensation({
  newScrollHeight,
  prevScrollHeight,
  prevScrollTop,
}: CalculateScrollCompensationParams): number | null {
  if (prevScrollHeight <= 0) return null;

  const heightDiff = newScrollHeight - prevScrollHeight;
  if (heightDiff > 0) {
    return prevScrollTop + heightDiff;
  }

  return null;
}


export function shouldAutoScrollOnNewMessage({
  isNewMessageAppended,
  isNearBottom,
  isMessageFromMe,
}: ShouldAutoScrollOnNewMessageParams): boolean {
  if (!isNewMessageAppended) return false;
  return isNearBottom || isMessageFromMe;
}
