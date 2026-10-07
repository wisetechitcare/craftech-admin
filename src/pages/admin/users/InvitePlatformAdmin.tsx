import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Mail, Send, Shield } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import AdminInfoCallout from "@/components/common/AdminInfoCallout";
import { Button } from "@/components/ui/button";

import { usersApi } from "@/services/api";

import { InviteTipsPanel, UsersInviteHeader } from "./InvitePageChrome";
import SuperAdminGate from "./SuperAdminGate";

interface UserFields {
  fullName: string;
  email: string;
  phone: string;
}

const emptyUser = (): UserFields => ({ fullName: "", email: "", phone: "" });

function patchUserField(
  set: Dispatch<SetStateAction<UserFields>>,
  field: keyof UserFields,
) {
  return (e: ChangeEvent<HTMLInputElement>) =>
    set((prev) => ({ ...prev, [field]: e.target.value }));
}

export default function InvitePlatformAdmin() {
  const [platformUser, setPlatformUser] = useState<UserFields>(emptyUser);
  const [loading, setLoading] = useState<boolean>(false);

  const sendPlatform = async (e: FormEvent) => {
    e.preventDefault();
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setLoading(true);

    try {
      const response = await usersApi.invitePlatform(platformUser);
      message = response.data?.message || message;
      if (response.data?.success) {
        isError = false;
        setPlatformUser(emptyUser());
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

  const submitIcon = loading ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <Send className="size-4" />
  );

  return (
    <SuperAdminGate>
      <div className="space-y-6">
        <UsersInviteHeader
          icon={Shield}
          title="Platform admin"
          description="Invite someone who can manage all clients and platform settings."
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <SectionCard
              title="Contact details"
              description="We email them a secure link to choose their password."
              nested
            >
              <form onSubmit={sendPlatform} className="space-y-4">
                <InputField
                  label="Full name"
                  value={platformUser.fullName}
                  onChange={patchUserField(setPlatformUser, "fullName")}
                  required
                />
                <InputField
                  label="Email"
                  type="email"
                  value={platformUser.email}
                  onChange={patchUserField(setPlatformUser, "email")}
                  required
                />
                <InputField
                  label="Phone"
                  value={platformUser.phone}
                  onChange={patchUserField(setPlatformUser, "phone")}
                  required
                />
                <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading}
                    startIcon={submitIcon}
                  >
                    Send invite
                  </Button>
                </div>
              </form>
            </SectionCard>
          </div>

          <aside className="space-y-4 lg:col-span-1">
            <InviteTipsPanel
              title="After you send"
              steps={[
                "They receive an email with an activation link.",
                "They set a password and sign in to the admin panel.",
                "They can manage every client workspace on the platform.",
              ]}
            />
            <AdminInfoCallout
              icon={Mail}
              description="Invites expire if unused. You can send a fresh invite from this page anytime."
            />
          </aside>
        </div>
      </div>
    </SuperAdminGate>
  );
}
