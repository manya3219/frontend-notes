import React, { useState } from 'react';
import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            setLoading(true);
            const resultsFromGoogle = await signInWithPopup(auth, provider);
            
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    googlePhotoUrl: resultsFromGoogle.user.photoURL,
                }),
            });
            
            if (res.ok) {
                const data = await res.json();
                dispatch(loginSuccess(data));
                navigate('/home');
            } else {
                const errorData = await res.json();
                console.error('Google auth failed:', errorData);
                alert('Failed to sign in with Google. Please try again.');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            
            // Handle specific Firebase errors
            if (error.code === 'auth/popup-blocked') {
                alert('Popup was blocked. Please allow popups for this site.');
            } else if (error.code === 'auth/popup-closed-by-user') {
                console.log('User closed the popup');
            } else if (error.code === 'auth/unauthorized-domain') {
                alert('This domain is not authorized for Google sign-in. Please contact support.');
            } else {
                alert('Failed to sign in with Google. Please try again or use email/password.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Button 
            type='button' 
            gradientDuoTone='pinkToOrange' 
            outline 
            onClick={handleGoogleClick}
            disabled={loading}
        >
            <AiFillGoogleCircle className='w-6 h-6 mr-2'/>
            {loading ? 'Signing in...' : 'Continue with Google'}
        </Button>
    );
}
