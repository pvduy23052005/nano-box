import { useMutation } from "@apollo/client/react"
import { LOGIN_MUTATION, LOGIN_GOOGLE_MUTATION } from "../services/mutations";
import { LoginInputDto } from "@/src/types/graphql/graphql";

export const useLogin = () => {
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);
  const [loginGoogleMutation, { loading: isGoogleLoading }] = useMutation(LOGIN_GOOGLE_MUTATION);

  const login = async (input: LoginInputDto) => {
    const { data } = await loginMutation({ variables: { input } });
    return data?.login;
  };

  const loginWithGoogle = async (idToken: string) => {
    const { data } = await loginGoogleMutation({ variables: { idToken } });
    return data?.loginGoogle;
  };

  return {
    login,
    loginWithGoogle,
    isLoading: loading || isGoogleLoading
  }
}
