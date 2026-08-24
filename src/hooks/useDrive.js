import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageKit from 'imagekit-javascript';

export function useDrive(folderId = null) {
  const { user, logout } = useAuth();
  const [data, setData] = useState({ folder: null, children: { folders: [], files: [] }, path: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starredItems, setStarredItems] = useState([]);

  const fetchStarredItems = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?starred=true`, { credentials: 'include' });
      if (res.ok) {
        const result = await res.json();
        setStarredItems(result.map(item => `${item.type}_${item.id}`));
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchStarredItems();
  }, [fetchStarredItems]);

  const fetchFolder = useCallback(async (showLoading = true) => {
    if (!user) return;
    
    if (showLoading) setLoading(true);
    setError(null);
    try {
      let endpoint = `${import.meta.env.VITE_API_URL}/api/folders/root`;
      if (folderId === 'shared') {
        endpoint = `${import.meta.env.VITE_API_URL}/api/shares/me`;
      } else if (folderId === 'recent') {
        endpoint = `${import.meta.env.VITE_API_URL}/api/tracking/recent`;
      } else if (folderId === 'starred') {
        endpoint = `${import.meta.env.VITE_API_URL}/api/search?starred=true`;
      } else if (folderId === 'trash') {
        endpoint = `${import.meta.env.VITE_API_URL}/api/trash`;
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
      } else if (folderId === 'recent') {
        setData({
          folder: { id: 'recent', name: 'Recent' },
          children: { 
            folders: result.filter(r => r.itemType === 'folder') || [], 
            files: result.filter(r => r.itemType === 'file') || [] 
          },
          path: [{ id: 'recent', name: 'Recent' }]
        });
      } else if (folderId === 'starred' || folderId === 'trash') {
        const title = folderId.charAt(0).toUpperCase() + folderId.slice(1);
        setData({
          folder: { id: folderId, name: title },
          children: { 
            folders: result.filter(r => r.type === 'folder') || [], 
            files: result.filter(r => r.type === 'file') || [] 
          },
          path: [{ id: folderId, name: title }]
        });
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
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

  const uploadFile = async (file, abortSignal = null, targetFolderId = folderId, targetFileId = null, onProgress = null) => {
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
          folderId: targetFolderId,
          targetFileId: targetFileId
        }),
        signal: abortSignal
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.message || 'Failed to initialize upload');
      }
      
      const initData = await initRes.json();
      
      // 2. Upload directly to ImageKit using XMLHttpRequest for progress tracking
      const formData = new FormData();
      formData.append('file', file);
      formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', initData.upload.auth.signature);
      formData.append('expire', initData.upload.auth.expire);
      formData.append('token', initData.upload.auth.token);
      formData.append('fileName', initData.storageKey.split('/').pop() || file.name);
      formData.append('folder', initData.storageKey.split('/').slice(0, -1).join('/') || "/");
      formData.append('useUniqueFileName', 'false');

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();
        let lastReportTime = startTime;
        let lastLoaded = 0;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const currentTime = Date.now();
            const timeElapsed = (currentTime - lastReportTime) / 1000; // in seconds
            
            // Only update speed/ETA every 500ms for stability
            if (timeElapsed >= 0.5 || e.loaded === e.total) {
              const progress = (e.loaded / e.total) * 100;
              const bytesSinceLast = e.loaded - lastLoaded;
              const speed = bytesSinceLast / timeElapsed; // bytes per second
              
              const remainingBytes = e.total - e.loaded;
              const timeRemaining = speed > 0 ? remainingBytes / speed : 0;
              
              onProgress({
                progress,
                speed,
                timeRemaining,
                loaded: e.loaded,
                totalSize: e.total
              });
              
              lastReportTime = currentTime;
              lastLoaded = e.loaded;
            } else if (onProgress) {
              // Always update progress percentage smoothly
              onProgress({
                progress: (e.loaded / e.total) * 100,
                loaded: e.loaded,
                totalSize: e.total
              });
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Failed to upload to ImageKit'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));

        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            xhr.abort();
            reject(new DOMException('Upload aborted', 'AbortError'));
          });
        }

        xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
        xhr.send(formData);
      });

      // 3. Complete upload on backend
      const completeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/files/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          fileId: initData.fileId,
          isNewVersion: initData.isNewVersion,
          storageKey: initData.storageKey,
          sizeBytes: file.size
        }),
        signal: abortSignal
      });

      if (!completeRes.ok) {
        const err = await completeRes.json();
        throw new Error(err.message || 'Failed to complete upload');
      }

      // 4. Refresh to show new file
      await fetchFolder(false);
      
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

  const fetchRecentFiles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tracking/recent`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch recent files');
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const trackOpen = async (id, type) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tracking/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, type })
      });
    } catch (err) {
      console.error('Failed to track open:', err);
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

  const fetchLinkShare = async (resourceType, resourceId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/link-shares/resource/${resourceType}/${resourceId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch link share');
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const createLinkShare = async (resourceType, resourceId, expiresAt, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/link-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ resourceType, resourceId, expiresAt, password })
      });
      if (!response.ok) throw new Error('Failed to create public link');
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteLinkShare = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/link-shares/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete link');
    } catch (err) {
      console.error('Failed to delete link share:', err);
      throw err;
    }
  };

  const createBundleShare = async (fileIds, expiresAt, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/link-shares/bundle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ fileIds, expiresAt, password })
      });
      if (!response.ok) throw new Error('Failed to create bundle share');
      return await response.json();
    } catch (err) {
      console.error('Failed to create bundle share:', err);
      throw err;
    }
  };

  const fetchBundleShare = async (token, password) => {
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/link-shares/bundle/${token}`;
      if (password) url += `?password=${encodeURIComponent(password)}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch bundle link');
      return await response.json();
    } catch (err) {
      console.error('Failed to fetch bundle share:', err);
      throw err;
    }
  };

  const toggleStar = async (resourceId, resourceType, isStarred) => {
    try {
      const method = isStarred ? 'DELETE' : 'POST';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stars`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resourceId, resourceType })
      });
      
      if (!response.ok) throw new Error('Failed to toggle star');
      
      setStarredItems(prev => 
        isStarred 
          ? prev.filter(id => id !== `${resourceType}_${resourceId}`)
          : [...prev, `${resourceType}_${resourceId}`]
      );
      
      if (folderId === 'starred' && isStarred) {
        setData(prevData => ({
          ...prevData,
          children: {
            folders: prevData.children.folders.filter(f => f.id !== resourceId),
            files: prevData.children.files.filter(f => f.id !== resourceId)
          }
        }));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const restoreItem = async (resourceId, resourceType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trash/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resourceId, resourceType })
      });
      if (!response.ok) throw new Error('Failed to restore item');
      
      setData(prevData => ({
        ...prevData,
        children: {
          folders: prevData.children.folders.filter(f => !(resourceType === 'folder' && f.id === resourceId)),
          files: prevData.children.files.filter(f => !(resourceType === 'file' && f.id === resourceId))
        }
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteForever = async (resourceId, resourceType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trash/${resourceType}/${resourceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to permanently delete item');
      
      setData(prevData => ({
        ...prevData,
        children: {
          folders: prevData.children.folders.filter(f => !(resourceType === 'folder' && f.id === resourceId)),
          files: prevData.children.files.filter(f => !(resourceType === 'file' && f.id === resourceId))
        }
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    folder: data.folder,
    children: data.children,
    path: data.path,
    loading,
    error,
    starredItems,
    fetchFolder,
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
    fetchRecentFiles,
    trackOpen,
    shareResource,
    revokeShare,
    fetchLinkShare,
    createLinkShare,
    deleteLinkShare,
    createBundleShare,
    fetchBundleShare,
    toggleStar,
    restoreItem,
    deleteForever,
    refresh: fetchFolder
  };
}
