import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Landing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (currentUser) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Hero Section */}
      <div className='flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Logo */}
          <div className='mb-8 sm:mb-12'>
            <h1 className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4'>
              <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text'>
                NexaHub
              </span>
            </h1>
            <p className='text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-semibold'>
              Your Ultimate Learning Platform
            </p>
          </div>

          {/* Description */}
          <div className='mb-8 sm:mb-12 space-y-4'>
            <p className='text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
              Access thousands of educational resources, video tutorials, and blog posts. 
              Join our community of learners and educators today!
            </p>
          </div>

          {/* Features */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-3xl mx-auto'>
            <div className='bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-purple-200 dark:border-purple-700'>
              <div className='text-4xl sm:text-5xl mb-3'>📚</div>
              <h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Study Materials
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                Access PDFs, documents, and notes
              </p>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-pink-200 dark:border-pink-700'>
              <div className='text-4xl sm:text-5xl mb-3'>🎥</div>
              <h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Video Tutorials
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                Watch curated video playlists
              </p>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700'>
              <div className='text-4xl sm:text-5xl mb-3'>✍️</div>
              <h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Blog Articles
              </h3>
              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                Read expert tutorials and guides
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
            <Link to='/signup' className='w-full sm:w-auto'>
              <Button
                gradientDuoTone='purpleToPink'
                size='xl'
                className='w-full sm:w-auto text-base sm:text-lg px-8 py-3'
              >
                Get Started - Sign Up
              </Button>
            </Link>
            <Link to='/login' className='w-full sm:w-auto'>
              <Button
                color='gray'
                size='xl'
                className='w-full sm:w-auto text-base sm:text-lg px-8 py-3'
              >
                Already have an account? Login
              </Button>
            </Link>
          </div>

          {/* Teacher Login Link */}
          <div className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
            Are you a teacher?{' '}
            <Link
              to='/teacher-login'
              className='text-purple-600 dark:text-purple-400 hover:underline font-semibold'
            >
              Teacher Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='bg-white dark:bg-gray-800 py-12 sm:py-16 md:py-20 px-4'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12'>
            Why Choose NexaHub?
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3'>
                📁 Organized Content
              </h3>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                Files and videos organized in folders for easy navigation
              </p>
            </div>
            <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3'>
                🔍 Powerful Search
              </h3>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                Find any resource quickly with our unified search
              </p>
            </div>
            <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3'>
                🌙 Dark Mode
              </h3>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                Study comfortably with our beautiful dark theme
              </p>
            </div>
            <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3'>
                📱 Responsive Design
              </h3>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                Access from any device - mobile, tablet, or desktop
              </p>
            </div>
            <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3'>
                👨‍🏫 Teacher Content
              </h3>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                Learn from expert teachers and their curated content
              </p>
            </div>
            <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3'>
                🆓 Free Access
              </h3>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
                All resources available for free to registered students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className='bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-12 sm:py-16 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6'>
            Ready to Start Learning?
          </h2>
          <p className='text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8'>
            Join thousands of students already learning on NexaHub
          </p>
          <Link to='/signup'>
            <Button
              size='xl'
              color='light'
              className='text-base sm:text-lg px-8 py-3'
            >
              Create Your Free Account →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
