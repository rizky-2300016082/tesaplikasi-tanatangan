// src/pages/EditDocumentPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import SignatureBox from '../components/SignatureBox';

function EditDocumentPage() {
  const { documentId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signaturePos, setSignaturePos] = useState({ top: 200, left: 100 });
  const [saved, setSaved] = useState(false);

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

          if (docData.signature_coordinates) {
            setSignaturePos(docData.signature_coordinates);
          }
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

  const handleSave = async () => {
    const { error } = await supabase
      .from('documents')
      .update({ signature_coordinates: signaturePos })
      .eq('id', documentId);

    if (error) {
      alert('Gagal menyimpan koordinat: ' + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Memuat data...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}><h1>Proses Gagal</h1><p>{error}</p></div>;
  if (!pdfUrl) return <div style={{ padding: '2rem' }}>Memuat pratinjau PDF...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/dashboard">&larr; Kembali ke Dashboard</Link>
      <h1>Editor Dokumen</h1>
      <hr />

      <div style={{ position: 'relative', height: '800px', border: '1px solid #ccc', overflow: 'auto' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>

        <SignatureBox
          top={signaturePos.top}
          left={signaturePos.left}
          onMove={(newPos) => setSignaturePos(newPos)}
        />
      </div>

      <button onClick={handleSave} style={{ marginTop: '1rem' }}>
        Simpan Posisi
      </button>
      {saved && <p style={{ color: 'green' }}>Posisi berhasil disimpan!</p>}
    </div>
  );
}

export default EditDocumentPage;
