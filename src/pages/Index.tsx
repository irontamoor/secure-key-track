import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeySearch } from "@/components/KeySearch";
import { AuditLog } from "@/components/AuditLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Search, History, LogOut } from "lucide-react";
import { InfoButton } from "@/components/InfoButton";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");
  const { user, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (activeTab === "admin") {
      navigate("/admin");
    }
  }, [activeTab, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm" style={{ background: 'var(--gradient-card)' }}>
        {/* Title Row */}
        <div className="container mx-auto px-4 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Key Management System</h1>
                <p className="text-sm text-muted-foreground">Track and manage your keys efficiently</p>
              </div>
              <InfoButton content="This system helps you track key checkouts and returns. All actions are logged automatically for audit purposes." />
            </div>
            <Button variant="ghost" onClick={handleSignOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Navigation Menu Row */}
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl h-12">
              <TabsTrigger value="search" className="gap-1.5">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search Keys</span>
                <span className="sm:hidden">Search</span>
                <InfoButton content="Search and check out/in keys by number, description, or keywords. View key details including photos and location." />
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Recent Activity</span>
                <span className="sm:hidden">Activity</span>
                <InfoButton content="View complete audit trail of all key transactions. Filter by person names, key numbers, or notes." />
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="gap-1.5">
                  <Settings className="h-4 w-4" />
                  Admin
                  <InfoButton content="Add new keys, edit existing ones, upload photos, and manage the entire key inventory." />
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TabsContent value="search" className="mt-0 animate-fade-in">
          <KeySearch />
        </TabsContent>
        <TabsContent value="activity" className="mt-0 animate-fade-in">
          <AuditLog />
        </TabsContent>
      </main>
    </Tabs>
  );
};

export default Index;
