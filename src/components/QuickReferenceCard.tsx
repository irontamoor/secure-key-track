import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, LogOut, LogIn, FileText, Settings } from "lucide-react";

export const QuickReferenceCard = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card className="print:shadow-none">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-bold">
            KEY MANAGEMENT SYSTEM - QUICK REFERENCE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Finding Keys */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Search className="h-5 w-5 text-primary" />
                  FINDING KEYS
                </div>
                <ul className="text-sm space-y-1 ml-7">
                  <li>• Search by key number, location, or keywords</li>
                  <li>• <span className="text-green-600 font-semibold">Green badge</span> = Available</li>
                  <li>• <span className="text-red-600 font-semibold">Red badge</span> = Checked Out</li>
                </ul>
              </div>

              {/* Check Out */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <LogOut className="h-5 w-5 text-primary" />
                  CHECK OUT A KEY
                </div>
                <ol className="text-sm space-y-1 ml-7">
                  <li>1. Click on an available key</li>
                  <li>2. Fill in:
                    <ul className="ml-4 mt-1 space-y-0.5">
                      <li>→ <strong>Your Name</strong> (who's checking it out)</li>
                      <li>→ <strong>Given To</strong> (who's receiving it) - Optional</li>
                      <li>→ <strong>Notes</strong> (purpose/context) - Optional</li>
                    </ul>
                  </li>
                  <li>3. Click "Check Out"</li>
                </ol>
              </div>

              {/* Check In */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <LogIn className="h-5 w-5 text-primary" />
                  CHECK IN A KEY
                </div>
                <ol className="text-sm space-y-1 ml-7">
                  <li>1. Click on a checked-out key</li>
                  <li>2. Fill in:
                    <ul className="ml-4 mt-1 space-y-0.5">
                      <li>→ <strong>Your Name</strong> (who's returning it)</li>
                      <li>→ <strong>Returned By</strong> (who brought it back) - Optional</li>
                      <li>→ <strong>Notes</strong> (any issues/observations) - Optional</li>
                    </ul>
                  </li>
                  <li>3. Click "Check In"</li>
                </ol>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* View Activity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  VIEW ACTIVITY
                </div>
                <ul className="text-sm space-y-1 ml-7">
                  <li>• Click "Recent Activity" tab</li>
                  <li>• Search by person name, key number, or notes</li>
                  <li>• See complete audit trail of all transactions</li>
                </ul>
              </div>

              {/* Tips */}
              <div className="space-y-2">
                <div className="font-semibold text-lg">💡 TIPS</div>
                <ul className="text-sm space-y-1 ml-7">
                  <li>• System remembers names for autocomplete</li>
                  <li>• Add notes to track key usage patterns</li>
                  <li>• Use "Given To" to track actual key recipients</li>
                  <li>• Always check in keys promptly</li>
                </ul>
              </div>

              {/* Admin */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  ADMIN
                </div>
                <ul className="text-sm space-y-1 ml-7">
                  <li>• Click "Admin" button to manage keys & images</li>
                  <li>• Add, edit, or delete keys from the system</li>
                </ul>
              </div>

              {/* Help */}
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm font-semibold">Need Help?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs mx-1">i</span> icon in the app header
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
