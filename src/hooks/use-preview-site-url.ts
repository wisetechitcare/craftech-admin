import { useEffect, useState } from "react";

import { useWorkspace } from "@/context/WorkspaceContext";
import { siteUrlForHost } from "@/lib/utils/common";
import { domainsApi } from "@/services/api";

/** The selected website's own origin. `undefined` while loading, `null` when
 *  the website has no domain, so a preview never shows another tenant's site. */
export const usePreviewSiteUrl = (): string | null | undefined => {
  const { websiteId } = useWorkspace();
  const [siteUrl, setSiteUrl] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!websiteId) return;
    let current = true;
    setSiteUrl(undefined);

    domainsApi
      .list()
      .then(({ data }) => {
        const domains = data?.success ? data.data : [];
        const domain = domains.find((d) => d.isPrimary) ?? domains[0];
        if (current)
          setSiteUrl((domain && siteUrlForHost(domain.host)) ?? null);
      })
      .catch(() => current && setSiteUrl(null));

    return () => {
      current = false;
    };
  }, [websiteId]);

  return siteUrl;
};
