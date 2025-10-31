import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, User, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { accountApi } from "@/services/account.api";

interface UserSummary  {
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};

interface Props  {
  user: UserSummary;
  onMutate: () => void | Promise<void>;
};

export default function ProfilePictureCard({ user, onMutate }: Props) {
  const { t } = useTranslation(["accountSettings"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const getAvatarDisplay = () => {
    if (user?.avatarUrl) {
      return (
        <img
          src={user.avatarUrl || undefined}
          alt="Avatar"
          className="w-30 h-30 sm:w-20 sm:h-20 rounded-full object-cover"
        />
      );
    }

    const initials = user
      ? (`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
        user.username?.[0]?.toUpperCase() ||
        "U")
      : "U";

    return (
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
        {initials.trim() ? (
          <span className="text-xl font-semibold text-gray-600">{initials}</span>
        ) : (
          <User className="w-8 h-8 text-gray-400" />
        )}
      </div>
    );
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("messages.invalidFileType"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("messages.fileSizeLimit"));
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const response = await accountApi.updateAvatar(file);
      if (response.success) {
        await onMutate();
        toast.success(response.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("messages.avatarUpdateError")
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    try {
      const response = await accountApi.deleteAvatar();
      if (response.success) {
        await onMutate();
        toast.success(response.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("messages.avatarDeleteError")
      toast.error(message);
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sections.profilePicture.title")}</CardTitle>
        <CardDescription>{t("sections.profilePicture.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center flex-col space-y-4 sm:space-y-0 sm:space-x-4 sm:flex-row">
          {getAvatarDisplay()}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <>
                    <LoadingSpinner />
                    {t("buttons.uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("buttons.uploadAvatar")}
                  </>
                )}
              </Button>
              {user?.avatarUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={()=> void handleDeleteAvatar()}
                  disabled={isDeletingAvatar}
                >
                  {isDeletingAvatar ? (
                    <>
                      <LoadingSpinner />
                      {t("buttons.deleting")}
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      {t("buttons.remove")}
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("sections.profilePicture.fileInfo")}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event)=> void handleAvatarUpload(event)}
          />
        </div>
      </CardContent>
    </Card>
  );
}


