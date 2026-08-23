import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageKit from 'imagekit-javascript';

export function useDrive(folderId = null) {
  const { user } = useAuth();
  const [data, setData] = useState({ folder: null, children: { folders: [], files: [] }, path: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFolder = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const endpoint = folderId 
        ? `${import.meta.env.VITE_API_URL}/api/folders/${folderId}`
        : `${import.meta.env.VITE_API_URL}/api/folders/root`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folder contents');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [folderId, user]);

  useEffect(() => {
    fetchFolder();
  }, [fetchFolder]);

  const createFolder = async (name) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, parentId: folderId }),
      });

      if (!response.ok) throw new Error('Failed to create folder');
      
      const newFolder = await response.json();
      setData(prev => ({
        ...prev,
        children: {
          ...prev.children,
          folders: [...prev.children.folders, newFolder]
        }
      }));
      return newFolder;
    } catch (err) {
      throw err;
    }
  };

  const renameFolder = async (id, newName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/folders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to rename folder');
      
      const updatedFolder = await response.json();
      setData(prev => ({
        ...prev,
        children: {
          ...prev.children,
          folders: prev.children.folders.map(f => f.id === id ? updatedFolder : f)
        }
      }));
    } catch (err) {
      throw err;
    }
  };

  const deleteFolder = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/folders/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete folder');
      
      setData(prev => ({
        ...prev,
        children: {
          ...prev.children,
          folders: prev.children.folders.filter(f => f.id !== id)
        }
      }));
    } catch (err) {
      throw err;
    }
  };

  const uploadFile = async (file) => {
    try {
      // 1. Initialize upload on backend
      const initRes = await fetch(`${import.meta.env.VITE_API_URL}/api/files/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name: file.name, 
          mimeType: file.type || 'application/octet-stream', 
          sizeBytes: file.size, 
          folderId 
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.message || 'Failed to initialize upload');
      }
      
      const initData = await initRes.json();
      
      // 2. Upload directly to ImageKit
      const imagekit = new ImageKit({
        publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
      });

      await new Promise((resolve, reject) => {
        imagekit.upload({
          file: file,
          fileName: initData.storageKey.split('/').pop() || file.name,
          useUniqueFileName: false,
          token: initData.upload.auth.token,
          signature: initData.upload.auth.signature,
          expire: initData.upload.auth.expire,
          folder: initData.storageKey.split('/').slice(0, -1).join('/') || "/"
        }, function(err, result) {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // 3. Complete upload on backend
      const completeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/files/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileId: initData.fileId }),
      });

      if (!completeRes.ok) {
        const err = await completeRes.json();
        throw new Error(err.message || 'Failed to complete upload');
      }

      // 4. Refresh to show new file
      await fetchFolder();
      
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const renameFile = async (id, newName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) throw new Error('Failed to rename file');
      const updatedFile = await response.json();
      setData(prev => ({
        ...prev,
        children: {
          ...prev.children,
          files: prev.children.files.map(f => f.id === id ? updatedFile : f)
        }
      }));
    } catch (err) { throw err; }
  };

  const deleteFile = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete file');
      setData(prev => ({
        ...prev,
        children: {
          ...prev.children,
          files: prev.children.files.filter(f => f.id !== id)
        }
      }));
    } catch (err) { throw err; }
  };

  const moveFile = async (id, newFolderId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId: newFolderId }),
      });
      if (!response.ok) throw new Error('Failed to move file');
      // Remove from current view
      setData(prev => ({
        ...prev,
        children: {
          ...prev.children,
          files: prev.children.files.filter(f => f.id !== id)
        }
      }));
    } catch (err) { throw err; }
  };

  const downloadFile = async (id, fileName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to get download URL');
      const data = await response.json();
      
      if (data.signedUrl) {
        // Fetch as blob to bypass cross-origin tab opening and ImageKit header bugs
        const fileRes = await fetch(data.signedUrl);
        if (!fileRes.ok) throw new Error('Failed to download file from storage');
        const blob = await fileRes.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) { 
      console.error("Download error:", err);
      alert("Error downloading file: " + err.message);
      throw err; 
    }
  };

  const fetchAllFolders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/folders/all`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch all folders');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return {
    ...data,
    loading,
    error,
    createFolder,
    renameFolder,
    deleteFolder,
    uploadFile,
    renameFile,
    deleteFile,
    moveFile,
    downloadFile,
    fetchAllFolders,
    refresh: fetchFolder
  };
}
