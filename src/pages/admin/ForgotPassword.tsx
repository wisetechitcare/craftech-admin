import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";

import { authApi } from "@/services/api";

import AuthPageShell, {
  authBackLinkClass,
  authPrimaryButtonClass,
} from "./AuthPageShell";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      message =
        response.data?.message ||
        "If an account exists, a reset link has been sent.";
      if (response.data?.success) {
        isError = false;
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

  return (
    <AuthPageShell subtitle="We'll email you a link to reset your password">
      <div className="space-y-5">
        <h1 className="font-display text-xl font-bold text-ink">
          Forgot password
        </h1>
        <p className="text-sm text-ink-mute">
          Enter the email for your account. If it exists, we&apos;ll send reset
          instructions.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Email Address"
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
                <Mail className="size-4" />
              )
            }
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <Link to="/admin/login" className={authBackLinkClass}>
          Back to sign in
        </Link>
      </div>
    </AuthPageShell>
  );
};

export default ForgotPassword;
