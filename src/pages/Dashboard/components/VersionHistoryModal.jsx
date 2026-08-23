import { useState, useEffect } from 'react';
import { X, Clock, FileText, Download, RotateCcw } from 'lucide-react';

export function VersionHistoryModal({ isOpen, onClose, fileId, fileName, currentVersionId, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !fileId) return;

    const fetchVersions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${fileId}/versions`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch version history');
        const data = await res.json();
        setVersions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [isOpen, fileId]);

  if (!isOpen) return null;

  const handleRestore = async (versionId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${fileId}/versions/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ versionId })
      });
      if (!res.ok) throw new Error('Failed to restore version');
      onRestore(); // trigger refresh
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const getFileUrl = (storageKey) => {
    return `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${storageKey}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Version History</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border bg-muted/30">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Uploading a file with the exact same name to this folder adds a new version.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center p-4"><span className="animate-pulse">Loading versions...</span></div>
          ) : error ? (
            <div className="text-red-500 text-sm p-4 text-center">{error}</div>
          ) : versions.length === 0 ? (
            <div className="text-muted-foreground text-sm p-4 text-center">No versions found.</div>
          ) : (
            versions.map((v, index) => {
              const isCurrent = v.id === currentVersionId;
              const date = new Date(v.createdAt).toLocaleString();
              const sizeMB = (v.sizeBytes / (1024 * 1024)).toFixed(2);
              
              return (
                <div key={v.id} className={`p-3 rounded-lg border ${isCurrent ? 'border-blue-500 bg-blue-50/10' : 'border-border bg-card'} flex items-start gap-3`}>
                  <div className="mt-1">
                    <FileText className={`w-5 h-5 ${isCurrent ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                        Version {v.versionNumber} {isCurrent && '(Current)'}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{sizeMB} MB</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{date}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <a 
                        href={getFileUrl(v.storageKey)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> View / Download
                      </a>
                      {!isCurrent && (
                        <button 
                          onClick={() => handleRestore(v.id)}
                          className="text-xs text-green-600 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
