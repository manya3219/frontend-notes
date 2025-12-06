import React from 'react'
import Home from './pages/Home'
import About from './pages/About'
import Blog from './pages/Blog'
import SignUp from './pages/SignUp'
import Landing from './pages/Landing'
import Header from './components/Header'
import {BrowserRouter,Routes,Route}from'react-router-dom'
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'
import TeacherLogin from './pages/TeacherLogin'
import TeacherSignUp from './pages/TeacherSignUp'
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute copy'
import Foot from './components/Foot'
import PrivateRoute from './components/PrivateRoute'
import Upload from './pages/Upload'
import FileList from './pages/FileList'
import PdfViewer from './pages/PdfViewer'
import CreatePost from './pages/CreatePost'
import UpdatePost from './pages/UpdatePost';
import './utils/api'; // Configure axios defaults
import PostPage from './pages/PostPage'
import Search from './pages/Search'
import VideoUpload from './pages/VideoUpload'
import VideoList from './pages/VideoList'
import VideoUploadNew from './pages/VideoUploadNew'
import AllBlogs from './pages/AllBlogs'
export default function App() {
  
  return (
  <BrowserRouter>
  <Header/>
  
   <Routes>
      {/* Public Routes - No Login Required */}
      <Route path="/" element={<Landing/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/teacher-login" element={<TeacherLogin/>}/>
      <Route path="/teacher-signup" element={<TeacherSignUp/>}/>
      
      {/* Protected Routes - Login Required */}
      <Route element={<PrivateRoute/>}>
        <Route path="/home" element={<Home />}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/blog" element={<Blog/>}/>
        <Route path="/all-blogs" element={<AllBlogs/>}/>
        <Route path="/filelist" element={<FileList />}/>
        <Route path="/view-file/:uuid" element={<PdfViewer />}/>
        <Route path="/video-list" element={<VideoList/>}/>
        <Route path="/search" element={<Search/>}/>
        <Route path="/post/:postSlug" element={<PostPage/>}/>
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>
      
      {/* Admin Only Routes */}
      <Route element={<OnlyAdminPrivateRoute/>}>
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/video-upload" element={<VideoUploadNew/>}/>
        <Route path="/video-manage" element={<VideoUpload/>}/>
        <Route path="/create-post" element={<CreatePost/>}/>
        <Route path='/update-post/:postId' element={<UpdatePost />} />
      </Route>
   </Routes>
   <Foot/>
  
  </BrowserRouter>
  )
}