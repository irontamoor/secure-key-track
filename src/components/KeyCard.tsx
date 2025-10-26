import { useState } from "react";
import { Key, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "./BookingDialog";

interface KeyData {
  id: string;
  key_number: string;
  description: string;
  keywords: string[];
  status: string;
  keyboard_shortcut: string | null;
}

interface KeyCardProps {
  keyData: KeyData;
  onUpdate: () => void;
}

export const KeyCard = ({ keyData, onUpdate }: KeyCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingAction, setBookingAction] = useState<"check_out" | "check_in">("check_out");

  const isAvailable = keyData.status === "available";

  const handleBooking = (action: "check_out" | "check_in") => {
    setBookingAction(action);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{keyData.key_number}</CardTitle>
            </div>
            <Badge variant={isAvailable ? "success" : "warning"}>
              {isAvailable ? "Available" : "Checked Out"}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">{keyData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {keyData.keywords && keyData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keyData.keywords.slice(0, 3).map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {keyData.keywords.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{keyData.keywords.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {keyData.keyboard_shortcut && (
            <div className="text-xs text-muted-foreground">
              Shortcut: <kbd className="px-1.5 py-0.5 bg-muted rounded">{keyData.keyboard_shortcut}</kbd>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {isAvailable ? (
              <Button
                onClick={() => handleBooking("check_out")}
                className="flex-1"
                size="sm"
              >
                <User className="h-4 w-4 mr-1" />
                Check Out
              </Button>
            ) : (
              <Button
                onClick={() => handleBooking("check_in")}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Check In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        keyData={keyData}
        action={bookingAction}
        onSuccess={onUpdate}
      />
    </>
  );
};
