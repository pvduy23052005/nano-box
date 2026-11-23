import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { UPDATE_PROFILE_MUTATION } from "../mutations/user.mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { uploadFile } from "@/src/services/upload.service";

export interface UpdateProfileParams {
  name: string;
  avatarFile?: File | null;
  avatarUrl?: string;
}

export const useUpdateProfile = () => {
  const [updateProfileMutation, { loading: isMutating }] = useMutation(
    UPDATE_PROFILE_MUTATION
  );
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const updateProfile = async ({
    name,
    avatarFile,
    avatarUrl,
  }: UpdateProfileParams) => {
    try {
      let finalAvatar = avatarUrl ?? user?.avatar;

      if (avatarFile) {
        setIsUploading(true);
        const uploadRes = await uploadFile(avatarFile, "avatars");
        finalAvatar = uploadRes.url;
      }

      const response = await updateProfileMutation({
        variables: {
          input: {
            name: name.trim(),
            avatar: finalAvatar,
          },
        },
      });

      const updatedData = response.data?.updateProfile;
      if (updatedData?.success && updatedData.data) {
        setUser({
          id: updatedData.data.id,
          name: updatedData.data.name,
          email: updatedData.data.email,
          avatar: updatedData.data.avatar,
        });
        toast.success(updatedData.message || "Cập nhật thông tin thành công");
        return updatedData.data;
      } else {
        throw new Error(updatedData?.message || "Cập nhật thất bại");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi cập nhật thông tin";
      toast.error(message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    updateProfile,
    loading: isMutating || isUploading,
    isUploading,
    isMutating,
  };
};
