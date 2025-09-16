import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData, PasswordResetRequestData, passwordResetRequestSchema } from "@/lib/schemas";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, useState } from "react";
import { toast } from "sonner"; 
import GoogleLoginButton from '@/components/GoogleLoginButton';


export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, requestPasswordReset } = useAuthStore();
  const [passwordReset, setPasswordReset] = useState(false);
  
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const passwordResetForm = useForm<PasswordResetRequestData>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts or form resets
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Login successful!');
      void navigate('/dashboard');
    }
  };

  const onPasswordReset = async (data: PasswordResetRequestData) => {
    try {
       await requestPasswordReset(data.email);
      toast.success('If an account exists with this email, you will receive a password reset link');
      setPasswordReset(false);
      passwordResetForm.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    }
    
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void passwordResetForm.handleSubmit(onPasswordReset)(e);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loginForm.handleSubmit(onSubmit)(e);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          {passwordReset ? (
            <form 
              onSubmit={handlePasswordResetSubmit}
              className="p-6 md:p-8 min-h-[600px] flex flex-col"
            >
              <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Forgot Password</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter your registered email and we will send you a link to reset your password.
                  </p>
                </div>

                <div className="grid gap-5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    {...passwordResetForm.register("email")}
                    id="reset-email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                  />
                  {passwordResetForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{passwordResetForm.formState.errors.email.message}</p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full hover:cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Requesting...' : 'Request Reset Link'}
                  </Button>
                  <div className="text-center text-sm">
                    <p onClick={() => setPasswordReset(false)} className="hover:underline cursor-pointer">
                      Try a different login method
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form 
              onSubmit={handleLoginSubmit}
              className="p-6 md:p-8 min-h-[600px] flex flex-col"
            >
              <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...loginForm.register("email")}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <p
                      onClick={() => setPasswordReset(true)}
                      className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer"
                    >
                      Forgot your password?
                    </p>
                  </div>
                  <Input 
                    {...loginForm.register("password")}
                    id="password" 
                    type="password" 
                    disabled={isLoading}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-6">
                  <Button 
                    type="submit" 
                    className="w-full hover:cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>

                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>

                  <div className="grid-cols-3 gap-4 flex place-items-center">
                    <GoogleLoginButton 
                      text="Login with Google"
                      disabled={isLoading}
                      onSuccess={() => void navigate('/dashboard')}
                    />
                  </div>

                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/auth/register" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          )}
         

          <div className="hidden md:block" /> {/* Placeholder for image */}
        </CardContent>
      </Card>
      
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}