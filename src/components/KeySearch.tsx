import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { KeyCard } from "./KeyCard";
import { toast } from "sonner";
import { Key } from "@/types/key";

export const KeySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [keys, setKeys] = useState<Key[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<Key[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKeys();
  }, []);

  useEffect(() => {
    filterKeys();
  }, [searchQuery, keys]);

  const fetchKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("keys")
        .select("*")
        .order("key_number");

      if (error) throw error;
      setKeys(data || []);
    } catch (error) {
      toast.error("Failed to load keys");
      console.error("Error fetching keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterKeys = () => {
    if (!searchQuery.trim()) {
      setFilteredKeys(keys);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = keys.filter((key) => {
      const matchesNumber = key.key_number.toLowerCase().includes(query);
      const matchesDescription = key.description.toLowerCase().includes(query);
      const matchesKeywords = key.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(query)
      );
      return matchesNumber || matchesDescription || matchesKeywords;
    });

    setFilteredKeys(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading keys...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by key number, description, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKeys.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No keys found matching your search" : "No keys available"}
            </p>
          </div>
        ) : (
          filteredKeys.map((key) => (
            <KeyCard key={key.id} keyData={key} onUpdate={fetchKeys} />
          ))
        )}
      </div>
    </div>
  );
};
