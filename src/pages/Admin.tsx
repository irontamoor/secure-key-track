import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, MapPin, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageGallery } from "@/components/ImageGallery";

interface Key {
  id: string;
  key_number: string;
  description: string;
  keywords: string[];
  status: string;
  location?: string | null;
  additional_notes?: string | null;
  image_urls?: string[] | null;
}

interface FormData {
  key_number: string;
  description: string;
  keywords: string;
  location: string;
  additional_notes: string;
  image_urls: string[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [formData, setFormData] = useState<FormData>({
    key_number: "",
    description: "",
    keywords: "",
    location: "",
    additional_notes: "",
    image_urls: [],
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

      const keyData = {
        key_number: formData.key_number,
        description: formData.description,
        keywords: keywordsArray,
        location: formData.location || null,
        additional_notes: formData.additional_notes || null,
        image_urls: formData.image_urls,
      };

      if (editingKey) {
        const { error } = await supabase
          .from("keys")
          .update(keyData)
          .eq("id", editingKey.id);

        if (error) throw error;
        toast.success("Key updated successfully");
        setEditingKey(null);
      } else {
        const { error } = await supabase.from("keys").insert([keyData]);

        if (error) {
          if (error.code === "23505") {
            toast.error("A key with this number already exists");
            setIsSubmitting(false);
            return;
          }
          throw error;
        }
        toast.success("Key added successfully");
      }

      setFormData({
        key_number: "",
        description: "",
        keywords: "",
        location: "",
        additional_notes: "",
        image_urls: [],
      });
      fetchKeys();
    } catch (error: any) {
      toast.error(editingKey ? "Failed to update key" : "Failed to add key");
      console.error("Error saving key:", error);
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

  const handleEdit = (key: Key) => {
    setEditingKey(key);
    setFormData({
      key_number: key.key_number,
      description: key.description,
      keywords: key.keywords?.join(", ") || "",
      location: key.location || "",
      additional_notes: key.additional_notes || "",
      image_urls: key.image_urls || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setFormData({
      key_number: "",
      description: "",
      keywords: "",
      location: "",
      additional_notes: "",
      image_urls: [],
    });
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
            <CardTitle>{editingKey ? "Edit Key" : "Add New Key"}</CardTitle>
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Main Office, Storage Room B"
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

              <div className="space-y-2">
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, additional_notes: e.target.value })
                  }
                  placeholder="Any extra information about this key"
                  rows={3}
                />
              </div>

              <ImageUpload
                keyId={editingKey?.id || "temp"}
                existingImages={formData.image_urls}
                onImagesChange={(images) =>
                  setFormData({ ...formData, image_urls: images })
                }
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting
                    ? "Saving..."
                    : editingKey
                    ? "Update Key"
                    : "Add Key"}
                </Button>
                {editingKey && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Keys ({keys.length})</CardTitle>
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
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{key.key_number}</span>
                        <Badge variant={key.status === "available" ? "success" : "warning"}>
                          {key.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{key.description}</p>
                      {key.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{key.location}</span>
                        </div>
                      )}
                      {key.keywords && key.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {key.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {key.additional_notes && (
                        <p className="text-sm text-muted-foreground italic">
                          {key.additional_notes}
                        </p>
                      )}
                      {key.image_urls && key.image_urls.length > 0 && (
                        <div className="pt-2">
                          <ImageGallery images={key.image_urls} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(key)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(key.id, key.key_number)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
