import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, UserPlus } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/common/GoogleIcon";

import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";

import AuthPageShell, {
  authBackLinkClass,
  authPrimaryButtonClass,
} from "./AuthPageShell";

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
      <AuthPageShell subtitle="Invitation link required">
        <p className="text-sm text-ink-mute text-center">
          Invalid activation link.
        </p>
      </AuthPageShell>
    );
  }

  if (!meta) {
    return (
      <AuthPageShell subtitle="Checking your invitation">
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-violet-600" />
        </div>
      </AuthPageShell>
    );
  }

  if (!meta.valid) {
    return (
      <AuthPageShell subtitle="This link can no longer be used">
        <div className="space-y-4 text-center">
          <p className="text-sm text-ink-mute">
            This activation link is invalid or has expired.
          </p>
          <Link to="/admin/login" className={authBackLinkClass}>
            Back to sign in
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  const roleLabel =
    meta.role === "SUPER_ADMIN" ? "Platform admin" : "Tenant admin";

  return (
    <AuthPageShell subtitle="Finish setting up your KAIZNOVA admin access">
      <div className="space-y-5">
        <h1 className="font-display text-xl font-bold text-ink">
          Activate account
        </h1>
        <p className="text-sm text-ink-mute">
          {roleLabel} invite for{" "}
          <span className="font-medium text-ink">{meta.email}</span>
        </p>
        <form onSubmit={acceptPassword} className="space-y-5">
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="none"
            className={authPrimaryButtonClass}
            disabled={loading}
            startIcon={
              loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )
            }
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <span className="text-sm uppercase tracking-widest text-ink-mute">
            or
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <a
          href={authApi.googleAcceptUrl(token)}
          className="btn-ghost w-full justify-center py-2.5"
        >
          <GoogleIcon className="size-5 shrink-0" />
          Continue with Google
        </a>

        <Link to="/admin/login" className={authBackLinkClass}>
          Already have an account? Sign in
        </Link>
      </div>
    </AuthPageShell>
  );
};

export default AcceptInvite;
