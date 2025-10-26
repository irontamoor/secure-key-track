import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KeyData {
  id: string;
  key_number: string;
  description: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: KeyData;
  action: "check_out" | "check_in";
  onSuccess: () => void;
}

export const BookingDialog = ({ open, onOpenChange, keyData, action, onSuccess }: BookingDialogProps) => {
  const [userName, setUserName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && userName.length > 1) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [userName, open]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("user_name")
        .ilike("user_name", `%${userName}%`)
        .limit(5);

      if (error) throw error;

      const uniqueNames = [...new Set(data?.map((b) => b.user_name) || [])];
      setSuggestions(uniqueNames);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("bookings").insert({
        key_id: keyData.id,
        user_name: userName.trim(),
        action: action,
      });

      if (error) throw error;

      toast.success(
        action === "check_out"
          ? `Key ${keyData.key_number} checked out successfully`
          : `Key ${keyData.key_number} checked in successfully`
      );

      setUserName("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to complete booking");
      console.error("Error creating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {action === "check_out" ? "Check Out" : "Check In"} Key
            </DialogTitle>
            <DialogDescription>
              Key: {keyData.key_number} - {keyData.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="off"
                required
              />
              
              {suggestions.length > 0 && (
                <div className="border rounded-md bg-popover">
                  {suggestions.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUserName(name);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : action === "check_out" ? "Check Out" : "Check In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
