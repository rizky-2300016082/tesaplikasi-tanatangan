import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Import komponen PDF Viewer
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

// Import layout plugin untuk PDF Viewer
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function EditDocumentPage() {
  const { documentId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (docError) throw new Error(`Gagal mengambil data dokumen: ${docError.message}`);

        if (docData.document_path) {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(docData.document_path, 300);

          if (urlError) throw new Error(`Gagal membuat URL aman: ${urlError.message}`);

          setPdfUrl(urlData.signedUrl);
        } else {
          throw new Error("Path dokumen tidak ditemukan di database.");
        }
      } catch (err) {
        console.error('Error di halaman editor:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) fetchDocumentDetails();
  }, [documentId]);

  if (loading) return <div style={{ padding: '2rem' }}>Memuat data...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}><h1>Proses Gagal</h1><p>{error}</p></div>;
  if (!pdfUrl) return <div style={{ padding: '2rem' }}>Memuat pratinjau PDF...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/dashboard">&larr; Kembali ke Dashboard</Link>
      <h1>Editor Dokumen</h1>
      <hr />
      <div style={{ height: '800px' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      </div>
    </div>
  );
}

export default EditDocumentPage;
