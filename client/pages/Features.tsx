import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Layers, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Feature({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <div className="py-20">
      <Card className="border-0 shadow-sm max-w-5xl mx-auto">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Features</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Tools to discover, connect, and scale business partnerships with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Discovery & Matchmaking</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            <Feature
              icon={Layers}
              title="Searchable Network"
              description="Filter partners by industry, capability, geography, and mutual goals to find the best matches."
            />
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Collaboration & Execution</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            <Feature
              icon={Zap}
              title="Integrated Workflows"
              description="Templates, milestone tracking, and shared dashboards keep partners aligned and accountable."
            />
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Trust & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            <Feature
              icon={ShieldCheck}
              title="Security & Governance"
              description="Role-based access, audit logs, and clear governance templates to protect both parties."
            />
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Insights & Measurement</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            <Feature
              icon={Sparkles}
              title="Analytics"
              description="Track pipeline, revenue influence, and milestone outcomes to optimize partner programs."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
