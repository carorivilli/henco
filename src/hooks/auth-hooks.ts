import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

const { signIn, signOut, signUp } = authClient;

export const useSession = authClient.useSession;

export const useSignIn = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await signIn.email(credentials);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  return {
    signIn: mutate,
    ...rest,
  };
};

export const useSignOut = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: async () => {
      const result = await signOut();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  return {
    signOut: mutate,
    ...rest,
  };
};

export const useSignUp = () => {
  const { mutate, ...rest } = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      name: string;
    }) => {
      const result = await signUp.email(userData);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  return {
    signUp: mutate,
    ...rest,
  };
};
