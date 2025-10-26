import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, MapPin, Home } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageGallery } from "@/components/ImageGallery";
import { InfoButton } from "@/components/InfoButton";
import { z } from "zod";
import type { Key } from "@/types/key";
import { logKeyCreated, logKeyUpdated, logKeyDeleted } from "@/lib/activityLogger";

const keySchema = z.object({
  key_number: z.string().trim().min(1, "Key number is required").max(50, "Key number too long"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description too long"),
  location: z.string().trim().max(200, "Location too long").optional(),
  keywords: z.string().trim().max(500, "Keywords too long").optional(),
  additional_notes: z.string().trim().max(1000, "Notes too long").optional(),
  admin_name: z.string().trim().min(1, "Your name is required for logging").max(100, "Name too long"),
});

interface FormData {
  key_number: string;
  description: string;
  keywords: string;
  location: string;
  additional_notes: string;
  image_urls: string[];
  admin_name: string;
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
    admin_name: localStorage.getItem("admin_name") || "",
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = keySchema.parse({
        key_number: formData.key_number,
        description: formData.description,
        location: formData.location,
        keywords: formData.keywords,
        additional_notes: formData.additional_notes,
        admin_name: formData.admin_name,
      });

      setIsSubmitting(true);

      // Save admin name to localStorage for convenience
      localStorage.setItem("admin_name", validatedData.admin_name);

      const keywordsArray = validatedData.keywords
        ? validatedData.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];

      const keyData = {
        key_number: validatedData.key_number,
        description: validatedData.description,
        keywords: keywordsArray,
        location: validatedData.location || null,
        additional_notes: validatedData.additional_notes || null,
        image_urls: formData.image_urls,
      };

      if (editingKey) {
        // Fetch current key data before updating for logging
        const { data: oldKeyData } = await supabase
          .from("keys")
          .select("*")
          .eq("id", editingKey.id)
          .single();

        const { error } = await supabase
          .from("keys")
          .update(keyData)
          .eq("id", editingKey.id);

        if (error) throw error;

        // Log the update
        if (oldKeyData) {
          await logKeyUpdated(editingKey.id, oldKeyData, keyData, validatedData.admin_name);
        }

        toast.success("Key updated successfully");
        setEditingKey(null);
      } else {
        const { data: newKey, error } = await supabase
          .from("keys")
          .insert([keyData])
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            toast.error("A key with this number already exists");
            setIsSubmitting(false);
            return;
          }
          throw error;
        }

        // Log the creation
        if (newKey) {
          await logKeyCreated(newKey.id, keyData, validatedData.admin_name);
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
        admin_name: localStorage.getItem("admin_name") || "", // Keep admin name from localStorage
      });
      fetchKeys();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(editingKey ? "Failed to update key" : "Failed to add key");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, keyNumber: string) => {
    const adminName = formData.admin_name || prompt("Enter your name for the audit log:");
    
    if (!adminName) {
      toast.error("Admin name is required for logging");
      return;
    }

    if (!confirm(`Are you sure you want to delete key ${keyNumber}?`)) {
      return;
    }

    try {
      // Fetch key data before deletion for logging
      const { data: keyToDelete } = await supabase
        .from("keys")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("keys").delete().eq("id", id);
      if (error) throw error;

      // Log the deletion
      if (keyToDelete) {
        await logKeyDeleted(id, keyToDelete, adminName);
      }

      toast.success("Key deleted successfully");
      fetchKeys();
    } catch (error) {
      toast.error("Failed to delete key");
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
      admin_name: localStorage.getItem("admin_name") || "",
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
      admin_name: localStorage.getItem("admin_name") || "",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Key Management Admin</h1>
              <p className="text-muted-foreground mt-1">Add, edit, and manage keys</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="hover-scale">
            <Home className="h-4 w-4 mr-2" />
            Back to Keys
          </Button>
        </div>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{editingKey ? "Edit Key" : "Add New Key"}</CardTitle>
              <InfoButton content="Fill in key details. Key number is required and must be unique. Keywords help with searching. Upload photos for easier identification." />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_name">Your Name *</Label>
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={(e) =>
                      setFormData({ ...formData, admin_name: e.target.value })
                    }
                    placeholder="e.g., John Smith"
                    required
                    maxLength={100}
                  />
                </div>

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
                    maxLength={50}
                  />
                </div>
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
                  maxLength={200}
                />
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
                  maxLength={500}
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
                  maxLength={500}
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
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Key Images</Label>
                  <InfoButton content="Upload photos of the key for easier identification. Supports multiple images. Images are stored securely." />
                </div>
                <ImageUpload
                  keyId={editingKey?.id || "temp"}
                  existingImages={formData.image_urls}
                  onImagesChange={(images) =>
                    setFormData({ ...formData, image_urls: images })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1 hover-scale">
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
                    className="hover-scale"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Existing Keys ({keys.length})</CardTitle>
              <InfoButton content="All keys in the system. Click Edit to modify or Delete to remove. Status shows if a key is currently checked out." />
            </div>
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
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/5 transition-all duration-200 animate-slide-in hover-scale"
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
                        className="hover-scale"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(key.id, key.key_number)}
                        className="hover-scale"
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
