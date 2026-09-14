import Config from 'react-native-config';

export const ENV = {
  SUPABASE_URL: Config.SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY ?? '',
  GOOGLE_WEB_CLIENT_ID: Config.GOOGLE_WEB_CLIENT_ID ?? '',
};

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Faltam SUPABASE_URL / SUPABASE_ANON_KEY no .env');
}
