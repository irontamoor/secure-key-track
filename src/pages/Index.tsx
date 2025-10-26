import { KeySearch } from "@/components/KeySearch";
import { AuditLog } from "@/components/AuditLog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Search, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InfoButton } from "@/components/InfoButton";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm" style={{ background: 'var(--gradient-card)' }}>
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Key Management System</h1>
              <p className="text-sm text-muted-foreground">Track and manage your keys efficiently</p>
            </div>
            <InfoButton content="This system helps you track key checkouts and returns. All actions are logged automatically for audit purposes." />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")} className="hover-scale">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Search Keys
              <InfoButton content="Search for keys by number, description, or keywords. Click on a key to check it out or in." />
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="h-4 w-4" />
              Recent Activity
              <InfoButton content="View all check-in and check-out transactions. Search by person, key, or notes." />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="mt-6 animate-fade-in">
            <KeySearch />
          </TabsContent>
          <TabsContent value="activity" className="mt-6 animate-fade-in">
            <AuditLog />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
