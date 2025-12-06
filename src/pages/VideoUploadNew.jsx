import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileInput, Label, TextInput, Button, Select, Alert, Textarea } from "flowbite-react";
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { useNavigate } from 'react-router-dom';

const VideoUploadNew = () => {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [folderOption, setFolderOption] = useState('none');
  const [existingFolder, setExistingFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([{ title: '', url: '' }]);

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

  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|\/embed\/)([\w-]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const addVideoField = () => {
    setVideos([...videos, { title: '', url: '' }]);
  };

  const removeVideoField = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const updateVideo = (index, field, value) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
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
      
      // Filter and convert video URLs
      const validVideos = videos
        .filter(v => v.url && v.url.trim().length > 0)
        .map(v => ({
          url: convertToEmbedUrl(v.url),
          title: v.title.trim() || 'Untitled Video'
        }));
      
      const response = await axios.post('/api/playlists', {
        name: playlistName,
        folder: folderPath,
        description: description,
        videos: validVideos
      });
      
      const videoCount = validVideos.length;
      setMessage(`Playlist created successfully${videoCount > 0 ? ` with ${videoCount} video(s)` : ''}!`);
      
      setLoading(false);
      
      // Redirect to video list page after 1.5 seconds
      setTimeout(() => {
        navigate('/video-list');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error creating playlist';
      setMessage(errorMessage);
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

        {/* YouTube Videos Section */}
        <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
          <Label value="📹 Add YouTube Videos (Optional)" className="mb-3 text-lg font-semibold" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Add YouTube videos to this playlist by pasting video URLs
          </p>
          
          {videos.map((video, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Video {index + 1}
                </span>
                {videos.length > 1 && (
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => removeVideoField(index)}
                  >
                    🗑️ Remove
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`videoTitle${index}`} value="Video Title" className="mb-1 text-sm" />
                  <TextInput
                    id={`videoTitle${index}`}
                    type="text"
                    value={video.title}
                    onChange={(e) => updateVideo(index, 'title', e.target.value)}
                    placeholder="e.g., Introduction to React"
                    sizing="sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`videoUrl${index}`} value="YouTube URL" className="mb-1 text-sm" />
                  <TextInput
                    id={`videoUrl${index}`}
                    type="text"
                    value={video.url}
                    onChange={(e) => updateVideo(index, 'url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    sizing="sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            onClick={addVideoField}
            color="light"
            size="sm"
            className="w-full"
          >
            ➕ Add Another Video
          </Button>
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
