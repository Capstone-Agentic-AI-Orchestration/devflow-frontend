// Mock Supabase env vars — required because supabase-client.ts throws at module load if missing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000';

require('@testing-library/jest-dom');
