import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { BusinessService } from "@/services/businessService";
import { Save } from "lucide-react";

export default function Settings() {
  const { user, logout, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab") || "user";

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [businessLocation, setBusinessLocation] = useState(user?.businessLocation || "");
  const [industry, setIndustry] = useState(user?.industry || "");
  const [companySize, setCompanySize] = useState(user?.companySize || "");

  // Structured location fields
  const initialCountry = (user?.businessLocation || "").split(",").map(s=>s.trim()).slice(-1)[0] || "";
  const initialCity = (user?.businessLocation || "").split(",").map(s=>s.trim())[0] || "";
  const [locCountry, setLocCountry] = useState<string>(initialCountry);
  const [locCity, setLocCity] = useState<string>(initialCity);
  const [locPostcode, setLocPostcode] = useState<string>("");
  const [locAddress, setLocAddress] = useState<string>("");

  const [savedVisible, setSavedVisible] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const markSaved = () => {
    setSavedVisible(true);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setSavedVisible(false), 1200);
  };

  // Country list and city suggestions
  const COUNTRIES = [
    "New Zealand","Australia","United States","United Kingdom","Canada","Germany","France","Spain","Italy","India","Singapore","Japan","China","Brazil","Mexico","South Africa","Netherlands","Sweden","Norway","Denmark","Finland","Ireland","Switzerland","Austria","Belgium","Portugal","Poland","Czech Republic","Chile","Argentina"
  ];
  const CITY_SUGGESTIONS: Record<string,string[]> = {
    "New Zealand": ["Auckland","Wellington","Christchurch","Hamilton","Tauranga"],
    "Australia": ["Sydney","Melbourne","Brisbane","Perth","Adelaide"],
    "United States": ["New York","San Francisco","Los Angeles","Seattle","Chicago"],
    "United Kingdom": ["London","Manchester","Birmingham","Leeds","Glasgow"],
    "Canada": ["Toronto","Vancouver","Montreal","Calgary","Ottawa"],
  };
  function computeCoordinates(country: string, city: string) {
    const map: Record<string, [number,number]> = {
      "Auckland, New Zealand": [-36.8485, 174.7633],
      "Wellington, New Zealand": [-41.2865, 174.7762],
      "Christchurch, New Zealand": [-43.5321, 172.6362],
      "Sydney, Australia": [-33.8688, 151.2093],
      "Melbourne, Australia": [-37.8136, 144.9631],
      "New York, United States": [40.7128, -74.006],
      "San Francisco, United States": [37.7749, -122.4194],
      "London, United Kingdom": [51.5072, -0.1276],
      "Toronto, Canada": [43.6532, -79.3832],
    };
    const key = `${city}, ${country}`;
    return map[key] || [-41.2865, 174.7762];
  }

  useEffect(() => {
    if (!user) return;
    const combined = `${locCity ? locCity + ", " : ""}${locCountry}`.trim();
    setBusinessLocation(combined);
    const bizId = `biz_${user.id}`;
    const existing = BusinessService.getBusinessById(bizId);
    if (existing) {
      const [lat,lng] = computeCoordinates(locCountry, locCity);
      BusinessService.upsertBusiness({
        ...existing,
        address: {
          ...existing.address,
          street: locAddress,
          city: locCity,
          postcode: locPostcode,
          country: locCountry,
          coordinates: { lat, lng },
        },
      });
    }
    markSaved();
  }, [locCountry, locCity, locPostcode, locAddress]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Contact preferences
  const [contactPrefs, setContactPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tradelink_contact_prefs") || ""); } catch { return {}; }
  }) as any;

  // App settings
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("tradelink_theme") || "system");
  const [notifyPrefs, setNotifyPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tradelink_notifications") || ""); } catch { return {}; }
  }) as any;

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setEmail(user?.email || "");
    setBusinessName(user?.businessName || "");
    setBusinessLocation(user?.businessLocation || "");
    setIndustry(user?.industry || "");
    setCompanySize(user?.companySize || "");
  }, [user]);

  const setTab = (value: string) => setParams({ tab: value }, { replace: true });

  useEffect(() => { if (user) { updateUserProfile({ firstName }); markSaved(); } }, [firstName]);
  useEffect(() => { if (user) { updateUserProfile({ lastName }); markSaved(); } }, [lastName]);
  useEffect(() => { if (user) { updateUserProfile({ email }); markSaved(); } }, [email]);
  useEffect(() => { if (user) { updateUserProfile({ businessName }); markSaved(); } }, [businessName]);
  useEffect(() => { if (user) { updateUserProfile({ businessLocation }); markSaved(); } }, [businessLocation]);
  useEffect(() => { if (user) { updateUserProfile({ industry }); markSaved(); } }, [industry]);
  useEffect(() => { if (user) { updateUserProfile({ companySize }); markSaved(); } }, [companySize]);

  useEffect(() => {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    try { localStorage.setItem("tradelink_password", JSON.stringify({ updatedAt: new Date().toISOString() })); } catch {}
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    markSaved();
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    try { localStorage.setItem("tradelink_contact_prefs", JSON.stringify(contactPrefs)); } catch {}
    if (Object.keys(contactPrefs).length) markSaved();
  }, [contactPrefs]);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    root.classList.remove("dark");
    if (t === "dark") root.classList.add("dark");
  };

  useEffect(() => { applyTheme(theme); }, []);
  useEffect(() => {
    try { localStorage.setItem("tradelink_theme", theme); } catch {}
    applyTheme(theme);
    if (theme) markSaved();
  }, [theme]);
  useEffect(() => {
    try { localStorage.setItem("tradelink_notifications", JSON.stringify(notifyPrefs)); } catch {}
    if (Object.keys(notifyPrefs).length) markSaved();
  }, [notifyPrefs]);

  const handleDeleteAccount = () => {
    try {
      const id = user ? `biz_${user.id}` : undefined;
      if (id) {
        try { BusinessService.deleteBusiness(id); } catch {}
      }
      localStorage.removeItem("tradelink_user");
      localStorage.removeItem("tradelink_dashboard");
      localStorage.removeItem("tradelink_conversations");
    } catch {}
    logout();
  };

  const handleSaveAll = () => {
    if (user) {
      updateUserProfile({ firstName, lastName, email, businessName, businessLocation, industry, companySize });
    }
    try { localStorage.setItem("tradelink_contact_prefs", JSON.stringify(contactPrefs)); } catch {}
    try { localStorage.setItem("tradelink_theme", theme); } catch {}
    try { localStorage.setItem("tradelink_notifications", JSON.stringify(notifyPrefs)); } catch {}
    markSaved();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, app preferences, and business settings.</p>
        </div>
        <Button onClick={handleSaveAll} className="whitespace-nowrap">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>

      <Tabs value={tabParam} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="app">App</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Update your personal and business information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Business name</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Country</Label>
                <Select value={locCountry} onValueChange={setLocCountry}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {COUNTRIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City</Label>
                <Input list="city-suggestions" value={locCity} onChange={(e)=> setLocCity(e.target.value)} placeholder="City" />
                <datalist id="city-suggestions">
                  {(CITY_SUGGESTIONS[locCountry] || []).map(c => (<option key={c} value={c} />))}
                </datalist>
              </div>
              <div>
                <Label>Postcode</Label>
                <Input value={locPostcode} onChange={(e)=> setLocPostcode(e.target.value)} placeholder="Postcode" />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={locAddress} onChange={(e)=> setLocAddress(e.target.value)} placeholder="Street address" />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue placeholder="Select Industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Professional Services">Professional Services</SelectItem>
                    <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
                    <SelectItem value="Sports & Fitness">Sports & Fitness</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Company size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger><SelectValue placeholder="Select Size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                    <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                    <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                    <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                    <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                    <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Current password</Label>
                <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)} />
              </div>
              <div>
                <Label>New password</Label>
                <PasswordInput value={newPassword} onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)} />
              </div>
              <div>
                <Label>Confirm password</Label>
                <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Preferences</CardTitle>
              <CardDescription>Choose how we contact you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Product updates</div>
                  <div className="text-sm text-muted-foreground">Occasional updates about new features.</div>
                </div>
                <Switch checked={!!contactPrefs.productUpdates} onCheckedChange={(v) => setContactPrefs({ ...contactPrefs, productUpdates: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Message notifications</div>
                  <div className="text-sm text-muted-foreground">Email me when I receive new messages.</div>
                </div>
                <Switch checked={!!contactPrefs.messageNotifications} onCheckedChange={(v) => setContactPrefs({ ...contactPrefs, messageNotifications: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Partnership requests</div>
                  <div className="text-sm text-muted-foreground">Get notified about new requests.</div>
                </div>
                <Switch checked={!!contactPrefs.partnershipRequests} onCheckedChange={(v) => setContactPrefs({ ...contactPrefs, partnershipRequests: v })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Select your theme.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 items-end">
              <div>
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control app notifications.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email notifications</div>
                  <div className="text-sm text-muted-foreground">Receive email alerts.</div>
                </div>
                <Switch checked={!!notifyPrefs.email} onCheckedChange={(v) => setNotifyPrefs({ ...notifyPrefs, email: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push notifications</div>
                  <div className="text-sm text-muted-foreground">Receive push alerts.</div>
                </div>
                <Switch checked={!!notifyPrefs.push} onCheckedChange={(v) => setNotifyPrefs({ ...notifyPrefs, push: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS notifications</div>
                  <div className="text-sm text-muted-foreground">Receive SMS alerts.</div>
                </div>
                <Switch checked={!!notifyPrefs.sms} onCheckedChange={(v) => setNotifyPrefs({ ...notifyPrefs, sms: v })} />
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="business" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
              <CardDescription>Verify your business to build trust.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Start verification to unlock more features.</div>
              </div>
              <Button asChild>
                <Link to="/verification">Go to Verification</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Manage your plan and payment details.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">View invoices, update payment methods, and change plans.</div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/billing">Billing & Plans</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">This action is irreversible.</div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and remove your data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {savedVisible && (
        <div className="fixed bottom-6 right-6 bg-white border border-green-200 text-green-700 shadow-sm rounded-full px-3 py-1 flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9.5a.75.75 0 01-1.127.06l-3.5-3.75a.75.75 0 111.09-1.03l2.93 3.138 6.957-8.807a.75.75 0 011.007-.163z" clipRule="evenodd" /></svg>
          Saved
        </div>
      )}
    </div>
  );
}
