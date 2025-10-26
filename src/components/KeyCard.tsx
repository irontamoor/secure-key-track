import { useState } from "react";
import { Key, User, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "./BookingDialog";
import { ImageGallery } from "./ImageGallery";

interface KeyData {
  id: string;
  key_number: string;
  description: string;
  keywords: string[];
  status: string;
  location?: string | null;
  additional_notes?: string | null;
  image_urls?: string[] | null;
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
          {keyData.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{keyData.location}</span>
            </div>
          )}

          {keyData.image_urls && keyData.image_urls.length > 0 && (
            <ImageGallery images={keyData.image_urls} />
          )}

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
          
          {keyData.additional_notes && (
            <div className="text-xs p-2 bg-muted/50 rounded">
              <span className="font-medium">Notes:</span> {keyData.additional_notes}
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
