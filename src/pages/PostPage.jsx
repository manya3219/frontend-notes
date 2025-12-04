import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { getApiUrl } from '../utils/api';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts or postSlug changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/post/getposts?slug=${postSlug}`), {
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(getApiUrl(`/api/post/getposts?limit=3`), {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900'>
        <Spinner size='xl' />
      </div>
    );

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Hero Section with Cover Image */}
      <div className='relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800'>
        <img
          src={post && post.image}
          alt={post && post.title}
          className='w-full h-full object-cover opacity-60'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'></div>
        
        {/* Title Overlay */}
        <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12'>
          <div className='max-w-4xl mx-auto'>
            <Link to={`/search?category=${post && post.category}`}>
              <Button color='purple' pill size='xs' className='mb-2 sm:mb-4 text-xs sm:text-sm'>
                {post && post.category}
              </Button>
            </Link>
            <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-4 leading-tight'>
              {post && post.title}
            </h1>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm'>
              <span className='flex items-center gap-2'>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {post && new Date(post.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <span className='flex items-center gap-2'>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post && (post.content.length / 1000).toFixed(0)} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8'>
          <div
            className='prose prose-lg dark:prose-invert max-w-none post-content'
            dangerouslySetInnerHTML={{ __html: post && post.content }}
          ></div>
        </div>

        {/* Call to Action */}
        <div className='mb-8'>
          <CallToAction />
        </div>

        {/* Comments Section */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8'>
          <CommentSection postId={post._id} />
        </div>
      </article>

      {/* Recent Articles */}
      <div className='bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 py-12 sm:py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-8 sm:mb-12'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3'>
              Continue Reading
            </h2>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              Check out these related articles
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8'>
            {recentPosts &&
              recentPosts.map((recentPost) => (
                <div key={recentPost._id} className='transform transition-all duration-300 hover:scale-105'>
                  <PostCard post={recentPost} />
                </div>
              ))}
          </div>
          <div className='text-center mt-8 sm:mt-12'>
            <Link to='/all-blogs'>
              <Button gradientDuoTone='purpleToPink' size='md' className='sm:text-base'>
                View All Articles →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}