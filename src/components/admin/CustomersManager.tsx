"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toggleCustomerActiveAction } from "@/actions/admin-ops.actions";
import type { AdminCustomerRecord } from "@/lib/services/admin.service";
import { formatShortDate } from "@/lib/utils/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CustomersManager({ customers }: { customers: AdminCustomerRecord[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company_name ?? "").toLowerCase().includes(q)
    );
  }, [customers, query]);

  async function handleToggle(c: AdminCustomerRecord) {
    setBusyId(c.id);
    setError(null);
    const res = await toggleCustomerActiveAction(c.id, !c.is_active);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase">
            Client Directory
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Customer Management</h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search name, email, or company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {filtered.length === 0 ? (
        <Card className="bg-card text-muted-foreground border-dashed p-10 text-center text-sm">
          No customer profiles match the current query.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((customer) => (
            <Card key={customer.id} className="bg-card">
              <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-foreground font-semibold">{customer.full_name}</p>
                    <Badge variant={customer.is_active ? "default" : "outline"}>
                      {customer.is_active ? "Active" : "Deactivated"}
                    </Badge>
                    <Badge variant="secondary">{customer.projectCount} project(s)</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {customer.email}
                    {customer.company_name ? ` · ${customer.company_name}` : ""}
                    {customer.phone ? ` · ${customer.phone}` : ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Joined {formatShortDate(customer.created_at)}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyId === customer.id}
                  onClick={() => handleToggle(customer)}
                >
                  {customer.is_active ? "Deactivate" : "Reactivate"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

