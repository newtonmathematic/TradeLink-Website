import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { DollarSign, Handshake, TrendingUp, MessageSquare, Download } from "lucide-react";
import { AnalyticsService } from "@/services/analyticsService";

export default function Analytics() {
  const { dashboardData, user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [period, setPeriod] = useState<"week"|"month">((params.get("period") as any) || "week");
  const focus = params.get("focus") || undefined;

  useEffect(()=>{ if (focus) { const el = document.getElementById(`section-${focus}`); if (el) el.scrollIntoView({ behavior: "smooth" }); } }, [focus]);

  if (!dashboardData || !user) {
    return <div className="p-6">Loading analytics...</div>;
  }

  const bizId = `biz_${user.id}`;

  const statCards = [
    { key: "partnerships", title: "Active Partnerships", value: dashboardData.analytics.activePartnerships, icon: Handshake, color: "text-green-600" },
    { key: "value", title: "Value Exchanged", value: dashboardData.analytics.valueExchanged, icon: DollarSign, color: "text-blue-600" },
    { key: "redemptions", title: "Redemptions", value: dashboardData.analytics.recentRedemptions, icon: TrendingUp, color: "text-purple-600" },
    { key: "negotiations", title: "Negotiations", value: dashboardData.analytics.activeNegotiations, icon: MessageSquare, color: "text-orange-600" },
  ];

  const redemptionSeries = useMemo(()=> AnalyticsService.aggregateByPeriod(bizId, period, "redemption"), [bizId, period, dashboardData.analytics.recentRedemptions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track partnerships, redemptions, value and negotiations</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2"/>Export</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s)=> (
          <Card key={s.key} id={`section-${s.key}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Link to={`/analytics?focus=${s.key}&period=${period}`} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{s.title}</div>
                    <div className="text-2xl font-semibold">{typeof s.value === "number" ? s.value : s.value}</div>
                  </div>
                  <div className={`p-3 rounded bg-gray-50 ${s.color}`}><s.icon className="h-6 w-6"/></div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={period} onValueChange={(v:any)=>{ setPeriod(v); setParams({ period: v, ...(focus ? { focus } : {}) }, { replace: true }); }}>
        <TabsList>
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value={period} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Redemptions Over Time</CardTitle>
              <CardDescription>Track redemption volume across the last 12 {period === 'week' ? 'weeks' : 'months'}.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ redemptions: { label: "Redemptions", color: "hsl(262, 83%, 57%)" } }} className="w-full">
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

          <Card>
            <CardHeader>
              <CardTitle>Partnership Progress</CardTitle>
              <CardDescription>Average progress of active partnerships.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ progress: { label: "Progress", color: "hsl(142, 71%, 45%)" } }}>
                <LineChart data={(dashboardData.partnerships.length? dashboardData.partnerships: []).map((p)=>({ name: p.partner, value: p.progress }))}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} hide={dashboardData.partnerships.length>6} />
                  <YAxis domain={[0,100]} />
                  <Line dataKey="value" stroke="var(--color-progress)" strokeWidth={2} dot={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
