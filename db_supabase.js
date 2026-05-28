require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://xxxxxxxxxxxxxx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJh...';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
