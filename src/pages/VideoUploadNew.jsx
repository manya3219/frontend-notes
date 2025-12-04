import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileInput, Label, TextInput, Button, Select, Alert, Textarea } from "flowbite-react";
import { useAuthRedirect } from '../hooks/useAuthRedirect';

const VideoUploadNew = () => {
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [folderOption, setFolderOption] = useState('none');
  const [existingFolder, setExistingFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Require admin access (prevents redirect on refresh)
  const currentUser = useAuthRedirect(true);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchFolders();
    }
  }, [currentUser]);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/playlists');
      const playlists = response.data;
      const uniqueFolders = [...new Set(playlists.filter(p => p.folder).map(p => p.folder))];
      setFolders(uniqueFolders);
    } catch (error) {
      console.log('Error fetching folders:', error);
    }
  };

  const handleUpload = async () => {
    if (!playlistName) {
      setMessage('Please enter playlist name');
      return;
    }

    try {
      setLoading(true);
      
      let folderPath = null;
      if (folderOption === 'existing' && existingFolder) {
        folderPath = existingFolder;
      } else if (folderOption === 'nested' && existingFolder && newFolder) {
        folderPath = `${existingFolder}/${newFolder}`;
      } else if (folderOption === 'new' && newFolder) {
        folderPath = newFolder;
      }
      
      await axios.post('/api/playlists', {
        name: playlistName,
        folder: folderPath,
        description: description
      });
      
      setMessage('Playlist created successfully!');
      
      // Reset form
      setPlaylistName('');
      setDescription('');
      setFolderOption('none');
      setNewFolder('');
      setExistingFolder('');
      
      // Refresh folders list
      await fetchFolders();
      
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setMessage('Error creating playlist');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 sm:mt-10 p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-4 sm:my-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
        🎥 NexaHub - Create Video Playlist
      </h1>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="playlistName" value="Playlist Name *" className="mb-2 text-lg" />
          <TextInput
            id="playlistName"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" value="Description (Optional)" className="mb-2 text-lg" />
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter playlist description"
            rows={3}
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
              placeholder="Enter folder name (e.g., Tutorials or Tutorials/React)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tip: Use "/" to create nested folders (e.g., "Tutorials/React/Basics")
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!playlistName || loading}
          gradientDuoTone="purpleToPink"
          className="w-full"
          size="lg"
        >
          {loading ? 'Creating...' : 'Create Playlist'}
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

export default VideoUploadNew;
