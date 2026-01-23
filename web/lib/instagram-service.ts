import { createClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import crypto from 'crypto';

// --- Types ---

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string; // For videos
  permalink: string;
  timestamp: string;
  username: string;
  // Merged fields
  custom_link?: string;
}

interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
  expires_in?: number;
}

interface UserAccessToken {
  access_token: string;
}

// --- Encryption Helper ---

const ENCRYPTION_KEY = process.env.INSTAGRAM_CLIENT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'default-secret-key-change-me'; // Fallback for dev
const IV_LENGTH = 16;

function encrypt(text: string): string {
  // Simple encryption for demo purposes. In production, use a dedicated KMS or stronger key management.
  // Using AES-256-CBC
  // Key must be 32 bytes (256 bits). If string is shorter/longer, we might need to hash it.
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substr(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// --- Instagram Service ---

// cached fetch for Instagram API (Business/Graph API)
const fetchInstagramMedia = async (accessToken: string, instagramBusinessId: string, vastaUserId: string) => {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username';
  // Use graph.facebook.com for Business Accounts, NOT graph.instagram.com (Basic Display)
  let proofParam = '';
  if (process.env.INSTAGRAM_CLIENT_SECRET) {
    const proof = crypto.createHmac('sha256', process.env.INSTAGRAM_CLIENT_SECRET).update(accessToken).digest('hex');
    proofParam = `&appsecret_proof=${proof}`;
  }
  
  const url = `https://graph.facebook.com/v19.0/${instagramBusinessId}/media?fields=${fields}&access_token=${accessToken}&limit=9${proofParam}`;

  // DEBUG LOGS
  console.log('[Instagram Service] Media Fetch URL:', url);

  const res = await fetch(url, {
    next: { 
      revalidate: 14400, // 4 hours
      tags: [`instagram-${vastaUserId}`] 
    }
  } as any);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('[Instagram Service] API Error Status:', res.status);
    console.error('[Instagram Service] API Error Body:', errorBody);
    throw new Error(`Failed to fetch Instagram media: ${res.status}`);
  }

  const data = await res.json();
  console.log('[Instagram Service] Media Response Data (count):', data.data?.length);
  if (data.data?.length === 0) {
      console.log('[Instagram Service] Full Response Body:', JSON.stringify(data));
  }
  
  return data.data as InstagramMedia[];
};

export async function getInstagramFeed(userId: string): Promise<InstagramMedia[] | null> {
  // Use Service Role to bypass RLS, because this might be called by a public visitor checking a profile
  // and the 'instagram_connections' table is likely private to the user.
  let supabase;
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createClientJS } = require('@supabase/supabase-js');
      supabase = createClientJS(
          process.env.NEXT_PUBLIC_SUPABASE_URL, 
          process.env.SUPABASE_SERVICE_ROLE_KEY
      );
  } else {
      supabase = await createClient();
  }
  
  if (!supabase) {
    console.error('Supabase client failed to initialize in getInstagramFeed');
    return null;
  }

  // Debug Log
  console.log(`[Instagram Service] Fetching feed for user: ${userId}`);

  // 1. Get Connection Details with Token (Bypassing RLS if using Service Role)
  const { data: connection, error: dbError } = await supabase
    .from('instagram_connections')
    .select('access_token, instagram_user_id')
    .eq('user_id', userId)
    .single();

  if (dbError || !connection) {
    const isAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[Instagram Service] No connection found or DB Error:', dbError, 'Is Admin:', isAdmin);
    
    // If error is "PGRST116" (JSON object), it means no rows (not found).
    if (dbError && dbError.code !== 'PGRST116') {
         throw new Error(`Database Error: ${dbError.message} (Admin: ${isAdmin})`);
    }
    // If just not found (or hidden by RLS)
    throw new Error(`Connection not found for user ${userId}. (Admin Mode: ${isAdmin}). If false, RLS is hiding it.`);
  }

  // ... rest of the function remains same ...
  console.log('[Instagram Service] Connection found. ID:', connection.instagram_user_id);

  try {
    const decryptedToken = decrypt(connection.access_token);

    // 2. Fetch Media from Instagram (Cached via fetch)
    const mediaItems = await fetchInstagramMedia(decryptedToken, connection.instagram_user_id, userId);

    // 3. Fetch Custom Links from Supabase
    const { data: links } = await supabase
      .from('instagram_post_links')
      .select('instagram_media_id, target_url')
      .eq('user_id', userId);

    // 4. Merge Data
    const linkMap = new Map(links?.map((l: any) => [l.instagram_media_id, l.target_url]) || []);

    const mergedMedia = mediaItems.map(item => ({
      ...item,
      custom_link: linkMap.get(item.id) || undefined
    }));

    return mergedMedia;

  } catch (error) {
    console.error('[Instagram Service] Error getting Instagram feed:', error);
    // Throw error so UI sees distinct message instead of generic "empty"
    throw error;
  }
}

export async function saveInstagramConnection(
  userId: string, 
  authData: { 
    access_token: string; 
    user_id: string; 
    username?: string; 
    expires_in?: number 
  }
) {
  const supabase = await createClient();
  
  const encryptedToken = encrypt(authData.access_token);
  const expiresAt = authData.expires_in 
    ? new Date(Date.now() + authData.expires_in * 1000).toISOString()
    : undefined;

  const { error } = await supabase
    .from('instagram_connections')
    .upsert({
      user_id: userId,
      instagram_user_id: authData.user_id,
      username: authData.username,
      access_token: encryptedToken,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
}

export async function getInstagramSettings(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('instagram_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return data;
}

export async function updateInstagramSettings(userId: string, settings: { display_mode: string }) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('instagram_settings')
        .upsert({
            user_id: userId,
            ...settings
        });
    
    if (error) throw error;
}

export async function disconnectInstagram(userId: string) {
    const supabase = await createClient();
    await supabase.from('instagram_connections').delete().eq('user_id', userId);
    await supabase.from('instagram_post_links').delete().eq('user_id', userId);
    // Optional: Keep settings? Or delete? keeping settings is safer.
}
