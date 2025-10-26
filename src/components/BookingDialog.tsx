import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyData } from "@/types/key";
import { MAX_NOTES_LENGTH, SUGGESTION_LIMIT } from "@/lib/constants";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyData: KeyData;
  action: "check_out" | "check_in";
  onSuccess: () => void;
}

export const BookingDialog = ({ open, onOpenChange, keyData, action, onSuccess }: BookingDialogProps) => {
  const [userName, setUserName] = useState("");
  const [givenTo, setGivenTo] = useState("");
  const [notes, setNotes] = useState("");
  const [userNameSuggestions, setUserNameSuggestions] = useState<string[]>([]);
  const [givenToSuggestions, setGivenToSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && userName.length > 1) {
      fetchUserNameSuggestions();
    } else {
      setUserNameSuggestions([]);
    }
  }, [userName, open]);

  useEffect(() => {
    if (open && givenTo.length > 1) {
      fetchGivenToSuggestions();
    } else {
      setGivenToSuggestions([]);
    }
  }, [givenTo, open]);

  const fetchUserNameSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("user_name")
        .ilike("user_name", `%${userName}%`)
        .limit(SUGGESTION_LIMIT);

      if (error) throw error;

      const uniqueNames = [...new Set(data?.map((b) => b.user_name) || [])];
      setUserNameSuggestions(uniqueNames);
    } catch (error) {
      console.error("Error fetching user name suggestions:", error);
    }
  };

  const fetchGivenToSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("given_to")
        .not("given_to", "is", null)
        .ilike("given_to", `%${givenTo}%`)
        .limit(SUGGESTION_LIMIT);

      if (error) throw error;

      const uniqueNames = [...new Set(data?.map((b) => b.given_to).filter(Boolean) || [])];
      setGivenToSuggestions(uniqueNames);
    } catch (error) {
      console.error("Error fetching given to suggestions:", error);
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
        given_to: givenTo.trim() || null,
        notes: notes.trim() || null,
        action: action,
      });

      if (error) throw error;

      toast.success(
        action === "check_out"
          ? `Key ${keyData.key_number} checked out successfully`
          : `Key ${keyData.key_number} checked in successfully`
      );

      setUserName("");
      setGivenTo("");
      setNotes("");
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
              
              {userNameSuggestions.length > 0 && (
                <div className="border rounded-md bg-popover">
                  {userNameSuggestions.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUserName(name);
                        setUserNameSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="givenTo">
                {action === "check_out" ? "Given To (recipient)" : "Returned By"}
              </Label>
              <Input
                id="givenTo"
                value={givenTo}
                onChange={(e) => setGivenTo(e.target.value)}
                placeholder={action === "check_out" ? "Who is receiving the key?" : "Who is returning the key?"}
                autoComplete="off"
              />
              
              {givenToSuggestions.length > 0 && (
                <div className="border rounded-md bg-popover">
                  {givenToSuggestions.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setGivenTo(name);
                        setGivenToSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Purpose, expected return time, etc."
                maxLength={MAX_NOTES_LENGTH}
              />
              <p className="text-xs text-muted-foreground">{notes.length}/{MAX_NOTES_LENGTH} characters</p>
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
