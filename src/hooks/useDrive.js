import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

  return {
    ...data,
    loading,
    error,
    createFolder,
    renameFolder,
    deleteFolder,
    refresh: fetchFolder
  };
}
