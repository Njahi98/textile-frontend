import { Main } from "@/components/layout/main";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { accountApi } from "@/services/account.api";
import { Trash2, Save, Upload, User, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import useSWR from "swr";
import React from "react";
import { passwordSchema } from "@/lib/schemas";
import { useTranslation } from "react-i18next";
const updateAccountSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase().optional().or(z.literal('')),
  password: passwordSchema.optional().or(z.literal("")),
  username: z.string().min(1, 'Username is required').trim().optional().or(z.literal('')),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

export default function AccountSettings() {
  const { logout } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation(['accountSettings']);
  const { data: accountData, error, isLoading, mutate: mutateAccount, } = useSWR(
    '/api/settings/account',
    () => accountApi.getAccountSettings()
  );

  const user = accountData?.user;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      email: user?.email ?? '',
      username: user?.username ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email ?? '',
        username: user.username ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        password: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateAccountFormData) => {
    if (!isDirty) {
      toast.info(t('messages.noChanges'));
      return;
    }
    interface updateDataProps{
      email?: string;
      username?: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      password?: string;
    }

    setIsUpdating(true);
    try {
      const updateData:updateDataProps = {};
      if (data.email && data.email !== user?.email) updateData.email = data.email;
      if (data.username && data.username !== user?.username) updateData.username = data.username;
      if (data.firstName !== user?.firstName) updateData.firstName = data.firstName || null;
      if (data.lastName !== user?.lastName) updateData.lastName = data.lastName || null;
      if (data.phone !== user?.phone) updateData.phone = data.phone || null;
      if (data.password) updateData.password = data.password;

      if (Object.keys(updateData).length === 0) {
        toast.info(t('messages.noChanges'));
        return;
      }

      const response = await accountApi.updateAccount(updateData);
      if(response.success){
        await mutateAccount();
        toast.success(response.message);
      }
      reset({ ...data, password: '' });
    } catch (error: any) {      
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('messages.invalidFileType'));
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('messages.fileSizeLimit'));
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const response = await accountApi.updateAvatar(file);
      if(response.success){
        await mutateAccount();
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || t('messages.avatarUpdateError'));
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    try {
      const response = await accountApi.deleteAvatar();
      if(response.success){
        await mutateAccount(); 
        toast.success(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || t('messages.avatarDeleteError'));
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await accountApi.deleteAccount();
      if(response.success){
        toast.success(response.message);
      }
      setTimeout(() => {
        logout();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || t('messages.accountDeleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getAvatarDisplay = () => {
    if (user?.avatarUrl) {
      return (
        <img 
          src={user.avatarUrl} 
          alt="Avatar" 
          className="w-30 h-30 sm:w-20 sm:h-20 rounded-full object-cover"
        />
      );
    }
    
    // Default avatar with user initials or icon
    const initials = user ? 
      `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 
      user.username?.[0]?.toUpperCase() || 'U' 
      : 'U';
    
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

  // Handle loading and error states
  if (isLoading) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Main>
    );
  }

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{t('messages.loadingError')}</p>
              <Button 
                onClick={() => mutateAccount()} 
                variant="outline" 
                className="mt-4"
              >
                {t('buttons.tryAgain')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Main>
    );
  }

  if (!user) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6">
              <p>{t('messages.noAccountData')}</p>
            </CardContent>
          </Card>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <div className="mb-6 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('pageTitle')}</h2>
            <p className="text-muted-foreground">
              {t('pageDescription')}
            </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('sections.profilePicture.title')}</CardTitle>
            <CardDescription>
              {t('sections.profilePicture.description')}
            </CardDescription>
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
                        {t('buttons.uploading')}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                          {t('buttons.uploadAvatar')}
                      </>
                    )}
                  </Button>
                  {user?.avatarUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar}
                    >
                      {isDeletingAvatar ? (
                        <>
                          <LoadingSpinner />
                          {t('buttons.deleting')}
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                            {t('buttons.remove')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('sections.profilePicture.fileInfo')}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.currentAccount.title')}</CardTitle>
            <CardDescription>
              {t('sections.currentAccount.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">{t('fields.username')}</Label>
                <p className="text-sm text-muted-foreground">{user?.username}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('fields.email')}</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('fields.role')}</Label>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('fields.status')}</Label>
                <p className="text-sm text-muted-foreground">{user?.status}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('fields.firstName')}</Label>
                <p className="text-sm text-muted-foreground">{user?.firstName ?? t('common.notSet')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('fields.lastName')}</Label>
                <p className="text-sm text-muted-foreground">{user?.lastName ?? t('common.notSet')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('fields.phone')}</Label>
                <p className="text-sm text-muted-foreground">{user?.phone ?? t('common.notSet')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sections.updateAccount.title')}</CardTitle>
            <CardDescription>
              {t('sections.updateAccount.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('fields.username')}</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder={t('placeholders.username')}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('fields.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder={t('placeholders.email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('fields.firstName')}</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder={t('placeholders.firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('fields.lastName')}</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder={t('placeholders.lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('fields.phone')}</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder={t('placeholders.phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('fields.newPassword')}</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder={t('placeholders.password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isUpdating || !isDirty}>
                {isUpdating ? (
                  <>
                    <LoadingSpinner/>
                    {t('buttons.updating')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('buttons.saveChanges')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t('sections.dangerZone.title')}</CardTitle>
          <CardDescription>
            {t('sections.dangerZone.description')}
          </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <LoadingSpinner/>
                      {t('buttons.deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('buttons.deleteAccount')}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('dialogs.deleteConfirm.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('dialogs.deleteConfirm.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('dialogs.deleteConfirm.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </Main>
  );
}