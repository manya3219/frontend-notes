import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import axios from 'axios';
import FileCard from './FileCard';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);

  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, []);
  
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/file');
      setFiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
    }
  };

  const handleFileDelete = (uuid) => {
    const updatedFiles = files.filter(file => file.uuid !== uuid);
    setFiles(updatedFiles);
    
    // Check if the selected folder is now empty
    if (selectedFolder) {
      const filesInFolder = updatedFiles.filter(file => file.folder === selectedFolder);
      if (filesInFolder.length === 0) {
        // Navigate back to main view if folder is empty
        setSelectedFolder(null);
      }
    }
  };

  const handleFolderDelete = async (folderName, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete the entire folder "${folderName}" and all its files?`)) {
      return;
    }

    try {
      setDeletingFolder(folderName);
      
      // Get token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      console.log('Token found:', token ? 'Yes' : 'No');
      console.log('Current user:', currentUser);
      
      const config = {
        withCredentials: true,
        headers: {}
      };
      
      // Add token to Authorization header if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const encodedFolderName = encodeURIComponent(folderName);
      const response = await axios.delete(`/api/file/delete-folder/${encodedFolderName}`, config);
      
      console.log('Delete folder response:', response.data);
      
      // Remove all files from this folder
      setFiles(files.filter(file => file.folder !== folderName));
      setDeletingFolder(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to delete folder: ${error.response?.data?.error || error.response?.data?.message || error.message}`);
      setDeletingFolder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
      </div>
    );
  }

  // Helper function to get root folders (no parent)
  const getRootFolders = () => {
    const allFolders = [...new Set(files.filter(f => f.folder).map(f => f.folder))];
    return allFolders.filter(folder => !folder.includes('/'));
  };

  // Helper function to get subfolders of a parent
  const getSubfolders = (parentPath) => {
    const allFolders = [...new Set(files.filter(f => f.folder).map(f => f.folder))];
    return allFolders.filter(folder => {
      if (!folder.startsWith(parentPath + '/')) return false;
      const remaining = folder.substring(parentPath.length + 1);
      return !remaining.includes('/'); // Only direct children
    });
  };

  // Helper function to get files in a specific folder (not in subfolders)
  const getFilesInFolder = (folderPath) => {
    return files.filter(file => file.folder === folderPath);
  };

  // Group files by folder
  const filesWithoutFolder = files.filter(file => !file.folder);
  const filesByFolder = files.reduce((acc, file) => {
    if (file.folder) {
      if (!acc[file.folder]) {
        acc[file.folder] = [];
      }
      acc[file.folder].push(file);
    }
    return acc;
  }, {});

  // Helper function to get parent folder path
  const getParentFolder = (folderPath) => {
    if (!folderPath.includes('/')) return null; // Root folder, no parent
    const parts = folderPath.split('/');
    parts.pop(); // Remove last part
    return parts.join('/');
  };

  // Helper function to navigate back
  const handleBack = () => {
    const parent = getParentFolder(selectedFolder);
    setSelectedFolder(parent); // null means go to root
  };

  // If a folder is selected, show subfolders and files
  if (selectedFolder) {
    const subfolders = getSubfolders(selectedFolder);
    const folderFiles = getFilesInFolder(selectedFolder);
    const parentFolder = getParentFolder(selectedFolder);
    
    if (subfolders.length === 0 && folderFiles.length === 0) {
      // Folder is empty, go back to parent
      setSelectedFolder(parentFolder);
      return null;
    }
    
    // Create breadcrumb
    const breadcrumbParts = selectedFolder.split('/');
    
    return (
      <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
        <div>
          <Button
            onClick={handleBack}
            color="gray"
            className="mb-6"
          >
            ← Back {parentFolder ? `to ${parentFolder}` : 'to All Folders'}
          </Button>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span 
              className="cursor-pointer hover:text-blue-500"
              onClick={() => setSelectedFolder(null)}
            >
              🏠 Home
            </span>
            {breadcrumbParts.map((part, index) => {
              const path = breadcrumbParts.slice(0, index + 1).join('/');
              const isLast = index === breadcrumbParts.length - 1;
              return (
                <React.Fragment key={path}>
                  <span>/</span>
                  <span 
                    className={isLast ? 'font-semibold text-gray-800 dark:text-white' : 'cursor-pointer hover:text-blue-500'}
                    onClick={() => !isLast && setSelectedFolder(path)}
                  >
                    {part}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
          
          <h1 className='text-3xl font-bold text-black dark:text-white mb-6'>
            📁 {breadcrumbParts[breadcrumbParts.length - 1]}
          </h1>
          
          {/* Subfolders */}
          {subfolders.length > 0 && (
            <div className="mb-8">
              <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>
                Subfolders
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subfolders.map((subfolder) => {
                  const folderName = subfolder.split('/').pop();
                  const fileCount = filesByFolder[subfolder]?.length || 0;
                  return (
                    <div
                      key={subfolder}
                      onClick={() => setSelectedFolder(subfolder)}
                      className="relative cursor-pointer p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {currentUser?.isAdmin && (
                        <button
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
                          onClick={(e) => handleFolderDelete(subfolder, e)}
                          disabled={deletingFolder === subfolder}
                        >
                          {deletingFolder === subfolder ? '...' : '🗑️'}
                        </button>
                      )}
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-3">📁</div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                          {folderName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          {fileCount} file(s)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Files in current folder */}
          {folderFiles.length > 0 && (
            <div className="mb-8">
              <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>
                Files in this folder
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folderFiles.map((file, index) => (
                  <FileCard key={index} file={file} onDelete={handleFileDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Main view: Show root folders and files without folder
  const rootFolders = getRootFolders();
  
  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <div>
        <h1 className='text-3xl font-bold text-black dark:text-white mb-6'>
          📂 NexaHub - Files & Folders
        </h1>
        
        {/* Root Folders */}
        {rootFolders.length > 0 && (
          <div className="mb-8">
            <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>
              Folders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rootFolders.map((folderName) => {
                // Count all files in this folder and its subfolders
                const allFilesInFolder = files.filter(f => 
                  f.folder === folderName || f.folder?.startsWith(folderName + '/')
                ).length;
                
                return (
                  <div
                    key={folderName}
                    onClick={() => setSelectedFolder(folderName)}
                    className="relative cursor-pointer p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {currentUser?.isAdmin && (
                      <button
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
                        onClick={(e) => handleFolderDelete(folderName, e)}
                        disabled={deletingFolder === folderName}
                      >
                        {deletingFolder === folderName ? '...' : '🗑️'}
                      </button>
                    )}
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-3">📁</div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                        {folderName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {allFilesInFolder} file(s)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files without folder */}
        {filesWithoutFolder.length > 0 && (
          <div className="mb-8">
            <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>
              📄 Files (No Folder)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filesWithoutFolder.map((file, index) => (
                <FileCard key={index} file={file} onDelete={handleFileDelete} />
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <p className='text-gray-500 text-center mt-10'>No files uploaded yet.</p>
        )}
      </div>
    </main>
  );
};

export default FileList;