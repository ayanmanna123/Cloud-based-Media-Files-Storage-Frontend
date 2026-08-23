import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageKit from 'imagekit-javascript';

export function useDrive(folderId = null) {
  const { user, logout } = useAuth();
  const [data, setData] = useState({ folder: null, children: { folders: [], files: [] }, path: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFolder = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      let endpoint = `${import.meta.env.VITE_API_URL}/api/folders/root`;
      if (folderId === 'shared') {
        endpoint = `${import.meta.env.VITE_API_URL}/api/shares/me`;
      } else if (folderId) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/folders/${folderId}`;
      }
        
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to fetch folder contents');
      }

      const result = await response.json();
      if (folderId === 'shared') {
        setData({
          folder: { id: 'shared', name: 'Shared with me' },
          children: { folders: result.folders || [], files: result.files || [] },
          path: [{ id: 'shared', name: 'Shared with me' }]
        });
      } else {
        setData(result);
      }
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

  const uploadFile = async (file, abortSignal = null) => {
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
        signal: abortSignal
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.message || 'Failed to initialize upload');
      }
      
      const initData = await initRes.json();
      
      // 2. Upload directly to ImageKit using fetch (supports aborting)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', initData.upload.auth.signature);
      formData.append('expire', initData.upload.auth.expire);
      formData.append('token', initData.upload.auth.token);
      formData.append('fileName', initData.storageKey.split('/').pop() || file.name);
      formData.append('folder', initData.storageKey.split('/').slice(0, -1).join('/') || "/");
      formData.append('useUniqueFileName', 'false');

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
        signal: abortSignal
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload to ImageKit');
      }

      // 3. Complete upload on backend
      const completeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/files/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileId: initData.fileId }),
        signal: abortSignal
      });

      if (!completeRes.ok) {
        const err = await completeRes.json();
        throw new Error(err.message || 'Failed to complete upload');
      }

      // 4. Refresh to show new file
      await fetchFolder();
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log("Upload aborted by user");
        throw err;
      }
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

  const fetchShares = async (resourceType, resourceId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares/${resourceType}/${resourceId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch shares');
      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const shareResource = async (resourceType, resourceId, email, role, message) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resourceType, resourceId, email, role, message })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to share resource');
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const revokeShare = async (shareId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shares/${shareId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to revoke share');
    } catch (err) {
      console.error(err);
      throw err;
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
    fetchShares,
    shareResource,
    revokeShare,
    refresh: fetchFolder
  };
}
