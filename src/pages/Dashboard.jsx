import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DocumentUploader from '../components/DocumentUploader';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('uploader_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchDocuments(user.id);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) {
    return <div>Memuat data pengguna...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1024px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <h1>Dashboard</h1>
        <div>
          <span>Login sebagai: <strong>{user.email}</strong></span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
        </div>
      </header>
      
      <main style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', marginTop: '2rem' }}>
        <section style={{ flex: 1, minWidth: '300px' }}>
          {/* PERUBAHAN DI SINI: Kita berikan fungsi fetchDocuments sebagai prop onUploadSuccess */}
          <DocumentUploader user={user} onUploadSuccess={() => fetchDocuments(user.id)} />
        </section>

        <section style={{ flex: 2, minWidth: '400px' }}>
          <h2>Dokumen Saya</h2>
          {loading ? (
            <p>Memuat dokumen...</p>
          ) : documents.length === 0 ? (
            <p>Anda belum mengunggah dokumen apapun.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {documents.map((doc) => (
                <li key={doc.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{doc.document_name}</p>
                  <p style={{ margin: 0, fontSize: '0.9em' }}>Penerima: {doc.signer_email}</p>
                   <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8em', color: '#666' }}>
                    Status: <span style={{ background: '#ffc107', padding: '2px 6px', borderRadius: '4px' }}>{doc.status}</span>
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8em', color: '#666' }}>
                    Diunggah pada: {new Date(doc.created_at).toLocaleDateString('id-ID')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;