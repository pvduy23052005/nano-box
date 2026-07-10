import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

interface CustomGraphQLExtensions {
  errors?: Record<string, string>;
}

export const handleFormError = <TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): boolean => {
  if (!error) return false;

  let hasFormErrors = false;

  if (CombinedGraphQLErrors.is(error)) {
    if (error.errors && error.errors.length > 0) {
      for (const gqlErr of error.errors) {
        const extensions = gqlErr.extensions as CustomGraphQLExtensions | undefined;

        if (extensions?.errors && typeof extensions.errors === "object") {
          const validationErrors = extensions.errors;
          for (const key of Object.keys(validationErrors)) {
            setError(key as Path<TFieldValues>, {
              type: "server",
              message: validationErrors[key],
            });
            hasFormErrors = true;
          }
        }
      }
    }
  }

  return hasFormErrors;
};
