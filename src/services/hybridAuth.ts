import { supabase as supabaseClient } from './supabaseClient';
const supabase = supabaseClient as any;

export const initAuth = () => {
  // Supabase Auth listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { user } = session;
      
      // Sync user to Supabase users table
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.id) // Assuming firebase_uid is used for mapping
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user from Supabase:', fetchError);
        return;
      }

      if (!existingUser) {
        // Create new user in Supabase
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              firebase_uid: user.id,
              email: user.email || '',
              full_name: user.user_metadata.full_name || '',
              avatar_url: user.user_metadata.avatar_url || '',
              role: 'user'
            }
          ]);

        if (insertError) {
          console.error('Error creating user in Supabase:', insertError);
        }
      } else {
        // Update existing user if needed
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: user.email || '',
            full_name: user.user_metadata.full_name || '',
            avatar_url: user.user_metadata.avatar_url || '',
            updated_at: new Date().toISOString()
          })
          .eq('firebase_uid', user.id);

        if (updateError) {
          console.error('Error updating user in Supabase:', updateError);
        }
      }
    }
  });
  
  return subscription;
};
