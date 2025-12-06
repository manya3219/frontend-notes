import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileInput, Label, TextInput, Button, Select, Alert } from "flowbite-react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [folderOption, setFolderOption] = useState('none');
  const [existingFolder, setExistingFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [useGoogleDrive, setUseGoogleDrive] = useState(true); // Default to Google Drive

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/file');
      const files = response.data;
      const uniqueFolders = [...new Set(files.filter(f => f.folder).map(f => f.folder))];
      setFolders(uniqueFolders);
    } catch (error) {
      console.log('Error fetching folders:', error);
    }
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('myfile', file);
      formData.append('title', title);
      
      if (folderOption === 'existing' && existingFolder) {
        formData.append('folder', existingFolder);
      } else if (folderOption === 'nested' && existingFolder && newFolder) {
        // Create nested folder path
        formData.append('folder', `${existingFolder}/${newFolder}`);
      } else if (folderOption === 'new' && newFolder) {
        formData.append('folder', newFolder);
      }
      
      // Choose endpoint based on storage type
      const endpoint = useGoogleDrive ? '/api/files/gdrive' : '/api/files';
      const response = await axios.post(endpoint, formData);
      
      // If Google Drive not configured, fallback to Cloudinary
      if (response.data.useCloudinary) {
        await axios.post('/api/files', formData);
      }
      
      setMessage(`File uploaded successfully to ${useGoogleDrive ? 'Google Drive' : 'Cloudinary'}!`);
      
      // Reset form
      setTitle('');
      setFile(null);
      setFolderOption('none');
      setNewFolder('');
      setExistingFolder('');
      
      // Refresh folders list
      await fetchFolders();
      
      setLoading(false);
      
      // Clear the file input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setMessage('Error uploading file');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 sm:mt-10 p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-4 sm:my-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
        📤 NexaHub - Upload File
      </h1>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" value="File Title *" className="mb-2 text-lg" />
          <TextInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter file title"
            required
          />
        </div>

        <div>
          <Label htmlFor="folderOption" value="Folder Option" className="mb-2 text-lg" />
          <Select
            id="folderOption"
            value={folderOption}
            onChange={(e) => setFolderOption(e.target.value)}
          >
            <option value="none">No Folder</option>
            <option value="existing">Select Existing Folder</option>
            <option value="nested">Create Nested Folder in Existing</option>
            <option value="new">Create New Folder</option>
          </Select>
        </div>

        {folderOption === 'existing' && folders.length > 0 && (
          <div>
            <Label htmlFor="existingFolder" value="Select Folder" className="mb-2" />
            <Select
              id="existingFolder"
              value={existingFolder}
              onChange={(e) => setExistingFolder(e.target.value)}
            >
              <option value="">Choose a folder...</option>
              {folders.map((folder, index) => (
                <option key={index} value={folder}>
                  📁 {folder}
                </option>
              ))}
            </Select>
          </div>
        )}

        {folderOption === 'nested' && folders.length > 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="parentFolder" value="Select Parent Folder" className="mb-2" />
              <Select
                id="parentFolder"
                value={existingFolder}
                onChange={(e) => setExistingFolder(e.target.value)}
              >
                <option value="">Choose parent folder...</option>
                {folders.map((folder, index) => (
                  <option key={index} value={folder}>
                    📁 {folder}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="subFolder" value="Subfolder Name" className="mb-2" />
              <TextInput
                id="subFolder"
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="Enter subfolder name"
              />
              {existingFolder && newFolder && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Path: 📁 {existingFolder}/{newFolder}
                </p>
              )}
            </div>
          </div>
        )}

        {folderOption === 'new' && (
          <div>
            <Label htmlFor="newFolder" value="New Folder Name" className="mb-2" />
            <TextInput
              id="newFolder"
              type="text"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="Enter folder name (e.g., Math or Math/Algebra)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tip: Use "/" to create nested folders (e.g., "Math/Algebra/Chapter1")
            </p>
          </div>
        )}

        {/* Storage Type Toggle */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-blue-200 dark:border-gray-500">
          <Label className="mb-3 text-lg font-semibold flex items-center gap-2">
            <span>☁️</span>
            <span>Storage Location</span>
          </Label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUseGoogleDrive(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                useGoogleDrive
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              📁 Google Drive
            </button>
            <button
              type="button"
              onClick={() => setUseGoogleDrive(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                !useGoogleDrive
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              ☁️ Cloudinary
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
            {useGoogleDrive 
              ? '✅ Files will open directly in Google Drive viewer' 
              : '✅ Files will be stored on Cloudinary CDN'}
          </p>
        </div>

        <div>
          <Label htmlFor="fileInput" value="Choose File *" className="mb-2 text-lg" />
          <FileInput
            id="fileInput"
            onChange={handleChange}
            helperText="Upload PDF, DOC, DOCX, or other document files"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {file.name}
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || !title || loading}
          gradientDuoTone="purpleToPink"
          className="w-full"
          size="lg"
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </Button>

        {message && (
          <Alert color={message.includes('success') ? 'success' : 'failure'}>
            {message}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Upload;