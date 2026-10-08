import type { ReactNode } from "react";

import {
  KaiznovaMark,
  KaiznovaTagline,
} from "@/components/common/KaiznovaBrand";

import {
  adminLinkClass,
  adminPrimaryButtonFullClass,
} from "@/lib/constants/admin-theme";

import LoginBuilderBackdrop from "./LoginBuilderBackdrop";

export const authPrimaryButtonClass = adminPrimaryButtonFullClass;

export const authBackLinkClass = `text-sm ${adminLinkClass}`;

interface AuthPageShellProps {
  subtitle: string;
  children: ReactNode;
}

const AuthPageShell = ({ subtitle, children }: AuthPageShellProps) => (
  <div className="min-h-screen grid lg:grid-cols-5 bg-canvas">
    <LoginBuilderBackdrop />

    <div className="lg:col-span-2 flex items-center justify-center p-4 sm:p-8 bg-canvas">
      <div className="w-full max-w-md">
        <div className="text-center mb-7 flex flex-col items-center gap-2">
          <KaiznovaMark className="size-20" />
          <KaiznovaTagline />
          <p className="text-ink-mute text-sm mt-1">{subtitle}</p>
        </div>

        <div className="card shadow-sm ring-1 ring-line/80">
          <div className="card-body">{children}</div>
        </div>

        <p className="text-center text-base text-ink font-semibold mt-6">
          KAIZNOVA Admin Panel &mdash; Authorized Access Only
        </p>
      </div>
    </div>
  </div>
);

export default AuthPageShell;
