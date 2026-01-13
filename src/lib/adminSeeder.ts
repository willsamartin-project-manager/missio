import { supabase } from './supabase';

export const seedAdminUser = async () => {
    const ADMIN_EMAIL = 'admin@gmail.com';
    const ADMIN_PASSWORD = 'KT6MQ-cwu3J7ZKD';
    const SEED_KEY = 'admin_seeded';

    // Avoid running if already attempted in this browser session/storage to prevent spamming
    if (localStorage.getItem(SEED_KEY)) {
        return;
    }

    try {
        console.log('Attempting to seed default admin user...');

        // 1. Try to Sign Up
        const { data, error } = await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });

        if (error) {
            // User likely already exists, which is fine
            console.log('Admin seed info:', error.message);
            localStorage.setItem(SEED_KEY, 'true');
            return;
        }

        if (data.user) {
            console.log('Default admin user created. promoting to admin...');

            // 2. Promote to Admin and Approve
            // Note: This relies on the current RLS policy allowing users to update their own profiles
            // In a production env, this should be done via a secure backend function or migration script
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    role: 'admin',
                    approved: true
                })
                .eq('id', data.user.id);

            if (updateError) {
                console.error('Error promoting admin:', updateError);
            } else {
                console.log('Default admin successfully configured.');
            }

            // Mark as done
            localStorage.setItem(SEED_KEY, 'true');
        }

    } catch (err) {
        console.error('Unexpected error seeding admin:', err);
    }
};
