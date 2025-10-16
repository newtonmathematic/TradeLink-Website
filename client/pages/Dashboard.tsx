import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Handshake,
  DollarSign,
  Users,
  Clock,
  MessageSquare,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import React from "react";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";

export default function Dashboard() {
  const { user, dashboardData, addPartnership, addRedemption } = useAuth();
  const { openModal } = useCreateProposalModal();
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  React.useEffect(() => {
    if (!user) return;
    try {
      const completed = localStorage.getItem(
        `tradelink_onboarding_completed_${user.id}`,
      );
      const firstDoneKey = `tradelink_first_login_done_${user.id}`;
      const firstDone = localStorage.getItem(firstDoneKey);
      const pendingKey = `tradelink_onboarding_pending_${user.id}`;
      const pending = localStorage.getItem(pendingKey);

      if (!completed && !firstDone) {
        // First login: mark and show onboarding once
        localStorage.setItem(firstDoneKey, "1");
        localStorage.setItem(pendingKey, "1");
        setShowOnboarding(true);
      } else {
        setShowOnboarding(!!pending && !completed);
      }
    } catch {}
  }, [user]);

  if (!user || !dashboardData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active Partnerships",
      value: dashboardData.analytics.activePartnerships.toString(),
      change:
        dashboardData.analytics.activePartnerships === 0
          ? "Get started with your first partnership"
          : "+2 this month",
      icon: Handshake,
      color: "text-green-600",
    },
    {
      title: "Value Exchanged",
      value: dashboardData.analytics.valueExchanged,
      change:
        dashboardData.analytics.valueExchanged === "$0"
          ? "Value grows with active partnerships"
          : "+15% from last month",
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      title: "Recent Redemptions",
      value: dashboardData.analytics.recentRedemptions.toString(),
      change:
        dashboardData.analytics.recentRedemptions === 0
          ? "Redemptions will appear here"
          : "+8 this week",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Active Negotiations",
      value: dashboardData.analytics.activeNegotiations.toString(),
      change:
        dashboardData.analytics.activeNegotiations === 0
          ? "Start negotiating with partners"
          : "3 pending response",
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  const negotiations: Array<{
    id: number;
    partner: string;
    proposal: string;
    status: string;
    lastActivity: string;
    priority: string;
  }> = [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {showOnboarding && (
        <OnboardingOverlay onClose={() => setShowOnboarding(false)} />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user.firstName}!
          </h1>
          <p className="text-gray-600">
            {dashboardData.analytics.activePartnerships === 0
              ? `Welcome to ${user.businessName}! Start by exploring the demo actions below or find your first partner.`
              : `Welcome back to ${user.businessName}. Here's what's happening with your partnerships.`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/discovery">Find Partners</Link>
          </Button>
          <Button variant="outline" onClick={() => openModal()}>
            Create Proposal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <Link
                to={`/analytics?focus=${stat.title.toLowerCase().includes("partnership") ? "partnerships" : stat.title.toLowerCase().includes("value") ? "value" : stat.title.toLowerCase().includes("redemption") ? "redemptions" : "negotiations"}`}
                className="block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Actions - For Testing Real-time Updates */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">Demo Actions</CardTitle>
          <CardDescription>
            Try these actions to see real-time dashboard updates in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={() => {
                const partnerNames = [
                  "Metro Coffee",
                  "FitZone Gym",
                  "Tech Solutions",
                  "Downtown Dental",
                  "Book Haven",
                ];
                const deals = [
                  "Employee Discounts",
                  "Wellness Program",
                  "Tech Support Exchange",
                  "Health Benefits",
                  "Learning Resources",
                ];
                const values = ["$500", "$750", "$1,000", "$300", "$600"];

                const randomIndex = Math.floor(
                  Math.random() * partnerNames.length,
                );

                addPartnership({
                  partner: partnerNames[randomIndex],
                  deal: deals[randomIndex],
                  value: values[randomIndex],
                });
              }}
            >
              Add Partnership
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (dashboardData?.partnerships.length) {
                  const randomPartnership =
                    dashboardData.partnerships[
                      Math.floor(
                        Math.random() * dashboardData.partnerships.length,
                      )
                    ];
                  const employees = [
                    "Sarah M.",
                    "John D.",
                    "Emma L.",
                    "Mike R.",
                    "Lisa K.",
                  ];
                  const values = ["$15", "$25", "$35", "$20", "$40"];

                  addRedemption(
                    randomPartnership.partner,
                    employees[Math.floor(Math.random() * employees.length)],
                    values[Math.floor(Math.random() * values.length)],
                  );
                } else {
                  alert("Add a partnership first to test redemptions!");
                }
              }}
            >
              Simulate Redemption
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            These actions will immediately update your dashboard data and are
            persisted locally.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Partnerships */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Partnerships</CardTitle>
                <CardDescription>
                  Your current active deals and their performance
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/proposals">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.partnerships.length === 0 && (
                <p className="text-sm text-gray-500">
                  No businesses to display yet
                </p>
              )}
              {dashboardData.partnerships.map((partnership) => (
                <div
                  key={partnership.id}
                  className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                          {partnership.logo}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {partnership.partner}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {partnership.deal}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {partnership.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Redemptions</p>
                      <p className="font-medium">{partnership.redemptions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Value</p>
                      <p className="font-medium">{partnership.value}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Progress</p>
                      <p className="font-medium">{partnership.progress}%</p>
                    </div>
                  </div>
                  <Progress value={partnership.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest redemptions, proposals, and negotiations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.length === 0 && (
                  <p className="text-sm text-gray-500">No activity yet</p>
                )}
                {dashboardData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "redemption"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "proposal"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {activity.type === "redemption" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : activity.type === "proposal" ? (
                        <Handshake className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.employee} at {activity.business}
                      </p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.value}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{user.businessName}</p>
                  {user.businessLocation && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.businessLocation}
                    </div>
                  )}
                  {user.industry && (
                    <p className="text-xs text-gray-500">{user.industry}</p>
                  )}
                  <Badge
                    className={`text-xs mt-2 ${
                      user.plan === "pro"
                        ? "bg-purple-100 text-purple-700"
                        : user.plan === "plus"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.plan.toUpperCase()} Plan
                  </Badge>
                </div>
              </div>
              {user.companySize && (
                <div className="text-center py-2 px-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Company Size</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.companySize}
                  </p>
                </div>
              )}
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/settings">Manage Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Negotiations */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-500" />
                Active Negotiations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {negotiations.length === 0 && (
                <p className="text-sm text-gray-500">
                  No businesses to display yet
                </p>
              )}
              {negotiations.map((negotiation) => (
                <div
                  key={negotiation.id}
                  className="p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">
                      {negotiation.partner}
                    </h4>
                    <Badge
                      variant={
                        negotiation.priority === "high"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {negotiation.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {negotiation.proposal}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {negotiation.lastActivity}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {negotiation.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/proposals">View All Negotiations</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Partners */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                Recommended Partners
              </CardTitle>
              <CardDescription>
                Businesses perfect for partnership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recommendations.length === 0 && (
                <p className="text-sm text-gray-500">
                  No businesses to display yet
                </p>
              )}
              {dashboardData.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                          {rec.logo}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">{rec.name}</h4>
                        <p className="text-xs text-gray-500">{rec.industry}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {rec.match}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {rec.distance}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {rec.employees}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                  >
                    Propose Deal
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/discovery">Discover More Partners</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
