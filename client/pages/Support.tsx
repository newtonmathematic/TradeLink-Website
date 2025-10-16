import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportService } from "@/services/supportService";
import { useToast } from "@/hooks/use-toast";

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const bizId = user ? `biz_${user.id}` : "";

  const [query, setQuery] = useState("");
  const faqs = useMemo(()=> SupportService.searchFAQs(query), [query]);

  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");

  const [reportType, setReportType] = useState<"abuse"|"technical">("abuse");
  const [reportTarget, setReportTarget] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  const submitContact = () => {
    if (!bizId || !contactSubject.trim() || !contactMessage.trim()) return;
    SupportService.createTicket({ businessId: bizId, type: "contact", subject: contactSubject.trim(), message: contactMessage.trim(), email: contactEmail.trim() });
    setContactSubject(""); setContactMessage("");
    toast({ title: "Message sent", description: "Our team will get back to you." });
  };

  const submitReport = () => {
    if (!bizId || !reportMessage.trim()) return;
    SupportService.createTicket({ businessId: bizId, type: reportType, subject: reportType === "abuse" ? "Abuse report" : "Technical issue", message: reportMessage.trim(), targetBusinessId: reportTarget.trim() || undefined });
    setReportMessage(""); setReportTarget("");
    toast({ title: "Report submitted", description: "Thanks for the report. We'll review it." });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Search FAQs or contact us about issues.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search FAQs" value={query} onChange={(e)=> setQuery(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((f)=> (
              <div key={f.id} className="p-4 border rounded-md">
                <div className="font-medium mb-1">{f.q}</div>
                <div className="text-sm text-muted-foreground">{f.a}</div>
              </div>
            ))}
            {faqs.length===0 && (<div className="text-sm text-muted-foreground">No results.</div>)}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contact">
        <TabsList>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="report">Report Issue</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>General questions and account help</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Subject</Label>
                <Input value={contactSubject} onChange={(e)=> setContactSubject(e.target.value)} />
              </div>
              <div>
                <Label>Your email</Label>
                <Input type="email" value={contactEmail} onChange={(e)=> setContactEmail(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Message</Label>
                <Textarea rows={6} value={contactMessage} onChange={(e)=> setContactMessage(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={submitContact} disabled={!contactSubject.trim() || !contactMessage.trim()}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Abuse / Technical Issue</CardTitle>
              <CardDescription>Help us keep the community safe and stable</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant={reportType==='abuse'? 'default':'outline'} onClick={()=> setReportType('abuse')}>Abuse</Button>
                  <Button type="button" variant={reportType==='technical'? 'default':'outline'} onClick={()=> setReportType('technical')}>Technical</Button>
                </div>
              </div>
              <div>
                <Label>Target Business ID (optional)</Label>
                <Input placeholder="biz_xxx" value={reportTarget} onChange={(e)=> setReportTarget(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={6} value={reportMessage} onChange={(e)=> setReportMessage(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={submitReport} disabled={!reportMessage.trim()}>Submit Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
