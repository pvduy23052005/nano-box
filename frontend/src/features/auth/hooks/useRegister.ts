import { useMutation } from "@apollo/client/react"
import { REGISTER_MUTATION } from "../services/mutations"
import { RegisterInputDto } from "@/src/types/graphql/graphql";

export const useRegister = () => {
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const register = async (input: RegisterInputDto) => {
    try {
      const { data } = await registerMutation({ variables: { input } });
      return data?.register;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return {
    register,
    isLoading: loading
  }
}