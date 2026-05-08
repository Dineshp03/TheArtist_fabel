import { createClient } from '@supabase/supabase-js';

// Environment variables must be set up in your .env.local file.
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize the Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to a specific bucket in Supabase Storage.
 * 
 * @param bucketName The name of the storage bucket (e.g., 'products')
 * @param filePath The local path/name to save as in the bucket (e.g., 't-shirts/black-tee.png')
 * @param file The literal File object coming from an <input type="file" />
 * @returns The public URL of the uploaded image
 */
export const uploadProductImage = async (bucketName: string, filePath: string, file: File) => {
    // 1. Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // Overwrite if it already exists
        });

    if (error) {
        console.error("Supabase Storage Error:", error.message);
        throw error;
    }

    // 2. Get the Public URL to save in your database or JSON state
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

    return publicUrl;
};
