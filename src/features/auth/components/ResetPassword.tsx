import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetSchema, PasswordResetData } from "@/lib/schemas";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function ResetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: token ?? "",
    },
  });

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Redirect if no token is present
  useEffect(() => {
    if (!token) {
      toast.error(t('resetPassword.invalidToken'));
      void navigate("/auth/login");
    }
  }, [token, navigate,t]);

  const onSubmit = async (data: PasswordResetData) => {
    const result = await resetPassword(data.token, data.password);
    if (result.success) {
      toast.success(result.message ?? t('messages.passwordResetSuccess'));
      void navigate("/auth/login");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form 
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="p-6 md:p-8 min-h-[600px] flex flex-col"
          >
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{t('resetPassword.title')}</h1>
                <p className="text-muted-foreground text-balance">
                  {t('resetPassword.subtitle')}
                </p>
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className=" space-y-6">
                <Button 
                  type="submit" 
                  className="w-full hover:cursor-pointer"
                  disabled={isLoading}
                >
                    {isLoading ? t('resetPassword.resetting') : t('resetPassword.resetButton')}
                </Button>

                <div className="text-center text-sm">
                  {t('resetPassword.rememberPassword')}{" "}
                  <Link to="/auth/login" className="underline underline-offset-4">
                    {t('resetPassword.backToLogin')}
                  </Link>
                </div>
              </div>
            </div>
          </form>
          <div className="hidden md:block" /> {/* Placeholder for image */}
        </CardContent>
      </Card>
      
<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
  {t('login.agreementText')}
</div>
    </div>
  );
}