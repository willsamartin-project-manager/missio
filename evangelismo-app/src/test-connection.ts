import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbzectccifyminsfxtgs.supabase.co';
const supabaseKey = 'sb_publishable_xqkvj9Z21gY6XP1RdvN_ug_kHILB4_3';

console.log('Testing connection with key:', supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const testEmail = `antigravity.test.${Date.now()}@gmail.com`;
        console.log('Attempting to sign up:', testEmail);

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: 'testpassword123',
        });

        if (error) {
            console.error('SignUp FAILED:', error.message);
        } else {
            console.log('SignUp SUCCESS!');
            console.log('User ID:', data.user?.id);
            console.log('Is New User:', data.user?.role === 'authenticated');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
