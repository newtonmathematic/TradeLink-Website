import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { VerificationService } from "@/services/verificationService";
import { AnalyticsService } from "@/services/analyticsService";

export default function Verification() {
  const { user, addRedemption } = useAuth();
  const [period, setPeriod] = useState<"week"|"month">("week");

  if (!user) return <div className="p-6">Loading...</div>;
  const bizId = `biz_${user.id}`;

  const employees = VerificationService.listEmployees(bizId);
  const qrs = VerificationService.listQrs(bizId);
  const passes = VerificationService.listPasses(bizId);
  const logs = VerificationService.listLogs(bizId);

  const redemptionSeries = useMemo(()=> AnalyticsService.aggregateByPeriod(bizId, period, "redemption"), [bizId, period, logs.length]);

  const onUpload = async (file: File) => {
    const text = await file.text();
    VerificationService.uploadRoster(bizId, text);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verification</h1>
        <p className="text-muted-foreground">Generate QR codes, manage rosters and view verification analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Roster</CardTitle>
            <CardDescription>Upload CSV (name,email) or add employees and generate QR codes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Upload CSV</Label>
              <Input type="file" accept=".csv,.txt" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onUpload(f); }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {employees.map((emp)=> (
                <div key={emp.id} className="p-3 rounded border flex items-center justify-between">
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-muted-foreground">{emp.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=> VerificationService.generateQr(bizId, emp.id)}>Generate QR</Button>
                    <Button size="sm" onClick={()=> VerificationService.createPass(bizId, emp.id, "Employee Pass")}>Create Pass</Button>
                  </div>
                </div>
              ))}
              {employees.length===0 && (<div className="text-sm text-muted-foreground">No employees yet. Upload a roster to get started.</div>)}
            </div>
          </CardContent>
        </Card>

        {/* QR Codes & Passes */}
        <Card>
          <CardHeader>
            <CardTitle>QR Codes & Passes</CardTitle>
            <CardDescription>Latest generated items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">QR Codes</div>
              <div className="grid grid-cols-3 gap-2">
                {qrs.slice(-6).reverse().map((qr)=> (
                  <img key={qr.id} src={qr.svgDataUrl} className="border rounded" alt="QR" />
                ))}
              </div>
              {qrs.length===0 && <div className="text-sm text-muted-foreground">No QR codes yet.</div>}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Digital Passes</div>
              <div className="space-y-1">
                {passes.slice(-6).reverse().map((p)=> (
                  <div key={p.id} className="p-2 rounded border text-sm flex items-center justify-between">
                    <div>{p.title}</div><div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                ))}
                {passes.length===0 && <div className="text-sm text-muted-foreground">No passes yet.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Redemption Logs</CardTitle>
          <CardDescription>Track employee redemptions for auditing and analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Time</th>
                  <th className="py-2">Employee</th>
                  <th className="py-2">Partner</th>
                  <th className="py-2">Value</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l)=> {
                  const emp = employees.find(e=>e.id===l.employeeId);
                  return (
                    <tr key={l.id} className="border-t">
                      <td className="py-2">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="py-2">{emp?.name || l.employeeId}</td>
                      <td className="py-2">{l.partner || "-"}</td>
                      <td className="py-2">{l.value ? `$${l.value.toFixed(2)}` : "-"}</td>
                      <td className="py-2 text-right">
                        <Button size="sm" variant="outline" onClick={()=> {
                          if (l.value && l.partner) {
                            addRedemption(l.partner, emp?.name || "Employee", `$${l.value}`);
                          }
                        }}>Sync to Analytics</Button>
                      </td>
                    </tr>
                  );
                })}
                {logs.length===0 && (
                  <tr><td className="py-4 text-sm text-muted-foreground" colSpan={5}>No logs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verification Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Analytics</CardTitle>
              <CardDescription>Redemptions over time</CardDescription>
            </div>
            <Tabs value={period} onValueChange={(v:any)=> setPeriod(v)}>
              <TabsList>
                <TabsTrigger value="week">Weekly</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ redemptions: { label: "Redemptions", color: "hsl(262, 83%, 57%)" } }}>
            <BarChart data={redemptionSeries}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} />
              <Bar dataKey="value" fill="var(--color-redemptions)" radius={[4,4,0,0]} />
              <ChartTooltip content={<ChartTooltipContent labelKey="label" nameKey="redemptions" />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
