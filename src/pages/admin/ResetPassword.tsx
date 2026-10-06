import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, KeyRound } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";

import { authApi } from "@/services/api";

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

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <div className="card-body space-y-5">
          <h1 className="font-display text-xl font-bold text-ink">
            Reset password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="New password"
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
                  <KeyRound className="size-4" />
                )
              }
            >
              Update password
            </Button>
          </form>
          <Link to="/admin/login" className="text-sm text-accent">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
