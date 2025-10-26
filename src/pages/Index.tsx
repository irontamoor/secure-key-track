import { KeySearch } from "@/components/KeySearch";
import { AuditLog } from "@/components/AuditLog";
import { HelpDialog } from "@/components/HelpDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Search, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Key Management System</h1>
            <p className="text-sm text-muted-foreground">Track and manage your keys efficiently</p>
          </div>
          <div className="flex items-center gap-2">
            <HelpDialog />
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search Keys
            </TabsTrigger>
            <TabsTrigger value="activity">
              <History className="h-4 w-4 mr-2" />
              Recent Activity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="mt-6">
            <KeySearch />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <AuditLog />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
