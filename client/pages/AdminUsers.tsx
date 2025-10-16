import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Trash2 } from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_location: string;
  industry: string;
  company_size: string;
  plan: "free" | "plus" | "pro";
  created_at: string;
  deleted_at?: string | null;
}

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");

  const load = async (opts?: {
    q?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("limit", String(opts?.limit ?? limit));
      params.set("offset", String(opts?.offset ?? offset));
      const q = opts?.q ?? query;
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data?.ok) {
        setUsers(data.data || []);
        setTotal(data.total || 0);
        setLimit(data.limit || 25);
        setOffset(data.offset || 0);
      } else {
        setError("Failed to load users");
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );
  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  const updateUser = async (id: string, body: Partial<AppUser>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("bad");
      await load();
    } catch {
      setError("Failed to update user");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("bad");
      await load();
    } catch {
      setError("Failed to delete user");
    }
  };

  return (
    <div className="p-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Admin: Users</span>
            <span className="text-sm text-muted-foreground">
              Total: {total}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or business..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") load({ q: query, offset: 0 });
                }}
              />
            </div>
            <Button
              onClick={() => load({ q: query, offset: 0 })}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Business</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-accent/40">
                    <td className="py-2 pr-4">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.business_name}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{u.plan.toUpperCase()}</Badge>
                        <Select
                          value={u.plan}
                          onValueChange={(val) =>
                            updateUser(u.id, { plan: val as any })
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="plus">Plus</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td
                      className="py-6 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-muted-foreground">
              Page {page} of {pages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => load({ offset: Math.max(0, offset - limit) })}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={offset + limit >= total}
                onClick={() => load({ offset: offset + limit })}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
