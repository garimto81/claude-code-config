import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/shared/utils/supabase';
import type { Profile } from '@/shared/types/models';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  needsEmailConfirmation: boolean;
  confirmationEmail: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearConfirmation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      needsEmailConfirmation: false,
      confirmationEmail: null,

      initialize: async () => {
        // 이미 초기화되었으면 건너뛰기
        if (get().isInitialized) return;

        try {
          set({ isLoading: true, error: null });

          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          if (session) {
            // Fetch profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Profile error:', profileError);

              // profiles 테이블이 없는 경우 임시 프로필 생성
              if (profileError.code === 'PGRST116' || profileError.message.includes('relation')) {
                console.warn('Profiles table not found, creating temporary profile');
                const tempProfile: Profile = {
                  id: session.user.id,
                  email: session.user.email!,
                  role: 'logger',
                  display_name: session.user.user_metadata?.display_name ||
                                session.user.user_metadata?.full_name ||
                                session.user.email?.split('@')[0] || 'User',
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                set({ user: tempProfile, session, isLoading: false, isInitialized: true });
                return;
              }

              throw profileError;
            }

            set({ user: profile, session, isLoading: false, isInitialized: true });
          } else {
            set({ user: null, session: null, isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('Initialize error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to initialize auth';

          set({
            error: errorMessage,
            isLoading: false,
            isInitialized: true,
            user: null,
            session: null,
          });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null, needsEmailConfirmation: false, confirmationEmail: null });

          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            // Check if email is not confirmed
            if (signInError.message.includes('Email not confirmed') ||
                signInError.message.includes('email_not_confirmed')) {
              set({
                needsEmailConfirmation: true,
                confirmationEmail: email,
                isLoading: false,
                error: null,
              });
              return;
            }
            throw signInError;
          }

          // Check if user email is confirmed
          if (data.user && !data.user.email_confirmed_at) {
            set({
              needsEmailConfirmation: true,
              confirmationEmail: email,
              isLoading: false,
              error: null,
            });
            return;
          }

          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);

            // profiles 테이블이 없는 경우 임시 프로필 생성
            if (profileError.code === 'PGRST116' || profileError.message.includes('relation')) {
              const tempProfile: Profile = {
                id: data.user.id,
                email: data.user.email!,
                role: 'logger',
                display_name: data.user.user_metadata?.display_name ||
                              data.user.email?.split('@')[0] || 'User',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              set({
                user: tempProfile,
                session: data.session,
                isLoading: false,
                isInitialized: true,
                needsEmailConfirmation: false,
                confirmationEmail: null,
              });
              return;
            }

            throw profileError;
          }

          set({
            user: profile,
            session: data.session,
            isLoading: false,
            isInitialized: true,
            needsEmailConfirmation: false,
            confirmationEmail: null,
          });
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            user: null,
            session: null,
            needsEmailConfirmation: false,
            confirmationEmail: null,
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          });

          if (error) throw error;

          // Supabase will handle the redirect
          // isLoading stays true until redirect completes
        } catch (error) {
          console.error('Google login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Google login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({ user: null, session: null, isLoading: false, isInitialized: true });
        } catch (error) {
          console.error('Logout error:', error);
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      clearConfirmation: () => set({ needsEmailConfirmation: false, confirmationEmail: null }),
    }),
    {
      name: 'vtc-auth-storage',
      partialize: (state) => ({
        user: state.user,
        // Don't persist session, isLoading, isInitialized, error, needsEmailConfirmation, confirmationEmail (security & state management)
      }),
    }
  )
);
