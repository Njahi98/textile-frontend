import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormData } from "@/lib/schemas"
import { useAuthStore } from "@/stores/auth.store"
import { useEffect } from "react"
import { toast } from "sonner"
import GoogleLoginButton from "@/components/GoogleLoginButton"

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Clear error when component unmounts or form resets
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data);
    if (result.success) {
      toast.success('Registration successful!');
      void navigate('/dashboard');
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="hidden md:block" /> {/* Placeholder for image */}
          <form 
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="p-6 md:p-8 min-h-[600px] flex flex-col"
          >
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your details to get started
                </p>
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  {...register("username")}
                  id="username"
                  type="text"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
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

              <div className="mt-auto space-y-6">
                <Button 
                  type="submit" 
                  className="w-full hover:cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>

                <div className="grid-cols-3 gap-4 flex place-items-center">
                  <GoogleLoginButton 
                    text="Sign up with Google"
                    disabled={isLoading}
                    onSuccess={() => void navigate('/dashboard')}
                  />
                </div>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
