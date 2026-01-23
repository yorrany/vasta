'use server';

// FACEBOOK LOGIN FLOW FOR INSTAGRAM BUSINESS
// Vasta uses Facebook Login to access Instagram Business Accounts
// The INSTAGRAM_CLIENT_ID env var should now hold the FACEBOOK APP ID
// The INSTAGRAM_CLIENT_SECRET env var should now hold the FACEBOOK APP SECRET

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveInstagramConnection } from '@/lib/instagram-service';

const FB_APP_ID = process.env.INSTAGRAM_CLIENT_ID; // Using env var designated for ID
const FB_APP_SECRET = process.env.INSTAGRAM_CLIENT_SECRET; // Using env var designated for Secret
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vasta.pro';
const REDIRECT_URI = `${APP_URL}/api/auth/instagram/callback`;

export async function initiateInstagramAuth() {
  if (!FB_APP_ID) {
    console.error('Missing INSTAGRAM_CLIENT_ID (FB App ID)');
    throw new Error('Configuração do Facebook Login ausente (App ID).');
  }

  // Scopes required for Instagram Business
  // instagram_basic: read profile and media
  // pages_show_list: list facebook pages to find the connected instagram account
  // business_management: sometimes needed, but let's try minimum first
  const scope = 'instagram_basic,pages_show_list,instagram_manage_insights,pages_read_engagement';
  const state = 'vasta_instagram_business_connect';
  
  // Facebook Login Dialog
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}&state=${state}&response_type=code`;

  console.log('--- FACEBOOK/INSTAGRAM AUTH DEBUG ---');
  console.log('FB App ID:', FB_APP_ID);
  console.log('Redirect URI:', REDIRECT_URI);
  console.log('Generated URL:', authUrl);
  console.log('-------------------------------------');

  return authUrl;
}

export async function processInstagramCallback(code: string) {
  if (!FB_APP_ID || !FB_APP_SECRET) {
    throw new Error('Configuração do Facebook App ausente.');
  }

  // 1. Exchange Code for Access Token (Facebook User Token)
  const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${FB_APP_SECRET}&code=${code}`;
  
  const tokenRes = await fetch(tokenUrl);
  if (!tokenRes.ok) {
    const error = await tokenRes.json();
    console.error('FB Token Error:', error);
    throw new Error('Falha ao obter token do Facebook.');
  }

  const tokenData = await tokenRes.json();
  const userAccessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in;

  // 2. Find Connected Instagram Business Account
  // We fetch the user's pages and check for an 'instagram_business_account' field
  const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${userAccessToken}`;
  
  const pagesRes = await fetch(pagesUrl);
  if (!pagesRes.ok) {
     const error = await pagesRes.json();
     console.error('FB Pages Error:', error);
     throw new Error(`Falha FB: ${error.error?.message || JSON.stringify(error)}`);
  }

  const pagesData = await pagesRes.json();
  const pages = pagesData.data || [];

  // Find the first page that has a connected Instagram Business Account
  const connectedPage = pages.find((p: any) => p.instagram_business_account);

  if (!connectedPage) {
    throw new Error('Nenhuma conta do Instagram Business encontrada vinculada às suas páginas do Facebook. Certifique-se de que sua conta do Instagram é Comercial/Criador e está vinculada a uma Página.');
  }

  const instagramAccount = connectedPage.instagram_business_account;
  const instagramId = instagramAccount.id;
  const username = instagramAccount.username;

  // 3. Get Long-Lived Page Token (Optional/Best Practice)
  // The user token is short-lived. We ideally want a long-lived PAGE token or User token. 
  // For simplicity V1, we save the User Access Token.
  // Note: For production SaaS, you should exchange this for a Long-Lived Token.
  
  // Exchange for Long-Lived User Token
  const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${userAccessToken}`;
  const longTokenRes = await fetch(longTokenUrl);
  const longTokenData = await longTokenRes.json();
  
  const finalToken = longTokenData.access_token || userAccessToken;

  // 4. Save to Database
  const supabase = await createClient();

  if (!supabase) {
    throw new Error('Falha ao inicializar cliente Supabase.');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário Vasta não autenticado.');
  }

  await saveInstagramConnection(user.id, {
    access_token: finalToken,
    user_id: instagramId, // This is the Instagram Business ID
    username: username,
    expires_in: longTokenData.expires_in || expiresIn
  });
  
  return { success: true, username };
}
