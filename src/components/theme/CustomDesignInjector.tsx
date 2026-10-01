import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function CustomDesignInjector() {
  let headerJs = "";
  let footerJs = "";
  let headerCss = "";

  try {
    const configs = await db
      .select()
      .from(siteConfig)
      .where(inArray(siteConfig.name, ["header_js", "footer_js", "header_css"]));

    for (const c of configs) {
      if (c.name === "header_js") headerJs = c.value || "";
      if (c.name === "footer_js") footerJs = c.value || "";
      if (c.name === "header_css") headerCss = c.value || "";
    }
  } catch (error) {
    // If DB is offline or table empty, gracefully do nothing
  }

  return (
    <>
      {headerCss && (
        <style
          id="custom-header-css"
          dangerouslySetInnerHTML={{ __html: headerCss }}
        />
      )}
      {headerJs && (
        <script
          id="custom-header-js"
          dangerouslySetInnerHTML={{ __html: headerJs }}
        />
      )}
      {footerJs && (
        <script
          id="custom-footer-js"
          dangerouslySetInnerHTML={{ __html: footerJs }}
        />
      )}
    </>
  );
}
