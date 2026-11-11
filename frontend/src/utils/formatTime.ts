export const formatMessageTime = (rawDate: unknown): string => {
  if (!rawDate) return "";

  const date =
    rawDate instanceof Date ? rawDate : new Date(rawDate as string | number);
  if (isNaN(date.getTime())) return "";

  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  if (diffDays === 0) {
    return `${hours}:${minutes}`;
  }

  if (diffDays === 1) {
    return "Hôm qua";
  }

  if (diffDays > 1 && diffDays < 7) {
    const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
    return days[date.getDay()];
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  if (date.getFullYear() === now.getFullYear()) {
    return `${day}/${month}`;
  }

  return `${day}/${month}/${date.getFullYear()}`;
};

export const formatNotificationTime = (rawDate: unknown): string => {
  if (!rawDate) return "";

  const date =
    rawDate instanceof Date ? rawDate : new Date(rawDate as string | number);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatMessageTime(date);
};