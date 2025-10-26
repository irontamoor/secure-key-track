import { KeySearch } from "@/components/KeySearch";
import { AuditLog } from "@/components/AuditLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Search, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InfoButton } from "@/components/InfoButton";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    if (activeTab === "admin") {
      navigate("/admin");
    }
  }, [activeTab, navigate]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm" style={{ background: 'var(--gradient-card)' }}>
        {/* Title Row */}
        <div className="container mx-auto px-4 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Key Management System</h1>
              <p className="text-sm text-muted-foreground">Track and manage your keys efficiently</p>
            </div>
            <InfoButton content="This system helps you track key checkouts and returns. All actions are logged automatically for audit purposes." />
          </div>
        </div>

        {/* Navigation Menu Row */}
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl h-12">
              <TabsTrigger value="search" className="gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search Keys</span>
                <span className="sm:hidden">Search</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Recent Activity</span>
                <span className="sm:hidden">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </TabsTrigger>
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
