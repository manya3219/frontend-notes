import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';


export default function Header() {
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        // Try to parse JSON, but don't fail if it's not JSON
        try {
          const data = await res.json();
          console.log('Signout response:', data.message);
        } catch (jsonError) {
          // Response might not be JSON, that's okay
          console.log('Signout successful');
        }
        
        // Clear Redux state first
        dispatch(signoutSuccess());
        
        // Clear any local storage if needed
        localStorage.removeItem('persist:root');
        
        // Navigate to landing page
        navigate("/");
      } else {
        console.log('Signout failed with status:', res.status);
      }
    } catch (error) {
      console.log('Signout error:', error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };


  return (
    <Navbar className='border-b-2'>
      {/* Logo */}
      <Link to='/home' className='self-center whitespace-nowrap text-sm sm:text-base md:text-lg lg:text-xl font-semibold dark:text-white'>
        <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
          <i>Nexa</i>
        </span>
        <i>Hub</i>
      </Link>
      
      {/* Search Bar - Visible on tablet and desktop */}
      <form onSubmit={handleSubmit} className='hidden md:block flex-1 max-w-md mx-4'>
        <TextInput
          type='text'
          placeholder='Search...'
          rightIcon={AiOutlineSearch}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sizing='md'
        />
      </form>
      
      {/* Search Button - Only on mobile */}
      <Button 
        className='w-10 h-10 md:hidden' 
        color='gray' 
        pill
        onClick={() => navigate('/search')}
      >
        <AiOutlineSearch />
      </Button>
      
      <div className='flex gap-2 md:order-2'>
        <Button
          className='w-12 h-10 hidden sm:inline'
          color='gray'
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt='user' img={currentUser.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className='block text-sm'>@{currentUser.username}</span>
              <span className='block text-sm font-medium truncate'>
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={'/dashboard?tab=profile'}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to='/login'>
            <Button gradientDuoTone='purpleToBlue' outline>
              login
            </Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        {/* Only show navigation if user is logged in */}
        {currentUser ? (
          <>
            {/* Mobile Search Bar - Shows in collapsed menu */}
            <div className='md:hidden py-2'>
              <form onSubmit={handleSubmit} className='w-full'>
                <TextInput
                  type='text'
                  placeholder='Search...'
                  rightIcon={AiOutlineSearch}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sizing='md'
                />
              </form>
            </div>
            
            <Navbar.Link active={path === '/home'} as={'div'}>
              <Link to='/home' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                Home
              </Link>
            </Navbar.Link>
            <Navbar.Link active={path === '/about'} as={'div'}>
              <Link to='/about' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                About
              </Link>
            </Navbar.Link>
            <Navbar.Link active={path === '/filelist'} as={'div'}>
              <Link to='/filelist' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                Files
              </Link>
            </Navbar.Link>
            <Navbar.Link active={path === '/blog'} as={'div'}>
              <Link to='/blog' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                Blogs
              </Link>
            </Navbar.Link>
            <Navbar.Link active={path === '/video-list'} as={'div'}>
              <Link to='/video-list' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                Videos
              </Link>
            </Navbar.Link>
          </>
        ) : (
          /* Show login/signup links when not logged in */
          <>
            <Navbar.Link as={'div'}>
              <Link to='/login' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                Login
              </Link>
            </Navbar.Link>
            <Navbar.Link as={'div'}>
              <Link to='/signup' className='text-base sm:text-lg font-bold text-gray-600 hover:text-black dark:hover:text-white'>
                Sign Up
              </Link>
            </Navbar.Link>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}