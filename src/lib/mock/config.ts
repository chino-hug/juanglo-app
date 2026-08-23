// Mock mode turns on automatically when Supabase isn't configured, so the
// app runs with zero setup. Set NEXT_PUBLIC_SUPABASE_URL (see
// .env.local.example) to use a real project instead.
export const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;
