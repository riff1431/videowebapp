import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getSwitchedAccountsAction } from "@/modules/auth/switch-account.actions";
import { SwitchAccountModal } from "@/components/auth/SwitchAccountModal";

export const dynamic = "force-dynamic";

export default async function SwitchAccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { accounts, canAddMore } = await getSwitchedAccountsAction();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <SwitchAccountModal initialAccounts={accounts} canAddMore={canAddMore} />
    </div>
  );
}
