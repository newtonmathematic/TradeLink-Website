import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Search } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
            <p className="text-xl text-gray-600 mb-6">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500 mb-8">
              The page at <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code> could not be found.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/discovery">
                  <Search className="h-4 w-4 mr-2" />
                  Discover Partners
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
