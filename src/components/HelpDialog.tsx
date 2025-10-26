import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Search, LogIn, LogOut, FileText, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Use the Key Management System</DialogTitle>
          <DialogDescription>
            A quick guide to managing and tracking keys efficiently
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Search Keys Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Search Keys</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Use the search bar to find keys by number, description, or keywords.
                All available keys will be displayed in a grid with their status.
              </p>
            </div>

            {/* Check Out Keys Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Check Out Keys</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Click on any available key card and select "Check Out". You'll need to provide:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li><strong>Your Name:</strong> The person checking out the key</li>
                <li><strong>Given To:</strong> Who is receiving the key (optional)</li>
                <li><strong>Notes:</strong> Purpose or additional context (optional)</li>
              </ul>
            </div>

            {/* Check In Keys Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Check In Keys</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Click on a checked-out key and select "Check In". Provide:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li><strong>Your Name:</strong> The person returning the key</li>
                <li><strong>Returned By:</strong> Who returned the key (optional)</li>
                <li><strong>Notes:</strong> Any observations or issues (optional)</li>
              </ul>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Recent Activity</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                View a complete audit log of all check-out and check-in transactions.
                Use the search bar to filter by person name, key number, or notes.
              </p>
            </div>

            {/* Autocomplete Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Smart Autocomplete</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                The system remembers previous names and will suggest them as you type,
                making repeat transactions faster and more consistent.
              </p>
            </div>

            {/* Admin Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Admin Access</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the "Admin" button in the header to manage keys, upload images,
                and configure the system.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
