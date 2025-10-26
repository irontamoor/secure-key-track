import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Key, User, Search, FileText, UserCheck, Plus, Edit2, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InfoButton } from "./InfoButton";
import { BOOKING_LIMIT } from "@/lib/constants";

interface Booking {
  id: string;
  user_name: string;
  given_to: string | null;
  notes: string | null;
  action: "check_in" | "check_out" | "key_created" | "key_updated" | "key_deleted";
  timestamp: string;
  changed_fields?: string[] | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  keys: {
    key_number: string;
    description: string;
  } | null;
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
      const action = booking.action?.toLowerCase() || "";
      const changedFields = booking.changed_fields?.join(" ").toLowerCase() || "";

      return (
        userName.includes(query) ||
        givenTo.includes(query) ||
        keyNumber.includes(query) ||
        keyDescription.includes(query) ||
        notes.includes(query) ||
        action.includes(query) ||
        changedFields.includes(query)
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
        .limit(BOOKING_LIMIT);

      if (error) throw error;
      setBookings((data || []) as Booking[]);
      setFilteredBookings((data || []) as Booking[]);
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
        <div className="flex items-center gap-2">
          <CardTitle>Recent Activity</CardTitle>
          <InfoButton content="Search across all transactions - filter by person names, key numbers, or notes. All check-ins and check-outs are logged here." />
        </div>
        <CardDescription>Complete audit trail of all key transactions</CardDescription>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by person, key, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 focus:ring-2 focus:ring-primary/20 transition-all"
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
            filteredBookings.map((booking) => {
              const getBadgeVariant = () => {
                switch (booking.action) {
                  case "check_out": return "warning";
                  case "check_in": return "success";
                  case "key_created": return "default";
                  case "key_updated": return "secondary";
                  case "key_deleted": return "destructive";
                  default: return "outline";
                }
              };

              const getBadgeLabel = () => {
                switch (booking.action) {
                  case "check_out": return "OUT";
                  case "check_in": return "IN";
                  case "key_created": return "CREATED";
                  case "key_updated": return "EDITED";
                  case "key_deleted": return "DELETED";
                  default: return booking.action;
                }
              };

              const getIcon = () => {
                switch (booking.action) {
                  case "key_created": return <Plus className="h-4 w-4" />;
                  case "key_updated": return <Edit2 className="h-4 w-4" />;
                  case "key_deleted": return <Trash className="h-4 w-4" />;
                  default: return <Key className="h-4 w-4 text-primary" />;
                }
              };

              return (
                <div
                  key={booking.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-200 space-y-2 animate-slide-in hover-scale"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant={getBadgeVariant()}>
                      {getBadgeLabel()}
                    </Badge>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Key Information */}
                      {booking.keys && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {getIcon()}
                          <span>{booking.keys.key_number}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="truncate">{booking.keys.description}</span>
                        </div>
                      )}

                      {/* For deleted keys, show key info from old_values */}
                      {booking.action === "key_deleted" && !booking.keys && booking.old_values && (
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Trash className="h-4 w-4 text-destructive" />
                          <span>{booking.old_values.key_number}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="truncate">{booking.old_values.description}</span>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {/* User Name */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="font-medium">
                            {booking.action === "check_out" ? "Checked out by:" : 
                             booking.action === "check_in" ? "Checked in by:" :
                             booking.action === "key_created" ? "Created by:" :
                             booking.action === "key_updated" ? "Edited by:" :
                             booking.action === "key_deleted" ? "Deleted by:" : "By:"}
                          </span>
                          <span>{booking.user_name}</span>
                        </div>
                        
                        {/* Given To / Returned By */}
                        {booking.given_to && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <UserCheck className="h-3 w-3" />
                            <span className="font-medium">
                              {booking.action === "check_out" ? "Given to:" : "Returned by:"}
                            </span>
                            <span>{booking.given_to}</span>
                          </div>
                        )}

                        {/* Field Changes for Updates */}
                        {booking.action === "key_updated" && booking.changed_fields && booking.changed_fields.length > 0 && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/30 p-2 rounded">
                            <Edit2 className="h-3 w-3 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-medium">Changed fields:</span>
                              <div className="mt-1 space-y-1">
                                {booking.changed_fields.map((field, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className="font-semibold">{field}:</span>{" "}
                                    <span className="line-through text-muted-foreground/70">
                                      {JSON.stringify(booking.old_values?.[field]) || "null"}
                                    </span>
                                    {" → "}
                                    <span className="text-primary font-medium">
                                      {JSON.stringify(booking.new_values?.[field]) || "null"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Notes */}
                        {booking.notes && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3 mt-0.5" />
                            <span className="font-medium">Notes:</span>
                            <span className="flex-1">{booking.notes}</span>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(booking.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          
          )}
        </div>
      </CardContent>
    </Card>
  );
};
