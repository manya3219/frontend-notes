import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import CallToAction from '../components/CallToAction';
import PostCard from '../components/PostCard';
import { getApiUrl } from '../utils/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  
  const currentUser = useAuthRedirect();

  useEffect(() => {
    if (currentUser) {
      // Fetch posts if user is authenticated
      const fetchPosts = async () => {
        try {
          const res = await fetch(getApiUrl('/api/post/getPosts'), {
            credentials: 'include'
          });
          const data = await res.json();
          setPosts(data.posts);
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setLoading(false); // Stop loading once posts are fetched
        }
      };
      fetchPosts();
    }
  }, [currentUser]);

  // If still loading, show a loading spinner in the center of the screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-col gap-6 py-16 sm:py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold lg:text-6xl'>Welcome to Blog Section</h1>
        <p className='text-gray-500 text-sm sm:text-base'>
          Here you'll find a variety of articles and tutorials on topics such as
          web development, software engineering, and programming languages.
        </p>
        <Link
          to='/all-blogs'
          className='text-xs sm:text-sm text-teal-500 font-bold hover:underline'
        >
          View all posts
        </Link>
      </div>
      <div className='p-3 bg-amber-100 dark:bg-slate-700'>
        <CallToAction />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8 py-7">
  {posts && posts.length > 0 && (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-center">Recent Posts</h2>
      {/* Responsive Grid Layout for Posts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      <Link
        to={'/all-blogs'}
        className="text-lg text-teal-500 hover:underline text-center"
      >
        View all posts
      </Link>
    </div>
  )}
</div>


    </div>
  );
}