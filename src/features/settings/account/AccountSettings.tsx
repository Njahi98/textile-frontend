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
import { useState, useRef } from "react";
import { accountApi } from "@/services/account.api";
import { Trash2, Save, Upload, User, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import useSWR from "swr";
import React from "react";

const updateAccountSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
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

  // Fetch account settings using SWR
  const { data: accountData, error, isLoading, mutate: mutateAccount } = useSWR(
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

  // Reset form when user data loads
  React.useEffect(() => {
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
      toast.info("Please make some changes before saving.");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {};
      if (data.email && data.email !== user?.email) updateData.email = data.email;
      if (data.username && data.username !== user?.username) updateData.username = data.username;
      if (data.firstName !== user?.firstName) updateData.firstName = data.firstName || null;
      if (data.lastName !== user?.lastName) updateData.lastName = data.lastName || null;
      if (data.phone !== user?.phone) updateData.phone = data.phone || null;
      if (data.password) updateData.password = data.password;

      if (Object.keys(updateData).length === 0) {
        toast.info("Please make some changes before saving.");
        return;
      }

      await accountApi.updateAccount(updateData);
      await mutateAccount();
      
      toast.success("Account updated successfully");

      reset({ ...data, password: '' });
    } catch (error: any) {
      toast.error("Error updating account");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await accountApi.updateAvatar(file);
      await mutateAccount(); // Refresh the account data
      toast.success("Avatar updated successfully");
    } catch (error: any) {
      toast.error("Error uploading avatar");
    } finally {
      setIsUploadingAvatar(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    try {
      await accountApi.deleteAvatar();
      await mutateAccount(); // Refresh the account data
      toast.success("Avatar deleted successfully");
    } catch (error: any) {
      toast.error("Error deleting avatar");
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await accountApi.deleteAccount();
      
      toast.success("Account deleted successfully");

      logout();
    } catch (error: any) {
      toast.error("Error deleting account");
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
          className="w-20 h-20 rounded-full object-cover"
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
              <p className="text-destructive">Error loading account settings</p>
              <Button 
                onClick={() => mutateAccount()} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
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
              <p>No account data available</p>
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
          <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload or update your profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {getAvatarDisplay()}
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <LoadingSpinner />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Avatar
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
                          Deleting...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 10MB.
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
            <CardTitle>Current Account Information</CardTitle>
            <CardDescription>
              View your current account details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Username</Label>
                <p className="text-sm text-muted-foreground">{user?.username}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <p className="text-sm text-muted-foreground">{user?.status}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">First Name</Label>
                <p className="text-sm text-muted-foreground">{user?.firstName ?? 'Not set'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Name</Label>
                <p className="text-sm text-muted-foreground">{user?.lastName ?? 'Not set'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-muted-foreground">{user?.phone ?? 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Account</CardTitle>
            <CardDescription>
              Make changes to your account information here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder="Leave empty to keep current password"
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <LoadingSpinner/>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all of your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
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