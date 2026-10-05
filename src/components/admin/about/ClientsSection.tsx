import { Link } from "react-router-dom";

import ClientsLogosPanel from "@/components/admin/clients/ClientsLogosPanel";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { AdminInfoCallout } from "@/components/common";

import { type AboutSectionProps } from "./shared";

import { useClientsList } from "@/hooks/use-clients-list";
import { AboutSectionKey } from "@/lib/constants/about";

const ClientsAboutSection = ({ toggle }: AboutSectionProps) => {
  const { items, loading, reload } = useClientsList();

  return (
    <SectionCard
      title="Clients & partners"
      description="When Global Clients is off, this band appears on /about after Who We Are by default. Drag this card to reorder."
      controls={toggle(AboutSectionKey.CLIENTS)}
    >
      <AdminInfoCallout
        description={
          <>
            Client logos and section intro are shared with{" "}
            <Link to="/admin/clients" className="font-semibold underline">
              Clients &amp; partners
            </Link>
            . A change here changes there, and everywhere they appear on the
            website.
          </>
        }
      />
      <ClientsLogosPanel
        nested
        items={items}
        loading={loading}
        onReload={reload}
      />
    </SectionCard>
  );
};

export default ClientsAboutSection;
