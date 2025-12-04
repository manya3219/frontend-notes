import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { Button, Select, TextInput } from 'flowbite-react';

export default function AllBlogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [category, setCategory] = useState('uncategorized');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchPosts();
  }, [sortOrder, category]);

  const fetchPosts = async (startIndex = 0) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/post/getposts?sort=${sortOrder}&category=${category}&startIndex=${startIndex}`
      );
      const data = await res.json();
      
      if (startIndex === 0) {
        setPosts(data.posts);
      } else {
        setPosts([...posts, ...data.posts]);
      }
      
      setShowMore(data.posts.length === 9);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleShowMore = () => {
    const startIndex = posts.length;
    fetchPosts(startIndex);
  };

  const handleSearch = () => {
    if (searchTerm) {
      navigate(`/search?searchTerm=${searchTerm}`);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">📝 All Blog Posts</h1>
          <p className="text-base sm:text-lg text-white/90">
            Explore all articles and tutorials
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 w-full flex gap-2">
              <TextInput
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} gradientDuoTone="purpleToPink" size="sm">
                Search
              </Button>
            </div>

            {/* Sort & Category - Side by side on mobile */}
            <div className="flex gap-3 sm:gap-4">
              {/* Sort */}
              <div className="flex gap-2 items-center flex-1 sm:flex-none">
                <label className="text-xs sm:text-sm font-semibold whitespace-nowrap">Sort:</label>
                <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} sizing="sm">
                  <option value="desc">Latest</option>
                  <option value="asc">Oldest</option>
                </Select>
              </div>

              {/* Category */}
              <div className="flex gap-2 items-center flex-1 sm:flex-none">
                <label className="text-xs sm:text-sm font-semibold whitespace-nowrap">Category:</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} sizing="sm">
                  <option value="uncategorized">All</option>
                  <option value="reactjs">React.js</option>
                  <option value="nextjs">Next.js</option>
                  <option value="javascript">JavaScript</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            {/* Show More Button */}
            {showMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleShowMore}
                  gradientDuoTone="purpleToPink"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Show More'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
