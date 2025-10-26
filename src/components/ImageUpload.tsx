import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  keyId: string;
  existingImages: string[];
  onImagesChange: (images: string[]) => void;
}

export const ImageUpload = ({ keyId, existingImages, onImagesChange }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImageUrls: string[] = [];

    for (const file of Array.from(files)) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        continue;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${keyId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('key-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('key-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    const updatedImages = [...images, ...newImageUrls];
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setUploading(false);
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/key-images/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage.from('key-images').remove([filePath]);
      }

      const updatedImages = images.filter(img => img !== imageUrl);
      setImages(updatedImages);
      onImagesChange(updatedImages);

      toast({
        title: "Image removed",
        description: "Image has been deleted successfully",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Key Images</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Key image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border-2 border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(imageUrl)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "Click to upload images"}
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WEBP (max 5MB each)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
