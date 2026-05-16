import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { DataList } from "@/components/data-list";
import { SchoolsAPI } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/schools")({ component: SchoolsPage });

function SchoolsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Personnes"
        title="Écoles"
        description="Établissements scolaires desservis par votre flotte."
      />
      <DataList
        queryKey={["schools"]}
        queryFn={() => SchoolsAPI.list()}
        searchKeys={["name", "address", "city"]}
        searchPlaceholder="Rechercher école, ville…"
        emptyHint="Aucune école enregistrée. Créez d'abord une organisation."
        columns={[
          { key: "name", header: "Nom", cell: (r) => <span className="font-medium text-foreground">{r.name || "—"}</span> },
          { key: "city", header: "Ville", cell: (r) => r.city ? <Badge variant="outline">{r.city}</Badge> : "—" },
          { key: "address", header: "Adresse", cell: (r) => <span className="text-muted-foreground">{r.address || "—"}</span> },
          { key: "kids", header: "Enfants inscrits", cell: (r) => <span className="tabular-nums">{r.childrenCount ?? "—"}</span> },
        ]}
      />
    </div>
  );
}
