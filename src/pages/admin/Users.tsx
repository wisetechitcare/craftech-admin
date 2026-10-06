import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import SelectField from "@/components/admin/ui/SelectField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import { tenantsApi, usersApi, type UserRole } from "@/services/api";

interface UserFields {
  fullName: string;
  email: string;
  phone: string;
}

interface TenantOption {
  id: string;
  name: string;
}

const SUPER_ADMIN: UserRole = "SUPER_ADMIN";

const emptyUser = (): UserFields => ({ fullName: "", email: "", phone: "" });

function patchUserField(
  set: Dispatch<SetStateAction<UserFields>>,
  field: keyof UserFields,
) {
  return (e: ChangeEvent<HTMLInputElement>) =>
    set((prev) => ({ ...prev, [field]: e.target.value }));
}

type Step = 1 | 2;

const Users = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [platformUser, setPlatformUser] = useState<UserFields>(emptyUser);
  const [newTenantUser, setNewTenantUser] = useState<UserFields>(emptyUser);
  const [existingTenantUser, setExistingTenantUser] =
    useState<UserFields>(emptyUser);
  const [tenantName, setTenantName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [platformLoading, setPlatformLoading] = useState<boolean>(false);
  const [tenantCreateLoading, setTenantCreateLoading] =
    useState<boolean>(false);
  const [tenantInviteLoading, setTenantInviteLoading] =
    useState<boolean>(false);
  const [tenantId, setTenantId] = useState<string>("");
  const [tenants, setTenants] = useState<TenantOption[]>([]);

  useEffect(() => {
    if (user?.role !== SUPER_ADMIN) return;
    tenantsApi
      .list()
      .then((res) => {
        if (res.data?.success) setTenants(res.data.data);
      })
      .catch(() => undefined);
  }, [user?.role]);

  const tenantOptions = useMemo(
    () => tenants.map((t) => ({ value: t.id, label: t.name })),
    [tenants],
  );

  if (user?.role !== SUPER_ADMIN) {
    return <p className="text-ink-mute">Super admin access required.</p>;
  }

  const sendPlatform = async (e: FormEvent) => {
    e.preventDefault();
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setPlatformLoading(true);

    try {
      const response = await usersApi.invitePlatform(platformUser);
      message = response.data?.message || "Platform user invitation sent.";
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
      setPlatformLoading(false);
    }
  };

  const createTenantWithUser = async (e: FormEvent) => {
    e.preventDefault();
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setTenantCreateLoading(true);

    try {
      const response = await tenantsApi.createWithUser({
        ...newTenantUser,
        tenantName,
        description: description || undefined,
      });
      message =
        response.data?.message || "Tenant created and activation email sent.";
      if (response.data?.success) {
        isError = false;
        setStep(1);
        setNewTenantUser(emptyUser());
        setTenantName("");
        setDescription("");
        const listRes = await tenantsApi.list();
        if (listRes.data?.success) setTenants(listRes.data.data);
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

  const inviteExistingTenant = async (e: FormEvent) => {
    e.preventDefault();
    let message = "Something went wrong. Please try again.";
    let isError = true;
    setTenantInviteLoading(true);

    try {
      const response = await usersApi.inviteTenant({
        ...existingTenantUser,
        tenantId,
      });
      message = response.data?.message || "Tenant admin invitation sent.";
      if (response.data?.success) {
        isError = false;
        setExistingTenantUser(emptyUser());
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) toast.error(message);
      else toast.success(message);
      setTenantInviteLoading(false);
    }
  };

  const submitIcon = (loading: boolean) =>
    loading ? (
      <Loader2 className="size-4 animate-spin" />
    ) : (
      <Send className="size-4" />
    );

  return (
    <div className="max-w-2xl space-y-10">
      <SectionCard
        title="Invite platform user"
        description="Creates a SUPER_ADMIN with activation email."
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
          <Button
            type="submit"
            size="sm"
            disabled={platformLoading}
            startIcon={submitIcon(platformLoading)}
          >
            Send activation
          </Button>
        </form>
      </SectionCard>

      <SectionCard
        title="Create tenant and first admin"
        description="Two steps: admin details, then workspace."
      >
        {step === 1 ? (
          <div className="space-y-4">
            <InputField
              label="Full name"
              value={newTenantUser.fullName}
              onChange={patchUserField(setNewTenantUser, "fullName")}
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
            <Button type="button" size="sm" onClick={() => setStep(2)}>
              Next: tenant details
            </Button>
          </div>
        ) : (
          <form onSubmit={createTenantWithUser} className="space-y-4">
            <InputField
              label="Workspace / website name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
            />
            <InputField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={tenantCreateLoading}
                startIcon={submitIcon(tenantCreateLoading)}
              >
                Create and send activation
              </Button>
            </div>
          </form>
        )}
      </SectionCard>

      <SectionCard title="Add admin to existing tenant">
        <form onSubmit={inviteExistingTenant} className="space-y-4">
          <InputField
            label="Full name"
            value={existingTenantUser.fullName}
            onChange={patchUserField(setExistingTenantUser, "fullName")}
            required
          />
          <InputField
            label="Email"
            type="email"
            value={existingTenantUser.email}
            onChange={patchUserField(setExistingTenantUser, "email")}
            required
          />
          <InputField
            label="Phone"
            value={existingTenantUser.phone}
            onChange={patchUserField(setExistingTenantUser, "phone")}
            required
          />
          <SelectField
            label="Tenant"
            value={tenantId}
            onValueChange={setTenantId}
            options={tenantOptions}
            required
          />
          <Button
            type="submit"
            size="sm"
            disabled={tenantInviteLoading}
            startIcon={submitIcon(tenantInviteLoading)}
          >
            Send activation
          </Button>
        </form>
      </SectionCard>
    </div>
  );
};

export default Users;
