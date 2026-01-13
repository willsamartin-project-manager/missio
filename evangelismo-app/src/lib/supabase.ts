import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbzectccifyminsfxtgs.supabase.co';
const supabaseKey = 'sb_publishable_xqkvj9Z21gY6XP1RdvN_ug_kHILB4_3';

export const supabase = createClient(supabaseUrl, supabaseKey);
