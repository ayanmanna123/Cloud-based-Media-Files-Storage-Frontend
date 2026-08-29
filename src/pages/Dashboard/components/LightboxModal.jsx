import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { FileImage, FileVideo, Download, X, ChevronLeft, ChevronRight, ShieldCheck, Loader2 } from "lucide-react"
import { useAuth } from "../../../context/AuthContext"
import { deriveEncryptionKey, decryptFileBuffer, decryptFileWithFallbackKeys } from "../../../lib/cryptoUtils"

export function LightboxModal({ isOpen, file, files = [], onClose, onNavigate }) {
  const { user } = useAuth();
  const [mediaUrl, setMediaUrl] = useState(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [decryptError, setDecryptError] = useState(null);

  const isVideo = file?.name?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  const defaultFileUrl = file ? `${import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}/${file.storageKey}` : '';

  useEffect(() => {
    let activeBlobUrl = null;

    const loadMedia = async () => {
      if (!file || !isOpen) return;
      setDecryptError(null);

      const isEncrypted = file.isEncrypted || file.is_encrypted;
      if (isEncrypted) {
        setLoadingMedia(true);
        try {
          // Fetch file info from backend
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${file.id}`, {
            credentials: 'include'
          });
          if (!res.ok) throw new Error('Failed to fetch encrypted file details');
          const data = await res.json();
          
          const fileRes = await fetch(data.signedUrl);
          if (!fileRes.ok) throw new Error('Failed to download encrypted payload');
          
          const arrayBuffer = await fileRes.arrayBuffer();
          const encIv = file.encryptionIv || file.encryption_iv || data.file?.encryptionIv || data.file?.encryption_iv;
          const decryptedBuffer = await decryptFileWithFallbackKeys(arrayBuffer, user, encIv, data.file || file);
          
          const blob = new Blob([decryptedBuffer], { type: file.mimeType || file.mime_type || (isVideo ? 'video/mp4' : 'image/jpeg') });
          activeBlobUrl = URL.createObjectURL(blob);
          setMediaUrl(activeBlobUrl);
        } catch (err) {
          console.error("Failed to decrypt media preview:", err);
          setDecryptError(err.message);
        } finally {
          setLoadingMedia(false);
        }
      } else {
        setMediaUrl(defaultFileUrl);
      }
    };

    loadMedia();

    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [file, isOpen, user]);

  if (!file) return null;

  const mediaFiles = files.filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp|avif|heic|heif|mp4|mov|avi|mkv|webm)$/i));
  const currentIndex = mediaFiles.findIndex(f => f.id === file.id);
  
  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0 && onNavigate) {
      onNavigate(mediaFiles[currentIndex - 1]);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < mediaFiles.length - 1 && onNavigate) {
      onNavigate(mediaFiles[currentIndex + 1]);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (mediaUrl && (file.isEncrypted || file.is_encrypted)) {
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const link = document.createElement('a');
      link.href = `${defaultFileUrl}?ik-attachment=true`;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') handlePrev(e);
          if (e.key === 'ArrowRight') handleNext(e);
        }}
        className="max-w-[95vw] w-full h-[95vh] bg-black/95 border-none p-0 flex flex-col justify-center items-center shadow-2xl overflow-hidden [&>button]:hidden sm:max-w-[90vw]"
      >
        <VisuallyHidden>
          <DialogTitle>{file.name}</DialogTitle>
        </VisuallyHidden>

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50 text-white">
          <div className="flex items-center gap-3">
            {isVideo ? <FileVideo className="w-5 h-5 text-gray-300" /> : <FileImage className="w-5 h-5 text-gray-300" />}
            <span className="font-medium truncate max-w-sm md:max-w-xl text-shadow-sm">{file.name}</span>
            {(file.isEncrypted || file.is_encrypted) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AES-256 Encrypted</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm ml-2"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center p-4 sm:p-12 mt-8 relative group">
          {/* Previous Button */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              title="Previous (Left Arrow)"
              className="absolute left-2 sm:left-6 p-2 sm:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-50"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {loadingMedia ? (
            <div className="flex flex-col items-center justify-center text-white gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
              <p className="text-sm font-medium text-gray-300">Decrypting media with Web Crypto API...</p>
            </div>
          ) : decryptError ? (
            <div className="flex flex-col items-center justify-center text-red-400 gap-2">
              <p className="text-base font-semibold">Decryption Failed</p>
              <p className="text-xs text-gray-400">{decryptError}</p>
            </div>
          ) : isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video 
                src={mediaUrl} 
                controls 
                autoPlay
                className="w-full h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={mediaUrl} 
                alt={file.name} 
                className="w-full h-full object-contain select-none transition-transform duration-300 ease-out"
              />
            </div>
          )}

          {/* Next Button */}
          {currentIndex < mediaFiles.length - 1 && currentIndex !== -1 && (
            <button
              onClick={handleNext}
              title="Next (Right Arrow)"
              className="absolute right-2 sm:right-6 p-2 sm:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-50"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
