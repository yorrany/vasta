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
  
  if (!data.data || data.data.length === 0) {
      console.log('[Instagram Service] Instagram returned empty feed (user may have no posts)');
      return []; // Return empty array - valid state for accounts with no posts
  }
  
  return data.data as InstagramMedia[];
};

export async function getInstagramFeed(userId: string): Promise<InstagramMedia[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  let accessToken = '';
  let instagramUserId = '';

  // STRATEGY 1: Try Secure RPC (Best Practice for Public Feed)
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_instagram_connection_secure', { target_user_id: userId });

  if (!rpcError && rpcData && rpcData.length > 0) {
      accessToken = rpcData[0].access_token;
      instagramUserId = rpcData[0].instagram_user_id;
  } else {
      // STRATEGY 2: Fallback to Service Role (If RPC not created yet)
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { createClient: createClientJS } = require('@supabase/supabase-js');
          const adminSupabase = createClientJS(
              process.env.NEXT_PUBLIC_SUPABASE_URL, 
              process.env.SUPABASE_SERVICE_ROLE_KEY
          );
          const { data: adminData } = await adminSupabase
            .from('instagram_connections')
            .select('access_token, instagram_user_id')
            .eq('user_id', userId)
            .single();
          
          if (adminData) {
              accessToken = adminData.access_token;
              instagramUserId = adminData.instagram_user_id;
          }
      } 
      
      // STRATEGY 3: Try standard client (Works only if User is Self or RLS open)
      if (!accessToken) {
          const { data: stdData } = await supabase
            .from('instagram_connections')
            .select('access_token, instagram_user_id')
            .eq('user_id', userId)
            .single();
            
          if (stdData) {
              accessToken = stdData.access_token;
              instagramUserId = stdData.instagram_user_id;
          }
      }
  }

  if (!accessToken || !instagramUserId) {
    console.warn(`[Instagram] Connection not found for user ${userId}. RPC Failed: ${!!rpcError}. Admin Key Present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    return null;
  }

  try {
    const decryptedToken = decrypt(accessToken);
    const mediaItems = await fetchInstagramMedia(decryptedToken, instagramUserId, userId);

    const { data: links } = await supabase
      .from('instagram_post_links')
      .select('instagram_media_id, target_url')
      .eq('user_id', userId);

    const linkMap = new Map(links?.map((l: any) => [l.instagram_media_id, l.target_url]) || []);

    return mediaItems.map(item => ({
      ...item,
      custom_link: linkMap.get(item.id) || undefined
    }));

  } catch (error) {
    console.error('[Instagram Service] Error getting Instagram feed:', error);
    return []; // Return empty array on API error to avoid crashing page
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
