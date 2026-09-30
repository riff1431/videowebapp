import React from "react";
import { db } from "@/db";
import { customProfileFields } from "@/db/schema";
import { ManageProfileFieldsClient } from "@/components/admin/ManageProfileFieldsClient";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ManageProfileFieldsPage() {
  const fields = await db
    .select({
      id: customProfileFields.id,
      fieldName: customProfileFields.fieldName,
      fieldType: customProfileFields.fieldType,
      fieldLength: customProfileFields.fieldLength,
      placement: customProfileFields.placement,
    })
    .from(customProfileFields)
    .orderBy(asc(customProfileFields.id));

  return <ManageProfileFieldsClient initialFields={fields} />;
}
