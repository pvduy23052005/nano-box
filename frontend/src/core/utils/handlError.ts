import { toast } from "sonner";
import { GraphQLFormattedError } from "graphql";
import { ErrorLike } from "@apollo/client";

const SERVER_ERROR_CODE_MAP: Record<string, string> = {
  UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
  FORBIDDEN: "Bạn không có quyền thực hiện hành động này.",
  INTERNAL_SERVER_ERROR: "Hệ thống gặp sự cố. Vui lòng thử lại sau.",
};

export const handleGlobalError = (
  graphQLErrors: ReadonlyArray<GraphQLFormattedError> | undefined,
  networkError: ErrorLike | null | undefined
) => {
  if (typeof window === "undefined") {
    if (graphQLErrors) {
      console.error("[GraphQL Server Error]", graphQLErrors);
    }
    if (networkError) {
      console.error("[Network Server Error]", networkError);
    }
    return;
  }

  console.log(graphQLErrors?.length);
  if (graphQLErrors && graphQLErrors.length > 0) {
    for (const error of graphQLErrors) {
      const errorCode = error.extensions?.code;

      if (typeof errorCode === "string" && SERVER_ERROR_CODE_MAP[errorCode]) {
        if (errorCode === "INTERNAL_SERVER_ERROR" && error.message && error.message.toLowerCase() !== "internal server error") {
          toast.error(error.message);
          return;
        }
        toast.error(SERVER_ERROR_CODE_MAP[errorCode]);
        return;
      }
      console.log(error.message);
      toast.error(error.message || "Đã xảy ra lỗi xử lý dữ liệu.");
      return;
    }
  }

  if (networkError) {
    if (networkError.message?.includes("Failed to fetch")) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng!");
    } else {
      toast.error(`Lỗi hệ thống: ${networkError.message}`);
    }
  }
};