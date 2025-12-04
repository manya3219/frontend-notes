import { Button, Select, TextInput, Tabs } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import FileCard from './FileCard';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
  });

  const [posts, setPosts] = useState([]);
  const [files, setFiles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        category: categoryFromUrl,
      });
    }

    const fetchData = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const searchTerm = searchTermFromUrl || '';
      
      // Fetch posts
      const postsRes = await fetch(getApiUrl(`/api/post/getposts?${searchQuery}`), {
        credentials: 'include'
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
      
      // Fetch files
      try {
        const filesRes = await axios.get('/api/file');
        const allFiles = filesRes.data;
        // Filter files by search term
        const filteredFiles = searchTerm 
          ? allFiles.filter(file => 
              file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (file.folder && file.folder.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : allFiles;
        setFiles(filteredFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setFiles([]);
      }
      
      // Fetch videos (playlists)
      try {
        const videosRes = await axios.get('/api/playlists');
        const allVideos = videosRes.data;
        console.log('Fetched playlists:', allVideos); // Debug log
        // Filter videos by search term (including folder name)
        const filteredVideos = searchTerm
          ? allVideos.filter(video =>
              video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (video.folder && video.folder.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : allVideos;
        console.log('Filtered playlists:', filteredVideos); // Debug log
        setVideos(filteredVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      }
      
      setLoading(false);
    };
    fetchData();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === 'searchTerm') {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === 'sort') {
      const order = e.target.value || 'desc';
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === 'category') {
      const category = e.target.value || 'uncategorized';
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('category', sidebarData.category);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(getApiUrl(`/api/post/getposts?${searchQuery}`), {
      credentials: 'include'
    });
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, ...data.posts]);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  return (
    <div className='flex flex-col md:flex-row min-h-screen'>
      <div className='w-full md:w-72 p-4 sm:p-7 border-b md:border-r border-gray-500 md:sticky md:top-0 md:h-screen md:overflow-y-auto'>
        <form className='flex flex-col gap-4 sm:gap-8' onSubmit={handleSubmit}>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
            <label className='whitespace-nowrap font-semibold text-sm sm:text-base'>
              Search Term:
            </label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
            <label className='font-semibold text-sm sm:text-base'>Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id='sort' className='w-full sm:w-auto'>
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
            <label className='font-semibold text-sm sm:text-base'>Category:</label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id='category'
              className='w-full sm:w-auto'
            >
              <option value='uncategorized'>Uncategorized</option>
              <option value='reactjs'>React.js</option>
              <option value='nextjs'>Next.js</option>
              <option value='javascript'>JavaScript</option>
            </Select>
          </div>
          <Button type='submit' outline gradientDuoTone='purpleToPink' className='w-full'>
            Apply Filters
          </Button>
        </form>
      </div>
      <div className='w-full'>
        <h1 className='text-2xl sm:text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5'>
          Search Results
        </h1>
        
        {loading ? (
          <div className='p-4 sm:p-7'>
            <p className='text-lg sm:text-xl text-gray-500'>Loading...</p>
          </div>
        ) : (
          <Tabs aria-label="Search results tabs" style="underline" className="p-2 sm:p-3">
            <Tabs.Item active title={`All (${posts.length + files.length + videos.length})`}>
              <div className='space-y-8'>
                {/* Files Section */}
                {files.length > 0 && (
                  <div>
                    <h2 className='text-xl sm:text-2xl font-semibold mb-4'>📁 Files ({files.length})</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {files.slice(0, 6).map((file, index) => (
                        <FileCard key={index} file={file} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Posts Section */}
                {posts.length > 0 && (
                  <div>
                    <h2 className='text-xl sm:text-2xl font-semibold mb-4'>📝 Blog Posts ({posts.length})</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Videos Section */}
                {videos.length > 0 && (
                  <div>
                    <h2 className='text-xl sm:text-2xl font-semibold mb-4'>🎥 Video Playlists ({videos.length})</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {videos.map((video, index) => (
                        <div key={index} className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-xl transition-all'>
                          <div className="text-4xl mb-3 text-center">🎥</div>
                          <h3 className='text-lg font-semibold mb-2'>{video.name}</h3>
                          {video.folder && (
                            <p className='text-xs text-blue-600 dark:text-blue-400 mb-2'>📁 {video.folder}</p>
                          )}
                          {video.description && (
                            <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>{video.description}</p>
                          )}
                          <p className='text-sm text-gray-500 mb-2'>{video.videos?.length || 0} video(s)</p>
                          <a 
                            href={`/video-list?playlist=${video._id}`}
                            className='text-blue-500 hover:underline text-sm'
                          >
                            View Playlist →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {posts.length === 0 && files.length === 0 && videos.length === 0 && (
                  <p className='text-xl text-gray-500 text-center py-10'>No results found.</p>
                )}
                
                {/* Debug info */}
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  <p>Debug: Posts: {posts.length}, Files: {files.length}, Videos: {videos.length}</p>
                </div>
              </div>
            </Tabs.Item>
            
            <Tabs.Item title={`Files (${files.length})`}>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {files.length === 0 ? (
                  <p className='text-lg sm:text-xl text-gray-500'>No files found.</p>
                ) : (
                  files.map((file, index) => (
                    <FileCard key={index} file={file} />
                  ))
                )}
              </div>
            </Tabs.Item>
            
            <Tabs.Item title={`Blog Posts (${posts.length})`}>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {posts.length === 0 ? (
                  <p className='text-lg sm:text-xl text-gray-500'>No posts found.</p>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))
                )}
              </div>
              {showMore && (
                <button
                  onClick={handleShowMore}
                  className='text-teal-500 text-base sm:text-lg hover:underline p-4 sm:p-7 w-full'
                >
                  Show More
                </button>
              )}
            </Tabs.Item>
            
            <Tabs.Item title={`Video Playlists (${videos.length})`}>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {videos.length === 0 ? (
                  <p className='text-lg sm:text-xl text-gray-500'>No video playlists found.</p>
                ) : (
                  videos.map((video, index) => (
                    <div key={index} className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-xl transition-all'>
                      <div className="text-4xl mb-3 text-center">🎥</div>
                      <h3 className='text-lg font-semibold mb-2'>{video.name}</h3>
                      {video.folder && (
                        <p className='text-xs text-blue-600 dark:text-blue-400 mb-2'>📁 {video.folder}</p>
                      )}
                      {video.description && (
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>{video.description}</p>
                      )}
                      <p className='text-sm text-gray-500 mb-2'>{video.videos?.length || 0} video(s)</p>
                      <a 
                        href={`/video-list?playlist=${video._id}`}
                        className='text-blue-500 hover:underline text-sm'
                      >
                        View Playlist →
                      </a>
                    </div>
                  ))
                )}
              </div>
            </Tabs.Item>
          </Tabs>
        )}
      </div>
    </div>
  );
}