import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TeacherSignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.adminKey) {
      return setErrorMessage('Please fill out all fields.');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false || !res.ok) {
        return setErrorMessage(data.message || 'Signup failed');
      }
      if(res.ok) {
        navigate('/teacher-login');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };
  
  return (
    <div className='min-h-screen mt-10 sm:mt-20 px-4'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-3xl sm:text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Nexa
            </span>
            Hub
          </Link>
          <p className='text-sm sm:text-base mt-5'>
            Teacher Registration - Enter your admin key to create a teacher account.
          </p>
          <div className='mt-4 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg text-xs sm:text-sm'>
            <p className='font-semibold mb-2'>Requirements:</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>Email must end with @gmail.com</li>
              <li>Password: 8+ chars, uppercase, lowercase, number, special char (@$!%?&)</li>
              <li>Admin Key: 123456@A</li>
            </ul>
          </div>
        </div>

        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Your username' />
              <TextInput
                type='text'
                placeholder='Username'
                id='username'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Your email (must end with @gmail.com)' />
              <TextInput
                type='email'
                placeholder='teacher@gmail.com'
                id='email'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Your password' />
              <TextInput
                type='password'
                placeholder='Example: Teacher@123'
                id='password'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Admin Key (123456@A)' />
              <TextInput
                type='text'
                placeholder='123456@A'
                id='adminKey'
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
                'Sign Up as Teacher'
              )}
            </Button>
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span>Have an account?</span>
            <Link to='/teacher-login' className='text-blue-500'>
              Login
            </Link>
          </div>
          <div className='flex gap-2 text-sm mt-2'>
            <span>Are you a student?</span>
            <Link to='/' className='text-blue-500'>
              Student Sign Up
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
