import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useState } from "react";

export default function FileCard({ file, onDelete }) {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [deleting, setDeleting] = useState(false);

  const handleCardClick = (e) => {
    // Don't navigate if clicking delete button
    if (e.target.closest('.delete-btn')) {
      return;
    }
    navigate(`/view-file/${file.uuid}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${file.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await axios.delete(`/api/file/delete/${file.uuid}`, {
        withCredentials: true
      });
      
      console.log('Delete response:', response.data);
      
      if (onDelete) {
        onDelete(file.uuid);
      }
    } catch (error) {
      console.error('Error deleting file:', error.response?.data || error.message);
      alert(`Failed to delete file: ${error.response?.data?.error || error.message}`);
      setDeleting(false);
    }
  };

  // Get file type label and color
  const getFileType = () => {
    const fileName = file.title.toLowerCase();
    
    if (fileName.includes('.pdf') || file.image?.includes('pdf')) {
      return { label: 'PDF', color: 'bg-red-500' };
    }
    if (fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif') || fileName.includes('.svg')) {
      return { label: 'IMAGE', color: 'bg-green-500' };
    }
    if (fileName.includes('.doc') || fileName.includes('.docx')) {
      return { label: 'DOC', color: 'bg-blue-500' };
    }
    if (fileName.includes('.xls') || fileName.includes('.xlsx')) {
      return { label: 'EXCEL', color: 'bg-emerald-500' };
    }
    if (fileName.includes('.ppt') || fileName.includes('.pptx')) {
      return { label: 'PPT', color: 'bg-orange-500' };
    }
    if (fileName.includes('.zip') || fileName.includes('.rar')) {
      return { label: 'ZIP', color: 'bg-purple-500' };
    }
    if (fileName.includes('.txt')) {
      return { label: 'TEXT', color: 'bg-gray-500' };
    }
    return { label: 'FILE', color: 'bg-gray-600' };
  };

  const fileType = getFileType();

  return (
    <div 
      className="relative cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
      onClick={handleCardClick}
    >
      {currentUser?.isAdmin && (
        <button
          className="delete-btn absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? '...' : '🗑️'}
        </button>
      )}
      
      <div className="flex flex-col items-center">
        {/* File Type Badge */}
        <div className={`${fileType.color} text-white px-4 py-2 rounded-lg font-bold text-sm mb-3 shadow-md`}>
          {fileType.label}
        </div>
        
        <h3 className="text-base font-semibold text-gray-800 dark:text-white text-center line-clamp-2 mb-2">
          {file.title}
        </h3>
        {file.folder && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
            📁 {file.folder}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {file.uuid.substring(0, 10)}...
        </p>
      </div>
    </div>
  );
}