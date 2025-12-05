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

  // Get viewable URL - Direct Cloudinary URL for best compatibility
  const getViewableUrl = () => {
    if (file?.image && file.image.includes('cloudinary')) {
      // For Cloudinary files, use direct URL
      return file.image;
    }
    // For local files, use backend proxy
    const baseUrl = API_URL || '';
    return `${baseUrl}/api/file/view/${uuid}`;
  };

  // Get file extension
  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  // Check if file can be previewed in browser
  const canPreview = (filename) => {
    const ext = getFileExtension(filename);
    return ['pdf', 'txt', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

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
    // For Cloudinary files, download directly from Cloudinary
    if (file?.image && file.image.includes('cloudinary')) {
      window.open(file.image, '_blank');
    } else {
      // For local files, use backend download route
      const downloadUrl = API_URL ? `${API_URL}/file/download/${uuid}` : `/file/download/${uuid}`;
      window.open(downloadUrl, '_blank');
    }
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

      {/* File Viewer */}
      <div className="max-w-7xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
            <p className="font-semibold">⚠️ {error}</p>
            <p className="text-sm mt-2">Please use the download button above to view the file.</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {file?.image && file.image.includes('cloudinary') ? (
            // Cloudinary files - Direct viewing with iframe
            (() => {
              const viewableUrl = getViewableUrl();
              const originalUrl = file.image;
              const isPdf = getFileExtension(file.title) === 'pdf';
              const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(getFileExtension(file.title));
              const canShowPreview = canPreview(file.title);
              
              return (
                <div className="flex flex-col h-full">
                  {/* Preview Area */}
                  {canShowPreview ? (
                    <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
                      {isPdf ? (
                        // PDF Viewer using backend proxy
                        <iframe
                          src={viewableUrl}
                          className="w-full h-full border-0"
                          title={file.title}
                          onError={(e) => {
                            console.error('PDF load error:', e);
                            setError('Unable to load PDF. Please use download button.');
                          }}
                        />
                      ) : isImage ? (
                        // Image viewer
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                          <img
                            src={file.image}
                            alt={file.title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              setError('Unable to load image. Please use download button.');
                            }}
                          />
                        </div>
                      ) : (
                        // Text file viewer
                        <iframe
                          src={viewableUrl}
                          className="w-full h-full border-0 bg-white dark:bg-gray-900"
                          title={file.title}
                        />
                      )}
                    </div>
                  ) : (
                    // Non-previewable files
                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8" style={{ height: 'calc(100vh - 200px)' }}>
                      <div className="text-center max-w-2xl">
                        <div className="text-6xl mb-6">📄</div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                          {file?.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          This file type cannot be previewed in browser. Please download to view.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>🔗</span>
                        <span>Open in New Tab</span>
                      </a>
                      <a
                        href={originalUrl}
                        download={file.title}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>⬇️</span>
                        <span>Download File</span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(originalUrl);
                          alert('Link copied to clipboard!');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>📋</span>
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            // Old files (local storage) - Show download option
            <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {file?.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This file was uploaded before Cloudinary integration. 
                  Please download it to view.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition shadow-lg"
                  >
                    ⬇️ Download File
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  💡 Tip: New uploads will be viewable directly in browser
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* File Info */}
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">File Information</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Name:</strong> {file?.title}</p>
            <p><strong>UUID:</strong> {file?.uuid}</p>
            {file?.folder && <p><strong>Folder:</strong> {file.folder}</p>}
            <p><strong>Size:</strong> {file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
