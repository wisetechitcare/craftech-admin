import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { Button } from "@/components/ui/button";

import { authApi } from "@/services/api";

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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <div className="card-body space-y-5">
          <h1 className="font-display text-xl font-bold text-ink">
            Forgot password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              className="w-full justify-center"
              disabled={loading}
              startIcon={
                loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )
              }
            >
              Send reset link
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

export default ForgotPassword;
