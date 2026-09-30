import React from "react";
import { db } from "@/db";
import { currencies } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ManageCurrenciesClient } from "@/components/admin/ManageCurrenciesClient";

export const dynamic = "force-dynamic";

export default async function AdminManageCurrenciesPage() {
  const rows = await db
    .select()
    .from(currencies)
    .orderBy(asc(currencies.id));

  const initialCurrencies = rows.map((r) => ({
    id: r.id,
    currencyCode: r.currencyCode,
    currencySymbol: r.currencySymbol,
    isDefault: !!r.isDefault,
  }));

  return <ManageCurrenciesClient initialCurrencies={initialCurrencies} />;
}
