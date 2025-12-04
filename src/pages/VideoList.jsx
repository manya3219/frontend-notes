import React, { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthRedirect } from '../hooks/useAuthRedirect';

const VideoList = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [deletingFolder, setDeletingFolder] = useState(null);

  const navigate = useNavigate();
  const currentUser = useAuthRedirect();
  const location = useLocation();
  
  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    // Check if there's a playlist query parameter
    const params = new URLSearchParams(location.search);
    const playlistId = params.get('playlist');
    if (playlistId && playlists.length > 0) {
      const playlist = playlists.find(p => p._id === playlistId);
      if (playlist) {
        setSelectedPlaylist(playlist);
      }
    }
  }, [location.search, playlists]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/playlists');
      console.log('Fetched playlists in VideoList:', response.data);
      setPlaylists(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setLoading(false);
    }
  };

  const getRootFolders = () => {
    const allFolders = [...new Set(playlists.filter(p => p.folder).map(p => p.folder))];
    return allFolders.filter(folder => !folder.includes('/'));
  };

  const getSubfolders = (parentPath) => {
    const allFolders = [...new Set(playlists.filter(p => p.folder).map(p => p.folder))];
    return allFolders.filter(folder => {
      if (!folder.startsWith(parentPath + '/')) return false;
      const remaining = folder.substring(parentPath.length + 1);
      return !remaining.includes('/');
    });
  };

  const getPlaylistsInFolder = (folderPath) => {
    return playlists.filter(p => p.folder === folderPath);
  };

  const getParentFolder = (folderPath) => {
    if (!folderPath.includes('/')) return null;
    const parts = folderPath.split('/');
    parts.pop();
    return parts.join('/');
  };

  const handleBack = () => {
    if (selectedPlaylist) {
      // Check if we came from search (has playlist query param)
      const params = new URLSearchParams(location.search);
      const playlistId = params.get('playlist');
      if (playlistId) {
        // Go back to search page
        navigate(-1);
      } else {
        // Just close the playlist view
        setSelectedPlaylist(null);
      }
    } else {
      const parent = getParentFolder(selectedFolder);
      setSelectedFolder(parent);
    }
  };

  const handlePlaylistDelete = async (playlistId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await axios.delete(`/api/playlists/${playlistId}`);
      setPlaylists(playlists.filter(p => p._id !== playlistId));
      if (selectedPlaylist?._id === playlistId) setSelectedPlaylist(null);
    } catch (error) {
      alert('Failed to delete playlist');
    }
  };

  const handleFolderDelete = async (folderName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder "${folderName}" and all playlists?`)) return;
    
    try {
      setDeletingFolder(folderName);
      await axios.delete(`/api/playlists/delete-folder/${folderName}`);
      setPlaylists(playlists.filter(p => p.folder !== folderName));
      setDeletingFolder(null);
    } catch (error) {
      alert('Failed to delete folder');
      setDeletingFolder(null);
    }
  };

  const convertToEmbedUrl = (url) => {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/|\/embed\/)([\w-]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
      </div>
    );
  }

  // Viewing a specific playlist
  if (selectedPlaylist) {
    return (
      <main className='p-3 sm:p-4 md:p-6 flex flex-col max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900'>
        <Button onClick={handleBack} color="gray" className="mb-4 sm:mb-6 w-fit">
          ← Back
        </Button>
        
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
          🎥 {selectedPlaylist.name}
        </h1>
        {selectedPlaylist.description && (
          <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6'>{selectedPlaylist.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {selectedPlaylist.videos.map((video, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
              <iframe
                width="100%"
                height="200"
                src={convertToEmbedUrl(video.url)}
                title={video.title || `Video ${index + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full rounded-t-lg"
              />
              {video.title && (
                <div className="p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{video.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {selectedPlaylist.videos.length === 0 && (
          <p className='text-gray-500 dark:text-gray-400 text-center mt-10'>No videos in this playlist yet.</p>
        )}
      </main>
    );
  }

  // Viewing a folder
  if (selectedFolder) {
    const subfolders = getSubfolders(selectedFolder);
    const folderPlaylists = getPlaylistsInFolder(selectedFolder);
    const breadcrumbParts = selectedFolder.split('/');
    
    return (
      <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
        <Button onClick={handleBack} color="gray" className="mb-6 w-fit">
          ← Back
        </Button>
        
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="cursor-pointer hover:text-blue-500" onClick={() => setSelectedFolder(null)}>
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
        
        {subfolders.length > 0 && (
          <div className="mb-8">
            <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Subfolders</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subfolders.map((subfolder) => {
                const folderName = subfolder.split('/').pop();
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
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">{folderName}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {folderPlaylists.length > 0 && (
          <div className="mb-8">
            <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4'>Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folderPlaylists.map((playlist) => (
                <div
                  key={playlist._id}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="relative cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all"
                >
                  {currentUser?.isAdmin && (
                    <button
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
                      onClick={(e) => handlePlaylistDelete(playlist._id, e)}
                    >
                      🗑️
                    </button>
                  )}
                  <div className="text-5xl mb-3 text-center">🎥</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">{playlist.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                    {playlist.videos.length} video(s)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  // Main view
  const rootFolders = getRootFolders();
  const playlistsWithoutFolder = playlists.filter(p => !p.folder);
  
  return (
    <main className='p-3 sm:p-4 md:p-6 flex flex-col max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900'>
      <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6'>
        🎥 NexaHub - Video Playlists
      </h1>
      
      {rootFolders.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className='text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4'>Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {rootFolders.map((folderName) => (
              <div
                key={folderName}
                onClick={() => setSelectedFolder(folderName)}
                className="relative cursor-pointer p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200 dark:border-purple-700"
              >
                {currentUser?.isAdmin && (
                  <button
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center z-10 transition-all shadow-md"
                    onClick={(e) => handleFolderDelete(folderName, e)}
                    disabled={deletingFolder === folderName}
                  >
                    {deletingFolder === folderName ? '...' : '🗑️'}
                  </button>
                )}
                <div className="flex flex-col items-center">
                  <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">📁</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white text-center">{folderName}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlistsWithoutFolder.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className='text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4'>Playlists (No Folder)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {playlistsWithoutFolder.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => setSelectedPlaylist(playlist)}
                className="relative cursor-pointer p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600"
              >
                {currentUser?.isAdmin && (
                  <button
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center z-10 transition-all shadow-md"
                    onClick={(e) => handlePlaylistDelete(playlist._id, e)}
                  >
                    🗑️
                  </button>
                )}
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-center">🎥</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white text-center">{playlist.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  {playlist.videos.length} video(s)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlists.length === 0 && (
        <p className='text-gray-500 dark:text-gray-400 text-center mt-10'>No playlists yet.</p>
      )}
    </main>
  );
};

export default VideoList;
