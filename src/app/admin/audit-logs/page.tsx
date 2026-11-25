import { Suspense } from "react";
import { requirePermissionOrRedirect } from "@/lib/auth/guards";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAdminAuditLogs } from "@/lib/services/admin.service";
import { AuditLogsViewer } from "@/components/admin/AuditLogsViewer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = buildMetadata({
  title: "Admin — Audit Logs",
  description: "Inspect immutable security and operational audit records.",
  path: "/admin/audit-logs",
  noIndex: true,
});

async function AuditLogsContent() {
  await requirePermissionOrRedirect("audit.read", { nextPath: "/admin/audit-logs" });
  const logs = await getAdminAuditLogs(100);
  return <AuditLogsViewer logs={logs} />;
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AuditLogsContent />
    </Suspense>
  );
}

