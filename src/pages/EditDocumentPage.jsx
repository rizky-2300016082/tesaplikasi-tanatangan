import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

import { Worker, Viewer, defaultLayoutPlugin } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { useDrop } from 'react-dnd';
import SignatureBox from '../components/SignatureBox';

const ItemTypes = { BOX: 'box' };

function EditDocumentPage() {
  const { documentId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [boxPosition, setBoxPosition] = useState({ top: 100, left: 100 });

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.BOX,
    drop(item, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset();
      const left = Math.round(boxPosition.left + delta.x);
      const top = Math.round(boxPosition.top + delta.y);
      setBoxPosition({ top, left });
      return undefined;
    },
  }), [boxPosition]);

  const handleSavePosition = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ signature_coordinates: boxPosition })
        .eq('id', documentId);
      if (error) throw error;
      toast.success('Posisi tanda tangan berhasil disimpan!');
    } catch (error) {
      toast.error('Gagal menyimpan posisi: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('*, signature_coordinates')
          .eq('id', documentId)
          .single();
        if (docError) throw new Error(`Gagal mengambil data dokumen: ${docError.message}`);

        setDocumentData(docData);
        if (docData.signature_coordinates) {
          setBoxPosition(docData.signature_coordinates);
        }

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
  if (error) return <div style={{ padding: '2rem', color: 'red' }}><h1>Proses Gagal</h1><p>{error.message}</p></div>;
  if (!pdfUrl) return <div style={{ padding: '2rem' }}>Memuat pratinjau PDF...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link to="/dashboard">&larr; Kembali ke Dashboard</Link>
      <h1>Editor Posisi Tanda Tangan</h1>
      <p>Geser kotak merah ke posisi di mana Anda ingin penerima menandatangani.</p>
      <button onClick={handleSavePosition} disabled={isSaving}>
        {isSaving ? 'Menyimpan...' : 'Simpan Posisi TTD'}
      </button>
      <hr style={{ margin: '1rem 0' }} />
      <div ref={drop} style={{ position: 'relative', width: 'fit-content', margin: 'auto' }}>
        <SignatureBox top={boxPosition.top} left={boxPosition.left} />
        <div style={{ height: '800px', border: '1px solid black' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
          </Worker>
        </div>
      </div>
    </div>
  );
}

export default EditDocumentPage;