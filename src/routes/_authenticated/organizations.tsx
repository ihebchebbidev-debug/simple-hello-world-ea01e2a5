import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { DataList } from "@/components/data-list";
import { EntityFormDialog, ConfirmDialog } from "@/components/entity-form-dialog";
import { OrganizationsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/organizations")({ component: OrganizationsPage });

function OrganizationsPage() {
  const { isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["organizations"] });
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<any>(null);
  const [delOpen, setDelOpen] = useState<any>(null);

  if (!isSuperAdmin) return <Navigate to="/dashboard" />;

  const fields = [
    { name: "name", label: "Nom", required: true, placeholder: "Ex. École Primaire des Oliviers" },
    { name: "slug", label: "Identifiant (slug)", placeholder: "ex-oliviers" },
    { name: "country", label: "Pays", placeholder: "TN" },
    { name: "city", label: "Ville" },
    { name: "address", label: "Adresse" },
  ] as const;

  return (
    <div>
      <PageHeader
        eyebrow="Super admin"
        title="Organisations"
        description="Tenants — chaque organisation est isolée par RLS côté backend."
        actions={<Button onClick={() => setCreateOpen(true)} size="sm"><Plus className="h-4 w-4" />Nouvelle organisation</Button>}
      />
      <DataList
        queryKey={["organizations"]}
        queryFn={() => OrganizationsAPI.list()}
        searchKeys={["name", "slug", "country", "city"]}
        searchPlaceholder="Rechercher nom, slug, pays…"
        emptyHint="Aucune organisation. Ajoutez la première école pour démarrer."
        emptyAction={<Button onClick={() => setCreateOpen(true)} size="sm"><Plus className="h-4 w-4" />Créer une organisation</Button>}
        columns={[
          { key: "name", header: "Nom", cell: (r) => <span className="font-medium text-foreground">{r.name || "—"}</span> },
          { key: "slug", header: "Slug", cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.slug || "—"}</span> },
          { key: "city", header: "Ville", cell: (r) => r.city || "—" },
          { key: "country", header: "Pays", cell: (r) => r.country ? <Badge variant="outline">{r.country}</Badge> : "—" },
          { key: "users", header: "Utilisateurs", cell: (r) => <span className="tabular-nums">{r.usersCount ?? r.users_count ?? "—"}</span> },
          { key: "buses", header: "Bus", cell: (r) => <span className="tabular-nums">{r.busesCount ?? r.buses_count ?? "—"}</span> },
        ]}
        actions={(r) => (
          <>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditOpen(r)} title="Éditer">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDelOpen(r)} title="Supprimer">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />

      <EntityFormDialog
        open={createOpen} onOpenChange={setCreateOpen}
        title="Nouvelle organisation"
        description="Créez un tenant isolé pour une école ou un opérateur."
        fields={fields as any}
        onSubmit={async (v) => { await OrganizationsAPI.create(v); refresh(); }}
      />
      <EntityFormDialog
        open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}
        title="Modifier l'organisation"
        fields={fields as any}
        initial={editOpen || undefined}
        onSubmit={async (v) => { await OrganizationsAPI.update(editOpen.id, v); refresh(); }}
      />
      <ConfirmDialog
        open={!!delOpen} onOpenChange={(o) => !o && setDelOpen(null)}
        title="Supprimer cette organisation ?"
        description={<>L'organisation <span className="font-medium text-foreground">{delOpen?.name}</span> et toutes ses données associées seront supprimées.</>}
        onConfirm={async () => { await OrganizationsAPI.remove(delOpen.id); toast.success("Supprimé"); refresh(); }}
      />
    </div>
  );
}
