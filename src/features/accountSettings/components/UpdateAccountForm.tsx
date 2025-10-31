import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Save } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { accountApi } from "@/services/account.api";
import { passwordSchema } from "@/lib/schemas";

interface UserDetails  {
  email?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
};

interface Props  {
  user: UserDetails;
  onMutate: () => Promise<void> | void;
};

const updateAccountSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase().optional().or(z.literal("")),
  password: passwordSchema.optional().or(z.literal("")),
  username: z.string().min(1, "Username is required").trim().optional().or(z.literal("")),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

export default function UpdateAccountForm({ user, onMutate }: Props) {
  const { t } = useTranslation(["accountSettings"]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      email: user?.email ?? "",
      username: user?.username ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email ?? "",
        username: user.username ?? "",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        password: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateAccountFormData) => {
    if (!isDirty) {
      toast.info(t("messages.noChanges"));
      return;
    }
    setIsUpdating(true);
    try {
      const updateData: {
        email?: string;
        username?: string;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        password?: string;
      } = {};

      if (data.email && data.email !== user?.email) updateData.email = data.email;
      if (data.username && data.username !== user?.username) updateData.username = data.username;
      if (data.firstName !== user?.firstName) updateData.firstName = data.firstName || null;
      if (data.lastName !== user?.lastName) updateData.lastName = data.lastName || null;
      if (data.phone !== user?.phone) updateData.phone = data.phone || null;
      if (data.password) updateData.password = data.password;

      if (Object.keys(updateData).length === 0) {
        toast.info(t("messages.noChanges"));
        return;
      }

      const response = await accountApi.updateAccount(updateData);
      if (response.success) {
        await onMutate();
        toast.success(response.message);
      }
      reset({ ...data, password: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("unknownError");
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sections.updateAccount.title")}</CardTitle>
        <CardDescription>{t("sections.updateAccount.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {/*this is a false positive, React Hook Form's handleSubmit returns a function that: Prevents default automatically, Validates the form,
        Calls onSubmit with validated data, Returns void (not Promise) so we just ignore the ESLint Error */}

        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("fields.username")}</Label>
              <Input id="username" {...register("username")} placeholder={t("placeholders.username")} />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("fields.email")}</Label>
              <Input id="email" type="email" {...register("email")} placeholder={t("placeholders.email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("fields.firstName")}</Label>
              <Input id="firstName" {...register("firstName")} placeholder={t("placeholders.firstName")} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("fields.lastName")}</Label>
              <Input id="lastName" {...register("lastName")} placeholder={t("placeholders.lastName")} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("fields.phone")}</Label>
              <Input id="phone" {...register("phone")} placeholder={t("placeholders.phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("fields.newPassword")}</Label>
              <Input id="password" type="password" {...register("password")} placeholder={t("placeholders.password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </div>
          <Button type="submit" disabled={isUpdating || !isDirty}>
            {isUpdating ? (
              <>
                <LoadingSpinner />
                {t("buttons.updating")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("buttons.saveChanges")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


