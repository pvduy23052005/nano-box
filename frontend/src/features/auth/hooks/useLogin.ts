import { useMutation } from "@apollo/client/react"
import { LOGIN_MUTATION } from "../services/mutations";
import { LoginInputDto } from "@/src/types/graphql/graphql";

export const useLogin = () => {
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const login = async (input: LoginInputDto) => {
    const { data } = await loginMutation({ variables: { input } });
    return data?.login;
  };

  return {
    login,
    isLoading: loading
  }
}