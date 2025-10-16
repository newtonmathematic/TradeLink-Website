import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const posts = [
  {
    title: "How to Build High-Impact Partnerships",
    excerpt: "Frameworks and best practices for creating partnerships that scale.",
    href: "#",
  },
  {
    title: "Measuring Partnership ROI",
    excerpt: "Key metrics and dashboards to show the value of collaboration.",
    href: "#",
  },
  {
    title: "Legal Checklist for Partner Agreements",
    excerpt: "Practical legal points to cover before launching joint initiatives.",
    href: "#",
  },
];

export default function Blog() {
  return (
    <div className="py-20">
      <Card className="border-0 shadow-sm max-w-5xl mx-auto">
        <CardContent className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Insights & Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Thought leadership, product updates, and case studies about partnerships.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/signup">Subscribe</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Editorial</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Card key={p.title} className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              <p className="text-sm mb-4">{p.excerpt}</p>
              <div className="text-right">
                <Link to={p.href} className="text-sm text-blue-600 hover:underline">
                  Read more
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
