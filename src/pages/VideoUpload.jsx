import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function VideoUpload() {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState('');
  const [newPlaylistFolder, setNewPlaylistFolder] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistVideos, setNewPlaylistVideos] = useState([{ url: '', title: '' }]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { currentUser } = useSelector((state) => state.user);


  const navigate = useNavigate();


  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    axios.get('/api/playlists').then(response => setPlaylists(response.data));
  }, []);

  const addVideoField = () => {
    setNewPlaylistVideos([...newPlaylistVideos, { url: '', title: '' }]);
  };

  const removeVideoField = (index) => {
    const updated = newPlaylistVideos.filter((_, i) => i !== index);
    setNewPlaylistVideos(updated);
  };

  const updateVideoField = (index, field, value) => {
    const updated = [...newPlaylistVideos];
    updated[index][field] = value;
    setNewPlaylistVideos(updated);
  };

  const createPlaylist = async () => {
    if (!newPlaylist.trim() || !currentUser?.isAdmin) return;
    try {
      // Filter out empty video entries and convert URLs to embed format
      const validVideos = newPlaylistVideos
        .filter(v => v.url.trim())
        .map(v => ({
          url: convertToEmbedUrl(v.url),
          title: v.title.trim() || 'Untitled Video'
        }));

      const response = await axios.post('/api/playlists', { 
        name: newPlaylist,
        folder: newPlaylistFolder.trim() || null,
        description: newPlaylistDescription.trim() || null,
        videos: validVideos
      });
      setPlaylists([...playlists, response.data]);
      
      // Reset form
      setNewPlaylist('');
      setNewPlaylistFolder('');
      setNewPlaylistDescription('');
      setNewPlaylistVideos([{ url: '', title: '' }]);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist');
    }
  };

  const convertToEmbedUrl = (url) => {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|\/embed\/)([\w-]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const addVideo = async () => {
    if (!selectedPlaylist || !videoUrl.trim() || !currentUser?.isAdmin) return;
    const embedUrl = convertToEmbedUrl(videoUrl);
    try {
      const response = await axios.post(`/api/playlists/${selectedPlaylist._id}/videos`, { 
        url: embedUrl,
        title: videoTitle.trim() || 'Untitled Video'
      });
      const updatedPlaylist = response.data;
      const updatedPlaylists = playlists.map(p => (p._id === selectedPlaylist._id ? updatedPlaylist : p));
      setPlaylists(updatedPlaylists);
      setSelectedPlaylist(updatedPlaylist);
      setVideoUrl('');
      setVideoTitle('');
    } catch (err) {
      console.error('Error adding video:', err);
    }
  };

  const deleteVideo = async (videoIndex) => {
    if (!currentUser?.isAdmin) return;
    try {
      const response = await axios.delete(`/api/playlists/${selectedPlaylist._id}/videos/${videoIndex}`);
      const updatedPlaylist = response.data;
      const updatedPlaylists = playlists.map(p => (p._id === selectedPlaylist._id ? updatedPlaylist : p));
      setPlaylists(updatedPlaylists);
      setSelectedPlaylist(updatedPlaylist);
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!currentUser?.isAdmin) return;
    try {
      await axios.delete(`/api/playlists/${playlistId}`);
      setPlaylists(playlists.filter(p => p._id !== playlistId));
      if (selectedPlaylist?._id === playlistId) setSelectedPlaylist(null);
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">🎥 Video Playlist Manager</h1>

      {/* Create Playlist */}
      {currentUser?.isAdmin && (
        <div className="mb-8 max-w-4xl mx-auto">
          {!showCreateForm ? (
            <div className="text-center">
              <button 
                onClick={() => setShowCreateForm(true)} 
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition text-lg font-semibold"
              >
                ➕ Create New Playlist
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-center">Create New Playlist</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Playlist Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., React Basics"
                    value={newPlaylist}
                    onChange={e => setNewPlaylist(e.target.value)}
                    className="w-full p-3 border rounded-lg text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Folder (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Web Development"
                    value={newPlaylistFolder}
                    onChange={e => setNewPlaylistFolder(e.target.value)}
                    className="w-full p-3 border rounded-lg text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                  <textarea
                    placeholder="Brief description of this playlist"
                    value={newPlaylistDescription}
                    onChange={e => setNewPlaylistDescription(e.target.value)}
                    className="w-full p-3 border rounded-lg text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Videos (Optional - Add YouTube URLs)</label>
                  {newPlaylistVideos.map((video, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          placeholder="Video Title"
                          value={video.title}
                          onChange={e => updateVideoField(index, 'title', e.target.value)}
                          className="w-full p-2 border rounded-lg text-black dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                          value={video.url}
                          onChange={e => updateVideoField(index, 'url', e.target.value)}
                          className="w-full p-2 border rounded-lg text-black dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                      </div>
                      {newPlaylistVideos.length > 1 && (
                        <button
                          onClick={() => removeVideoField(index)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-500 hover:text-white rounded-lg transition text-sm"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addVideoField}
                    className="mt-2 px-4 py-2 bg-blue-100 hover:bg-blue-500 hover:text-white rounded-lg transition text-sm"
                  >
                    ➕ Add Another Video
                  </button>
                </div>

                <div className="flex gap-3 justify-center pt-4">
                  <button 
                    onClick={createPlaylist} 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
                  >
                    ✅ Create Playlist
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylist('');
                      setNewPlaylistFolder('');
                      setNewPlaylistDescription('');
                      setNewPlaylistVideos([{ url: '', title: '' }]);
                    }} 
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition font-semibold"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Playlist Selection */}
      <h2 className="text-xl font-semibold mb-2 text-center">Select Playlist</h2>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {playlists.length > 0 ? (
          playlists.map(playlist => (
            <div key={playlist._id} className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPlaylist(playlist)}
                className={`p-2 border rounded ${selectedPlaylist?._id === playlist._id ? 'bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-300 rounded-lg text-2xl text-white' : 'bg-gray-400 text-white text-xl'}`}
              >
                {playlist.name}
              </button>
              {currentUser?.isAdmin && (
                <button
                  onClick={() => deletePlaylist(playlist._id)}
                  className="p-2 bg-red-50 hover:bg-red-500 rounded"
                >
                  🗑
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No playlists yet. Create one!</p>
        )}
      </div>

      {/* Add Video */}
      {selectedPlaylist && currentUser?.isAdmin && (
        <div className="mb-4 text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Add Video to {selectedPlaylist.name}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Video Title (e.g., Introduction to React)"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
              className="w-full p-3 border rounded-lg text-black"
            />
            <input
              type="text"
              placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full p-3 border rounded-lg text-black"
            />
            <button 
              onClick={addVideo} 
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-300 rounded-lg hover:shadow-lg transition"
            >
              ➕ Add Video
            </button>
          </div>
        </div>
      )}

      {/* Display Videos */}
      {selectedPlaylist && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Videos in {selectedPlaylist.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {selectedPlaylist.videos.length > 0 ? (
              selectedPlaylist.videos.map((video, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {video.title && (
                    <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100">
                      <h3 className="font-semibold text-gray-800 truncate">{video.title}</h3>
                    </div>
                  )}
                  <iframe
                    width="100%"
                    height="200"
                    src={video.url}
                    title={video.title || "Video Player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full"
                  ></iframe>
                  {currentUser?.isAdmin && (
                    <div className="p-2 bg-gray-50">
                      <button 
                        onClick={() => deleteVideo(index)} 
                        className="w-full p-2 bg-red-100 hover:bg-red-500 hover:text-white rounded-lg text-black transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="col-span-full text-gray-500">No videos in this playlist yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;