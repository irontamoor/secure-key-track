import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Key, User, Search, FileText, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Booking {
  id: string;
  user_name: string;
  given_to: string | null;
  notes: string | null;
  action: string;
  timestamp: string;
  keys: {
    key_number: string;
    description: string;
  };
}

export const AuditLog = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, bookings]);

  const filterBookings = () => {
    if (!searchQuery.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = bookings.filter((booking) => {
      const userName = booking.user_name?.toLowerCase() || "";
      const givenTo = booking.given_to?.toLowerCase() || "";
      const keyNumber = booking.keys?.key_number?.toLowerCase() || "";
      const keyDescription = booking.keys?.description?.toLowerCase() || "";
      const notes = booking.notes?.toLowerCase() || "";

      return (
        userName.includes(query) ||
        givenTo.includes(query) ||
        keyNumber.includes(query) ||
        keyDescription.includes(query) ||
        notes.includes(query)
      );
    });

    setFilteredBookings(filtered);
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          keys (
            key_number,
            description
          )
        `)
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) throw error;
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      toast.error("Failed to load audit log");
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading audit log...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Complete audit trail of all key transactions</CardDescription>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by person, key, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredBookings.length} of {bookings.length} transactions
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchQuery ? "No transactions found matching your search" : "No activity yet"}
            </p>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors space-y-2"
              >
                <div className="flex items-start gap-3">
                  <Badge variant={booking.action === "check_out" ? "warning" : "success"}>
                    {booking.action === "check_out" ? "OUT" : "IN"}
                  </Badge>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Key className="h-4 w-4 text-primary" />
                      <span>{booking.keys?.key_number}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="truncate">{booking.keys?.description}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="font-medium">
                          {booking.action === "check_out" ? "Checked out by:" : "Checked in by:"}
                        </span>
                        <span>{booking.user_name}</span>
                      </div>
                      
                      {booking.given_to && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <UserCheck className="h-3 w-3" />
                          <span className="font-medium">
                            {booking.action === "check_out" ? "Given to:" : "Returned by:"}
                          </span>
                          <span>{booking.given_to}</span>
                        </div>
                      )}
                      
                      {booking.notes && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 mt-0.5" />
                          <span className="font-medium">Notes:</span>
                          <span className="flex-1">{booking.notes}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(booking.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
