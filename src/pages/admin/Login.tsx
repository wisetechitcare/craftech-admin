import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/common/GoogleIcon";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

import AuthPageShell, {
  authBackLinkClass,
  authPrimaryButtonClass,
} from "./AuthPageShell";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const signIn = async (email: string, password: string) => {
    let message = "Invalid credentials";
    let isError = true;
    setLoading(true);

    try {
      await login(email, password);
      message = "Welcome back!";
      isError = false;
      navigate("/admin");
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) toast.error(message);
      else toast.success(message);
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    signIn(form.email, form.password);
  };

  return (
    <AuthPageShell subtitle="Sign in to manage your website">
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Email Address"
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />

        <InputField
          label="Password"
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className={authBackLinkClass}>
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="none"
          className={authPrimaryButtonClass}
          disabled={loading}
          startIcon={
            loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )
          }
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm uppercase tracking-widest text-ink-mute">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <a
          href={authApi.googleLoginUrl()}
          className="btn-ghost w-full justify-center py-2.5"
        >
          <GoogleIcon className="size-5 shrink-0" />
          Continue with Google
        </a>
      </form>
    </AuthPageShell>
  );
};

export default Login;
