import { supabase } from "@/integrations/supabase/client";
import type { Key } from "@/types/key";

/**
 * Compute the differences between old and new key data
 */
const computeFieldDifferences = (
  oldData: Partial<Key>,
  newData: Partial<Key>
): { changed_fields: string[]; old_values: Record<string, any>; new_values: Record<string, any> } => {
  const changed_fields: string[] = [];
  const old_values: Record<string, any> = {};
  const new_values: Record<string, any> = {};

  const fieldsToCheck: (keyof Key)[] = [
    "key_number",
    "description",
    "location",
    "keywords",
    "additional_notes",
    "image_urls",
  ];

  for (const field of fieldsToCheck) {
    const oldValue = oldData[field];
    const newValue = newData[field];

    // Compare values (handle arrays specially)
    const isEqual = Array.isArray(oldValue) && Array.isArray(newValue)
      ? JSON.stringify(oldValue.sort()) === JSON.stringify(newValue.sort())
      : oldValue === newValue;

    if (!isEqual) {
      changed_fields.push(field);
      old_values[field] = oldValue;
      new_values[field] = newValue;
    }
  }

  return { changed_fields, old_values, new_values };
};

/**
 * Log when a new key is created
 */
export const logKeyCreated = async (
  keyId: string,
  keyData: Partial<Key>,
  userName: string
): Promise<void> => {
  try {
    const { error } = await supabase.from("bookings").insert({
      key_id: keyId,
      user_name: userName,
      action: "key_created",
      new_values: keyData,
      notes: "Key created in the system",
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to log key creation:", error);
  }
};

/**
 * Log when a key is updated
 */
export const logKeyUpdated = async (
  keyId: string,
  oldData: Partial<Key>,
  newData: Partial<Key>,
  userName: string
): Promise<void> => {
  try {
    const { changed_fields, old_values, new_values } = computeFieldDifferences(oldData, newData);

    if (changed_fields.length === 0) {
      return; // No changes to log
    }

    const { error } = await supabase.from("bookings").insert({
      key_id: keyId,
      user_name: userName,
      action: "key_updated",
      changed_fields,
      old_values,
      new_values,
      notes: `Updated ${changed_fields.join(", ")}`,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to log key update:", error);
  }
};

/**
 * Log when a key is deleted
 */
export const logKeyDeleted = async (
  keyId: string,
  keyData: Partial<Key>,
  userName: string
): Promise<void> => {
  try {
    const { error } = await supabase.from("bookings").insert({
      key_id: keyId,
      user_name: userName,
      action: "key_deleted",
      old_values: keyData,
      notes: `Key ${keyData.key_number} deleted from the system`,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to log key deletion:", error);
  }
};