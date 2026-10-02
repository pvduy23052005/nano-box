import { toast } from "sonner";
import { GraphQLFormattedError } from "graphql";
import { ErrorLike } from "@apollo/client";

const SERVER_ERROR_CODE_MAP: Record<string, string> = {
  UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
  FORBIDDEN: "Bạn không có quyền thực hiện hành động này.",
  INTERNAL_SERVER_ERROR: "Hệ thống gặp sự cố. Vui lòng thử lại sau.",
};

interface CustomGraphQLExtensions {
  code?: string;
  statusCode?: number;
  errors?: Record<string, string>;
}

export const handleGlobalError = (
  graphQLErrors: ReadonlyArray<GraphQLFormattedError> | undefined,
  networkError: ErrorLike | null | undefined
) => {
  if (typeof window === "undefined") {
    if (graphQLErrors) console.error("[GraphQL Server Error]", graphQLErrors);
    if (networkError) console.error("[Network Server Error]", networkError);
    return;
  }

  if (graphQLErrors && graphQLErrors.length > 0) {
    for (const error of graphQLErrors) {
      const extensions = error.extensions as CustomGraphQLExtensions | undefined;
      const errorCode = extensions?.code;

      if (extensions?.errors && Object.keys(extensions.errors).length > 0) {
        continue;
      }

      if (typeof errorCode === "string" && SERVER_ERROR_CODE_MAP[errorCode]) {
        if (errorCode === "INTERNAL_SERVER_ERROR" && error.message && error.message.toLowerCase() !== "internal server error") {
          toast.error(error.message);
          return;
        }
        toast.error(SERVER_ERROR_CODE_MAP[errorCode]);
        return;
      }

      toast.error(error.message || "Đã xảy ra lỗi xử lý dữ liệu.");
      return;
    }
  }

  if (networkError) {
    const errMsg = networkError.message || "";
    if (
      errMsg.includes("Failed to fetch") ||
      errMsg.includes("NetworkError") ||
      errMsg.includes("attempting to fetch resource")
    ) {
      // toast.error("Đang bảo trì hệ thống");
      console.error("[Network Server Error]", errMsg);
    } else {
      toast.error(`Lỗi hệ thống: ${errMsg}`);
    }
  }
};
