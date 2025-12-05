import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getSupabase } from "@/lib/supabase";
import bcrypt from 'bcryptjs';
// Use bcryptjs to compare hashed passwords

const authOptions = {
  session: {
    strategy: "jwt" as const,
  },
  // Enable debug logging while diagnosing OAuth issues
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;
        const { data: user } = await getSupabase()
          .from("users")
          .select("user_id, username, password_hash, email")
          .eq("email", email)
          .maybeSingle();
        if (user && (user as any).password_hash) {
          const match = await bcrypt.compare(password, String((user as any).password_hash));
          if (match) {
            return { id: (user as any).user_id, name: (user as any).username, email: (user as any).email } as any;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("NextAuth signIn callback", { provider: account?.provider, profile });
      try {
      // Allow credentials login
      if (account?.provider === "credentials") {
        return true;
      }
      
      // Handle Google OAuth
      if (account?.provider === "google" && profile?.email) {
        const supabase = getSupabase();
        // Check if user exists with this email
        const { data: existingUser, error: existingError } = await supabase
          .from("users")
          .select("user_id, username, email, password_hash")
          .eq("email", profile.email)
          .maybeSingle();
        if (existingError) console.error('Supabase lookup error', existingError);
        
        if (existingUser) {
          // User exists, update user object for JWT
          user.id = (existingUser as any).user_id;
          user.name = (existingUser as any).username;
          user.email = (existingUser as any).email;
          user.needsProfileCompletion = !((existingUser as any).password_hash);
          return true;
        } else {
          // New user - create account
          const username = profile.email.split('@')[0].toLowerCase();
          const { data: newUser, error } = await supabase
            .from("users")
            .insert({
              username: username,
              email: profile.email,
              password_hash: '', // Empty for OAuth users - needs completion
              is_active: true,
            })
            .select("user_id, username, email")
            .single();

          if (error || !newUser) {
            console.error("Error creating OAuth user:", error);
            return false;
          }

          user.id = (newUser as any).user_id;
          user.name = (newUser as any).username;
          user.email = (newUser as any).email;
          user.needsProfileCompletion = true;
          return true;
        }
      }
      } catch (err) {
        console.error('Error in NextAuth signIn callback', err);
        return false;
      }
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      console.log('NextAuth jwt callback', { token: { ...token }, user });
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).name = (user as any).name;
        (token as any).email = (user as any).email;
        (token as any).needsProfileCompletion = (user as any).needsProfileCompletion || false;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log('NextAuth session callback', { session, token });
      (session as any).user = {
        id: String((token as any)?.id || ""),
        name: String((token as any)?.name ?? ""),
        email: String((token as any)?.email ?? ""),
        needsProfileCompletion: (token as any)?.needsProfileCompletion || false,
      };
      return session;
    },
  },
} as const;

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };


