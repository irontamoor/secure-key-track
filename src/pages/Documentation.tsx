import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogIn, LogOut, FileText, UserCheck, Info, Printer, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
            <p className="text-sm text-muted-foreground">Complete guide to the Key Management System</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <Home className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-3xl font-bold">Key Management System</h1>
            <p className="text-lg text-muted-foreground">Complete User Guide</p>
          </div>

          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Welcome to the Key Management System
              </CardTitle>
              <CardDescription>
                This system helps you track and manage keys efficiently with a complete audit trail
                of all check-out and check-in transactions.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Search Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Use the search bar to find keys by number, description, or keywords.
                All available keys will be displayed in a grid with their current status.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">Status Indicators:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li><strong className="text-green-600">Green Badge:</strong> Key is available for checkout</li>
                  <li><strong className="text-red-600">Red Badge:</strong> Key is currently checked out</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Check Out Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-primary" />
                Check Out Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click on any available key card and select "Check Out". You'll need to provide the following information:
              </p>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Required Information:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Your Name:</strong> The person responsible for checking out the key.
                      This field is required and will be remembered for future transactions.
                    </li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Optional Information:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Given To:</strong> The person who is receiving the key.
                      Use this when you're checking out a key on behalf of someone else.
                    </li>
                    <li>
                      <strong className="text-foreground">Notes:</strong> Any additional context about the purpose of the checkout,
                      such as room access, maintenance work, or specific tasks.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check In Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                Check In Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click on a checked-out key and select "Check In". You'll need to provide the following information:
              </p>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Required Information:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Your Name:</strong> The person responsible for returning the key.
                      This field is required and will be remembered for future transactions.
                    </li>
                  </ul>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Optional Information:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Returned By:</strong> The person who physically returned the key.
                      Use this when someone returns a key on behalf of someone else.
                    </li>
                    <li>
                      <strong className="text-foreground">Notes:</strong> Any observations, issues, or important information
                      about the key or its usage during checkout.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                View a complete audit log of all check-out and check-in transactions.
                This provides full accountability and tracking of key usage.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">Features:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Search by person name, key number, or notes</li>
                  <li>View timestamp for each transaction</li>
                  <li>See who checked out/in each key</li>
                  <li>Track key usage patterns over time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Smart Autocomplete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Smart Autocomplete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The system remembers previous names you've used and will suggest them as you type,
                making repeat transactions faster and more consistent.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">Benefits:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Faster data entry for frequent users</li>
                  <li>Consistent name spelling across transactions</li>
                  <li>Reduced typing errors</li>
                  <li>Easier to track individual usage patterns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Click the "Admin" button in the header to access administrative functions.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold">Admin Functions:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Add new keys to the system</li>
                  <li>Edit existing key information</li>
                  <li>Upload and manage key images</li>
                  <li>Delete keys from the system</li>
                  <li>Configure key locations and descriptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Always check in keys as soon as they're returned to maintain accurate status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Include detailed notes for unusual circumstances or issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Use consistent name spelling for better tracking and autocomplete suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Review the activity log periodically to track key usage patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Keep key descriptions and keywords up to date in the admin panel</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <style>{`
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Documentation;
