import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminAnalyticsData } from "@/lib/services/admin.service";
import { formatMoneyMinor } from "@/lib/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Analytics",
  description: "Operational metrics across enquiries, projects, and quotations.",
  path: "/admin/analytics",
  noIndex: true,
});

async function AnalyticsContent() {
  await requirePermissionOrRedirect("analytics.read", { nextPath: "/admin/analytics" });
  const data = await getAdminAnalyticsData();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
          Operational Intelligence
        </p>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time counts derived directly from submitted enquiries, projects, and quotations.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Quotation Pipeline by Currency</CardTitle>
            <CardDescription>
              Issued (non-draft) vs client-accepted quotation totals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.totalsByCurrency.length === 0 ? (
              <p className="text-muted-foreground">No non-draft quotations issued yet.</p>
            ) : (
              data.totalsByCurrency.map((row) => (
                <div
                  key={row.currency}
                  className="bg-background flex items-center justify-between rounded-xl border p-3.5"
                >
                  <span className="font-mono font-semibold">{row.currency}</span>
                  <div className="text-right text-xs">
                    <p className="text-foreground font-semibold">
                      Quoted: {formatMoneyMinor(row.quotedMinor, row.currency)}
                    </p>
                    <p className="text-brand-green font-medium">
                      Accepted: {formatMoneyMinor(row.acceptedMinor, row.currency)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Top Requested Services</CardTitle>
            <CardDescription>Demand distribution across active and past briefs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            {data.topServices.length === 0 ? (
              <p className="text-muted-foreground">No project requests recorded yet.</p>
            ) : (
              data.topServices.map((svc) => (
                <div
                  key={svc.title}
                  className="bg-background flex items-center justify-between rounded-xl border px-3.5 py-2.5"
                >
                  <span className="font-medium">{svc.title}</span>
                  <span className="text-secondary font-mono font-semibold">{svc.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          { title: "Projects by Status", rows: data.projectsByStatus },
          { title: "Enquiries by Status", rows: data.enquiriesByStatus },
          { title: "Quotations by Status", rows: data.quotationsByStatus },
        ].map((panel) => (
          <Card key={panel.title} className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">{panel.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {panel.rows.length === 0 ? (
                <p className="text-muted-foreground">No records yet.</p>
              ) : (
                panel.rows.map((r) => (
                  <div
                    key={r.status}
                    className="bg-background flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="capitalize">{r.status.replaceAll("_", " ")}</span>
                    <span className="font-mono font-semibold">{r.count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AnalyticsContent />
    </Suspense>
  );
}
