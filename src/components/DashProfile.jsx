import { Alert, Button, Modal, ModalBody, TextInput } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    // service firebase.storage {
    //   match /b/{bucket}/o {
    //     match /{allPaths=**} {
    //       allow read;
    //       allow write: if
    //       request.resource.size < 2 * 1024 * 1024 &&
    //       request.resource.contentType.matches('image/.*')
    //     }
    //   }
    // }
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          'Could not upload image (File must be less than 2MB)'
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made');
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };
  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

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
  return (
    <div className='max-w-lg mx-auto p-4 sm:p-6 md:p-8 w-full'>
      <h1 className='my-4 sm:my-6 md:my-7 text-center font-semibold text-2xl sm:text-3xl'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 sm:gap-4'>
        <input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className='relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full hover:shadow-xl transition-shadow'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className={`rounded-full w-full h-full object-cover border-4 sm:border-6 md:border-8 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color='failure' className='text-sm sm:text-base'>{imageFileUploadError}</Alert>
        )}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Username</label>
          <TextInput
            type='text'
            id='username'
            placeholder='username'
            defaultValue={currentUser.username}
            onChange={handleChange}
            sizing='md'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Email</label>
          <TextInput
            type='email'
            id='email'
            placeholder='email'
            defaultValue={currentUser.email}
            onChange={handleChange}
            sizing='md'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Password</label>
          <TextInput
            type='password'
            id='password'
            placeholder='Enter new password (optional)'
            onChange={handleChange}
            sizing='md'
          />
        </div>
        <Button
          type='submit'
          gradientDuoTone='purpleToBlue'
          outline
          disabled={loading || imageFileUploading}
          size='lg'
          className='mt-2'
        >
          {loading ? 'Loading...' : 'Update Profile'}
        </Button>
        {currentUser.isAdmin && (
          <div className='mt-4 space-y-3'>
            <div className='border-t pt-4 dark:border-gray-700'>
              <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>Admin Actions</p>
              <div className='flex flex-col sm:flex-row gap-3'>
                <Link to={'/upload'} className='flex-1'>
                  <Button
                    type='button'
                    gradientDuoTone='purpleToPink'
                    className='w-full'
                    size='md'
                  >
                    📤 Upload File
                  </Button>
                </Link>
                <Link to={'/create-post'} className='flex-1'>
                  <Button
                    type='button'
                    gradientDuoTone='purpleToPink'
                    className='w-full'
                    size='md'
                  >
                    ✍️ Create Post
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
      </form>
      
      <div className='text-red-500 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 border-t dark:border-gray-700'>
        <span 
          onClick={() => setShowModal(true)} 
          className='cursor-pointer hover:underline text-sm sm:text-base font-medium'
        >
          🗑️ Delete Account
        </span>
        <span 
          onClick={handleSignout} 
          className='cursor-pointer hover:underline text-sm sm:text-base font-medium'
        >
          🚪 Sign Out
        </span>
      </div>
      {updateUserSuccess && (
        <Alert color='success' className='mt-4 sm:mt-5 text-sm sm:text-base'>
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color='failure' className='mt-4 sm:mt-5 text-sm sm:text-base'>
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color='failure' className='mt-4 sm:mt-5 text-sm sm:text-base'>
          {error}
        </Alert>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center p-2 sm:p-4'>
            <HiOutlineExclamationCircle className='h-12 w-12 sm:h-14 sm:w-14 text-gray-400 dark:text-gray-200 mb-3 sm:mb-4 mx-auto' />
            <h3 className='mb-4 sm:mb-5 text-base sm:text-lg text-gray-500 dark:text-gray-400 px-2'>
              Are you sure you want to delete your account?
            </h3>
            <p className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 mb-4 px-2'>
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-3 sm:gap-4'>
              <Button color='failure' onClick={handleDeleteUser} size='sm' className='w-full sm:w-auto'>
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)} size='sm' className='w-full sm:w-auto'>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}