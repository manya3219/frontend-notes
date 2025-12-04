import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function PdfViewer() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFileDetails();
  }, [uuid]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/file');
      const files = response.data;
      const currentFile = files.find(f => f.uuid === uuid);
      
      if (currentFile) {
        setFile(currentFile);
      } else {
        setError('File not found');
      }
      setLoading(false);
    } catch (err) {
      setError('Error loading file');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const downloadUrl = API_URL ? `${API_URL}/file/download/${uuid}` : `/file/download/${uuid}`;
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${file?.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await axios.delete(`/api/file/delete/${uuid}`);
      
      console.log('Delete response:', response.data);
      
      // Navigate back to file list after successful deletion
      navigate('/filelist');
    } catch (error) {
      console.error('Error deleting file:', error.response?.data || error.message);
      alert(`Failed to delete file: ${error.response?.data?.error || error.message}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <Button onClick={() => navigate('/filelist')}>Back to Files</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                color="gray"
                onClick={() => navigate('/filelist')}
                size="sm"
              >
                ← Back
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {file?.title}
                </h1>
                {file?.folder && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    📁 {file.folder}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                gradientDuoTone="purpleToPink"
                onClick={handleDownload}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">⬇️ Download</span>
                <span className="sm:hidden">⬇️</span>
              </Button>
              {currentUser?.isAdmin && (
                <Button
                  color="failure"
                  onClick={handleDelete}
                  disabled={deleting}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  {deleting ? '...' : <><span className="hidden sm:inline">🗑️ Delete</span><span className="sm:hidden">🗑️</span></>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <iframe
            src={API_URL ? `${API_URL}/api/file/view/${uuid}` : `/api/file/view/${uuid}`}
            className="w-full h-[calc(100vh-150px)]"
            title={file?.title}
            style={{ border: 'none' }}
            onError={(e) => console.error('Iframe error:', e)}
          />
        </div>
        
        {/* Debug Info - Remove after testing */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>API_URL: {API_URL || '(empty - using relative URL)'}</p>
          <p>File UUID: {uuid}</p>
          <p>Full URL: {API_URL ? `${API_URL}/api/file/view/${uuid}` : `/api/file/view/${uuid}`}</p>
          <p>File Title: {file?.title}</p>
        </div>
      </div>
    </div>
  );
}
