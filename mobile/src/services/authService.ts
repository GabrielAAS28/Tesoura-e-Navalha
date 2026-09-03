import {GoogleSignin} from '@react-native-google-signin/google-signin';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '~/services/supabase';
import {ENV} from '~/config/env';

GoogleSignin.configure({webClientId: ENV.GOOGLE_WEB_CLIENT_ID});

export async function signInWithGoogle(): Promise<Session | null> {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const idToken = userInfo.data?.idToken;
  if (!idToken) return null;
  const {data, error} = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data.session;
}

export async function sendPhoneOtp(phone: string) {
  const {error} = await supabase.auth.signInWithOtp({phone});
  if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const {data, error} = await supabase.auth.verifyOtp({phone, token, type: 'sms'});
  if (error) throw error;
  return data.session;
}

export async function signInWithPhonePassword(phone: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({phone, password});
  if (error) throw error;
  return data.session;
}

export async function signInWithEmailPassword(email: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({email, password});
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmailPassword(email: string, password: string, fullName: string) {
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {data: {full_name: fullName}},
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch {}
  await supabase.auth.signOut();
}
