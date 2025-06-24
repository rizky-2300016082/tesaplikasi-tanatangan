import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function AuthPage() {
  const navigate = useNavigate();

  // Cek jika sudah ada sesi, langsung redirect ke dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <h1>DocuSign App</h1>
      <p>Silakan login atau daftar untuk melanjutkan.</p>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']} // Contoh: mengizinkan login dengan Google
        theme="dark"
      />
    </div>
  );
}

export default AuthPage;