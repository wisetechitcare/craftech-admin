import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { KeyRound, Loader2 } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";

import { authApi } from "@/services/api";

import AuthPageShell, {
  authBackLinkClass,
  authPrimaryButtonClass,
} from "./AuthPageShell";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    let message = "Something went wrong. Please try again.";
    let isError = true;
    setLoading(true);

    try {
      const response = await authApi.resetPassword(token, password);
      message = response.data?.message || "Password reset successfully";
      if (response.data?.success) {
        isError = false;
        navigate("/admin/login");
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
      <AuthPageShell subtitle="This reset link is not valid">
        <div className="space-y-4 text-center">
          <p className="text-sm text-ink-mute">
            The link is missing a token. Request a new reset email and try
            again.
          </p>
          <Link to="/forgot-password" className={authBackLinkClass}>
            Request reset link
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell subtitle="Choose a new password for your account">
      <div className="space-y-5">
        <h1 className="font-display text-xl font-bold text-ink">
          Set new password
        </h1>
        <p className="text-sm text-ink-mute">
          Use at least 8 characters. You&apos;ll sign in with this password
          next.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="New password"
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
                <KeyRound className="size-4" />
              )
            }
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
        <Link to="/admin/login" className={authBackLinkClass}>
          Back to sign in
        </Link>
      </div>
    </AuthPageShell>
  );
};

export default ResetPassword;
