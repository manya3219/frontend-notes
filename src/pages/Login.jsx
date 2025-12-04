import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(loginFailure('Please fill all the fields'));
    }
    try {
      dispatch(loginStart());
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Login failed');
      }
      
      const data = await res.json();
      if (data.success === false) {
        dispatch(loginFailure(data.message));
      } else {
        dispatch(loginSuccess(data));
        navigate('/home');
      }
    } catch (error) {
      dispatch(loginFailure(error.message));
    }
  };
  return (
    <div className='min-h-screen mt-10 sm:mt-20 px-4'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* left */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-3xl sm:text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              <i>Nexa</i>
            </span>
            <i>Hub</i>
          </Link>
          <p className='text-sm sm:text-base mt-5'>
            This is a NexaHub website. You can sign in with your email and password
            or with Google.
          </p>
        </div>
        {/* right */}

        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Your email' />
              <TextInput
                type='email'
                placeholder='name@email.com'
                id='email'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Your password' />
              <TextInput
                type='password'
                placeholder=''
                id='password'
                onChange={handleChange}
              />
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Login'
              )}
            </Button>
            <OAuth />
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span>Don't Have an account?</span>
            <Link to='/' className='text-blue-500'>
              Sign Up
            </Link>
          </div>
          <div className='flex gap-2 text-sm mt-2'>
            <span>Are you a teacher?</span>
            <Link to='/teacher-login' className='text-blue-500'>
              Teacher Login
            </Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}