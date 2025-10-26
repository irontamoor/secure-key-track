import { KeySearch } from "@/components/KeySearch";
import { AuditLog } from "@/components/AuditLog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
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
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <KeySearch />
        <AuditLog />
      </main>
    </div>
  );
};

export default Index;
