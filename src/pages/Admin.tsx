import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Key {
  id: string;
  key_number: string;
  description: string;
  keywords: string[];
  keyboard_shortcut: string | null;
  status: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<Key[]>([]);
  const [formData, setFormData] = useState({
    key_number: "",
    description: "",
    keywords: "",
    keyboard_shortcut: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const keywordsArray = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const { error } = await supabase.from("keys").insert({
        key_number: formData.key_number,
        description: formData.description,
        keywords: keywordsArray,
        keyboard_shortcut: formData.keyboard_shortcut || null,
      });

      if (error) throw error;

      toast.success("Key added successfully");
      setFormData({
        key_number: "",
        description: "",
        keywords: "",
        keyboard_shortcut: "",
      });
      fetchKeys();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("A key with this number already exists");
      } else {
        toast.error("Failed to add key");
      }
      console.error("Error adding key:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, keyNumber: string) => {
    if (!confirm(`Are you sure you want to delete key ${keyNumber}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("keys").delete().eq("id", id);

      if (error) throw error;

      toast.success("Key deleted successfully");
      fetchKeys();
    } catch (error) {
      toast.error("Failed to delete key");
      console.error("Error deleting key:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Key Management Admin</h1>
            <p className="text-muted-foreground mt-1">Add, edit, and manage keys</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Back to Keys
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Key</CardTitle>
            <CardDescription>Create a new key entry in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key_number">Key Number *</Label>
                  <Input
                    id="key_number"
                    value={formData.key_number}
                    onChange={(e) =>
                      setFormData({ ...formData, key_number: e.target.value })
                    }
                    placeholder="e.g., K001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyboard_shortcut">Keyboard Shortcut</Label>
                  <Input
                    id="keyboard_shortcut"
                    value={formData.keyboard_shortcut}
                    onChange={(e) =>
                      setFormData({ ...formData, keyboard_shortcut: e.target.value })
                    }
                    placeholder="e.g., Ctrl+K"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this key is for"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder="e.g., office, main door, entrance"
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? "Adding..." : "Add Key"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Keys ({keys.length})</CardTitle>
            <CardDescription>Manage your key inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keys.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No keys added yet. Create your first key above.
                </p>
              ) : (
                keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{key.key_number}</span>
                        <Badge variant={key.status === "available" ? "success" : "warning"}>
                          {key.status}
                        </Badge>
                        {key.keyboard_shortcut && (
                          <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                            {key.keyboard_shortcut}
                          </kbd>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{key.description}</p>
                      {key.keywords && key.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {key.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(key.id, key.key_number)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
