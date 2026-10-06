import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, UserPlus } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

interface ActivateMeta {
  valid?: boolean;
  email?: string;
  role?: string;
}

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [meta, setMeta] = useState<ActivateMeta | null>(null);
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!token) return;
    authApi
      .getInviteMetadata(token)
      .then((res) => setMeta(res.data.data))
      .catch(() => setMeta({ valid: false }));
  }, [token]);

  const acceptPassword = async (e: FormEvent) => {
    e.preventDefault();
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setLoading(true);

    try {
      const response = await authApi.acceptInvite({
        token,
        password,
        name: name || undefined,
      });
      message = response.data?.message || "Welcome! Your account is ready.";
      if (response.data?.success) {
        isError = false;
        await refreshMe();
        navigate("/admin");
      }
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

  if (!token) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <p className="text-ink-mute">Invalid activation link.</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!meta.valid) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <p className="text-ink-mute">
          This activation link is invalid or has expired.
        </p>
      </div>
    );
  }

  const roleLabel =
    meta.role === "SUPER_ADMIN" ? "Platform admin" : "Tenant admin";

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <div className="card-body space-y-5">
          <h1 className="font-display text-xl font-bold text-ink">
            Activate account
          </h1>
          <p className="text-sm text-ink-mute">
            {roleLabel} invite for{" "}
            <span className="text-ink">{meta.email}</span>
          </p>
          <form onSubmit={acceptPassword} className="space-y-4">
            <InputField
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
            />
            <InputField
              label="Password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              className="w-full justify-center"
              disabled={loading}
              startIcon={
                loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )
              }
            >
              Create account
            </Button>
          </form>
          <a
            href={authApi.googleAcceptUrl(token)}
            className="btn-ghost w-full justify-center"
          >
            Continue with Google
          </a>
          <Link to="/admin/login" className="text-sm text-accent">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
