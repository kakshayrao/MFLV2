# Google OAuth Setup Guide

## ✅ What's Been Added

1. **Google OAuth Provider** added to NextAuth configuration
2. **Google Sign-in buttons** on both sign-in and sign-up pages
3. **Automatic account creation/linking** for Google users
4. **Database integration** - OAuth users are automatically created in your `accounts` table

## 🔧 Setup Steps

### 1. Verify Your Database Schema

Your `users` table already has the required `email` column (unique, not null) as per your schema. No changes needed!

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"
   - Copy your Client ID and Client Secret

### 3. Update Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

To generate a secure `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

### 4. Update Production Environment

Don't forget to add these same variables to your production environment (Vercel, etc.):
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 🔄 How It Works

### For New Users (OAuth Sign-up):
1. User clicks "Sign in/up with Google"
2. Google authenticates the user
3. System checks if email exists in `users` table
4. If new: Creates account with:
   - `username`: derived from email (before @)
   - `email`: from Google
   - `password_hash`: empty string (OAuth users don't need passwords)
   - `is_active`: true
5. User is signed in and redirected to dashboard

### For Existing Users (OAuth Sign-in):
1. User clicks "Sign in with Google"
2. Google authenticates the user
3. System finds existing account by email
4. User is signed in with their existing role and profile

### Mixed Authentication:
- Users can have both username/password AND OAuth
- OAuth users are matched by email
- Username/password users can add Google OAuth by using the same email

## 🎨 UI Updates

Both sign-in and sign-up pages now have:
- A clean divider with "Or continue with"
- Google sign-in button with official Google branding
- Smooth hover effects and proper accessibility

## 🔒 Security Notes

- OAuth users have `password: null` in the database
- Email is used to link OAuth accounts to existing users
- All authentication still goes through NextAuth's secure flow
- JWT tokens maintain session security

## 🧪 Testing

1. Start your dev server: `npm run dev`
2. Go to `/signin` or `/signup`
3. Click "Sign in with Google"
4. Authorize with Google
5. Check Supabase to see your new account created

## 📝 Database Schema

Your `users` table schema:
```sql
- user_id (uuid, primary key)
- username (varchar, unique, not null)
- email (varchar, unique, not null) -- REQUIRED for OAuth
- password_hash (varchar, not null) -- empty string for OAuth users
- phone (varchar, nullable)
- date_of_birth (date, nullable)
- gender (varchar, nullable)
- is_active (boolean, default true)
- created_by (uuid, nullable)
- created_date (timestamp with time zone)
- modified_by (uuid, nullable)
- modified_date (timestamp with time zone)
```

## 🚀 Next Steps

Optional enhancements you might want to add:
- Add more OAuth providers (Facebook, GitHub, etc.)
- Implement email verification
- Add profile completion flow for OAuth users
- Allow users to link multiple OAuth providers
- Add account settings page to manage connected accounts
