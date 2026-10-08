import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Building2, Sparkles } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import AdminInfoCallout from "@/components/common/AdminInfoCallout";
import { StepNavigation } from "@/components/common/StepNavigation";
import { Stepper } from "@/components/common/Stepper";
import Wizard from "@/components/common/wizard";

import { tenantsApi } from "@/services/api";

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

export default function InviteNewClient() {
  const [newTenantUser, setNewTenantUser] = useState<UserFields>(emptyUser);
  const [tenantName, setTenantName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tenantCreateLoading, setTenantCreateLoading] =
    useState<boolean>(false);
  const [clientWizardKey, setClientWizardKey] = useState<number>(0);

  const createTenantWithUser = async () => {
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setTenantCreateLoading(true);

    try {
      const response = await tenantsApi.createWithUser({
        ...newTenantUser,
        tenantName,
        description: description || undefined,
      });
      message = response.data?.message || message;
      if (response.data?.success) {
        isError = false;
        setNewTenantUser(emptyUser());
        setTenantName("");
        setDescription("");
        setClientWizardKey((key) => key + 1);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) toast.error(message);
      else toast.success(message);
      setTenantCreateLoading(false);
    }
  };

  const validateClientContact = () => {
    const { fullName, email, phone } = newTenantUser;
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please enter name, email, and phone.");
      return false;
    }
    return true;
  };

  const validateClientWebsite = () => {
    if (!tenantName.trim()) {
      toast.error("Please enter a website or workspace name.");
      return false;
    }
    return true;
  };

  return (
    <SuperAdminGate>
      <div className="space-y-6">
        <UsersInviteHeader
          icon={Building2}
          title="New client"
          description="Create their website and invite the person who will run it."
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <SectionCard
              title="Client setup"
              description="Two quick steps — you can go back to change answers before submitting."
              nested
            >
              <Wizard key={clientWizardKey}>
                <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
                  <Stepper
                    descriptions={[
                      "Name and email for their admin",
                      "How this site appears in the panel",
                    ]}
                    widthClass="w-full lg:w-56 shrink-0"
                  />
                  <div className="min-w-0 flex-1 border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
                    <Wizard.Step
                      title="Admin contact"
                      validate={validateClientContact}
                    >
                      <div className="space-y-4">
                        <InputField
                          label="Full name"
                          value={newTenantUser.fullName}
                          onChange={patchUserField(
                            setNewTenantUser,
                            "fullName",
                          )}
                          required
                        />
                        <InputField
                          label="Email"
                          type="email"
                          value={newTenantUser.email}
                          onChange={patchUserField(setNewTenantUser, "email")}
                          required
                        />
                        <InputField
                          label="Phone"
                          value={newTenantUser.phone}
                          onChange={patchUserField(setNewTenantUser, "phone")}
                          required
                        />
                        <StepNavigation nextLabel="Continue" showBack={false} />
                      </div>
                    </Wizard.Step>
                    <Wizard.Step
                      title="Website"
                      validate={validateClientWebsite}
                    >
                      <div className="space-y-4">
                        <InputField
                          label="Website or workspace name"
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                          required
                        />
                        <InputField
                          label="Short description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <StepNavigation
                          finishLabel="Create and send invite"
                          disableNext={tenantCreateLoading}
                          onFinish={createTenantWithUser}
                        />
                      </div>
                    </Wizard.Step>
                  </div>
                </div>
              </Wizard>
            </SectionCard>
          </div>

          <aside className="space-y-4 lg:col-span-1">
            <InviteTipsPanel
              title="What you are creating"
              steps={[
                "A dedicated workspace for this client’s website.",
                "An admin account tied to that workspace only.",
                "A ready-made site they can customize after signing in.",
              ]}
            />
            <AdminInfoCallout
              icon={Sparkles}
              description="The invite email goes to the admin contact. They finish setup; you do not need to share passwords."
            />
          </aside>
        </div>
      </div>
    </SuperAdminGate>
  );
}
