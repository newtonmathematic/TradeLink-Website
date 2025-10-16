import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Please enter a subject"),
  message: z.string().min(10, "Please enter a message (min 10 characters)"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "", phone: "" },
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to send message");
      }
      setSubmitted(true);
      form.reset();
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    }
  };

  return (
    <div className="py-20">
      <Card className="border-0 shadow-sm max-w-5xl mx-auto">
        <CardHeader className="text-center">
          <Mail className="h-16 w-16 text-blue-600 mx-auto mb-2" />
          <CardTitle className="text-4xl font-bold text-gray-900">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-10">
            Have questions about TradeLink? We'd love to hear from you. Our team typically replies within one business day.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <Mail className="h-6 w-6 text-blue-600 mx-auto lg:mx-0 mb-2" />
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">tradelinknetworkdev@gmail.com</p>
              </div>
              <div className="text-center lg:text-left">
                <Phone className="h-6 w-6 text-blue-600 mx-auto lg:mx-0 mb-2" />
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-600">+64 022 359 1512</p>
              </div>
              <div className="text-center lg:text-left">
                <MapPin className="h-6 w-6 text-blue-600 mx-auto lg:mx-0 mb-2" />
                <h3 className="font-semibold">Office</h3>
                <p className="text-gray-600">Napier, Hawke's Bay</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              {submitted ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <p className="text-green-700 font-medium mb-1">Thanks for reaching out!</p>
                    <p className="text-green-700/90">We've received your message and will get back to you shortly.</p>
                  </CardContent>
                </Card>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea rows={6} placeholder="Tell us a bit about what you need..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-red-600">{error}</div>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        <Send className="h-4 w-4 mr-2" />
                        {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
