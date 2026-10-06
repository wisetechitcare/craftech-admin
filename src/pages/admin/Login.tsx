import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

// ponytail: demo creds inline — move to VITE_ env vars if the demo login outlives dev
const DEMO = { email: "wisetechit.care@gmail.com", password: "WiseTech@00" };

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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
            <span className="text-lg font-bold text-white tracking-wider">
              CE
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Craftech Admin
          </h1>
          <p className="text-ink-mute text-sm mt-1.5">
            Sign in to manage your website
          </p>
        </div>

        <div className="card">
          <div className="card-body">
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
                <Link to="/forgot-password" className="text-xs text-accent">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full justify-center"
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

              <a
                href={authApi.googleLoginUrl()}
                className="btn-ghost w-full justify-center py-2.5"
              >
                Continue with Google
              </a>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={() => signIn(DEMO.email, DEMO.password)}
                disabled={loading}
              >
                Demo Login
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-ink-mute mt-6">
          Craftech Engineers Admin Panel &mdash; Authorized Access Only
        </p>
      </div>
    </div>
  );
};

export default Login;
