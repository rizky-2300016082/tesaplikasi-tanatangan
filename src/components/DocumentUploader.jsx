import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// PERUBAHAN DI SINI: Terima prop 'onUploadSuccess'
function DocumentUploader({ user, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [signerEmail, setSignerEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Data pengguna tidak ditemukan, silakan muat ulang halaman.');
      return;
    }
    if (!file || !signerEmail) {
      toast.error('Harap pilih file PDF dan masukkan email penerima.');
      return;
    }

    setUploading(true);
    try {
      const filePath = `public/${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: newDocument, error: insertError } = await supabase
        .from('documents')
        .insert({
          uploader_user_id: user.id, 
          signer_email: signerEmail,
          document_name: file.name,
          document_path: filePath,
          status: 'pending_signature',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newDocument) throw new Error("Gagal mendapatkan data dokumen baru.");

      // PERUBAHAN DI SINI: JALANKAN SEMUA LOGIKA SETELAH SUKSES
      // 1. Panggil fungsi dari Dashboard untuk me-refresh daftar dokumen
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // 2. Tampilkan notifikasi sukses
      toast.success('Dokumen berhasil diunggah! Mengarahkan ke editor...');
      
      // 3. Arahkan pengguna ke halaman editor
      navigate(`/document/${newDocument.id}/edit`);

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Terjadi kesalahan saat mengunggah dokumen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <h3>Upload Dokumen Baru</h3>
      <div>
        <label htmlFor="signerEmail" style={{ display: 'block', marginBottom: '0.5rem' }}>Email Penerima Tanda Tangan (User 2)</label>
        <input
          id="signerEmail"
          type="email"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          required
          placeholder="penerima@email.com"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div>
        <label htmlFor="pdfFile" style={{ display: 'block', marginBottom: '0.5rem' }}>Pilih Dokumen PDF</label>
        <input
          id="pdfFile"
          type="file"
          onChange={handleFileChange}
          accept="application/pdf"
          required
          disabled={uploading}
        />
      </div>
      <button type="submit" disabled={uploading || !user} style={{ padding: '10px' }}>
        {uploading ? 'Mengunggah...' : 'Upload Dokumen'}
      </button>
    </form>
  );
}

export default DocumentUploader;