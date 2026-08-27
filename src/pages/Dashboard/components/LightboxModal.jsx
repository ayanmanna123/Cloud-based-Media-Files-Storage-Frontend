import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { FileImage, FileVideo, FileText, Download, X, ChevronLeft, ChevronRight, Loader2, Table as TableIcon, FileSpreadsheet } from "lucide-react"
import { getFileMediaUrl } from "../../../utils/fileUrl"
import mammoth from "mammoth"
import * as XLSX from "xlsx"

export function LightboxModal({ isOpen, file, files = [], onClose, onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docHtml, setDocHtml] = useState(null);
  const [excelSheets, setExcelSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [textContent, setTextContent] = useState(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setDocHtml(null);
      setExcelSheets([]);
      setTextContent(null);
      setError(null);
      return;
    }

    const url = getFileMediaUrl(file);
    const isDocx = file.name.match(/\.(docx|doc)$/i);
    const isExcel = file.name.match(/\.(xlsx|xls|csv)$/i);
    const isText = file.name.match(/\.(txt|md|json|js|jsx|ts|tsx|html|css|xml|yml|yaml|ini|env|log)$/i);

    if (isDocx) {
      setLoading(true);
      setError(null);
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch document");
          return res.arrayBuffer();
        })
        .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
        .then(result => {
          setDocHtml(result.value || "<p>Document is empty.</p>");
          setLoading(false);
        })
        .catch(err => {
          console.error("Docx render error:", err);
          setError("Unable to render Word document inline. Click Download to open.");
          setLoading(false);
        });
    } else if (isExcel) {
      setLoading(true);
      setError(null);
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch spreadsheet");
          return res.arrayBuffer();
        })
        .then(arrayBuffer => {
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
          const sheets = workbook.SheetNames.map(name => ({
            name,
            html: XLSX.utils.sheet_to_html(workbook.Sheets[name])
          }));
          setExcelSheets(sheets);
          setActiveSheetIndex(0);
          setLoading(false);
        })
        .catch(err => {
          console.error("Excel render error:", err);
          setError("Unable to render spreadsheet inline. Click Download to open.");
          setLoading(false);
        });
    } else if (isText) {
      setLoading(true);
      setError(null);
      fetch(url)
        .then(res => res.text())
        .then(text => {
          setTextContent(text);
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to load text content.");
          setLoading(false);
        });
    }
  }, [isOpen, file]);

  if (!file) return null;

  const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const isVideo = file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  const isPdf = file.name.match(/\.(pdf)$/i);
  const isDocx = file.name.match(/\.(docx|doc)$/i);
  const isExcel = file.name.match(/\.(xlsx|xls|csv)$/i);
  const isText = file.name.match(/\.(txt|md|json|js|jsx|ts|tsx|html|css|xml|yml|yaml|ini|env|log)$/i);

  const fileUrl = getFileMediaUrl(file);

  const mediaFiles = files.filter(f => f.name);
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

  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-50 text-white">
          <div className="flex items-center gap-3">
            {isVideo ? (
              <FileVideo className="w-5 h-5 text-blue-400" />
            ) : isImage ? (
              <FileImage className="w-5 h-5 text-green-400" />
            ) : isExcel ? (
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            ) : (
              <FileText className="w-5 h-5 text-blue-400" />
            )}
            <span className="font-medium truncate max-w-sm md:max-w-xl text-shadow-sm">{file.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
              title="Download File"
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

        {/* Main Content Area */}
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-10 mt-8 relative group">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              title="Previous"
              className="absolute left-2 sm:left-6 p-2 sm:p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md z-50"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
              <p className="text-sm font-medium">Opening document...</p>
            </div>
          ) : error ? (
            <div className="bg-slate-900 border border-slate-800 text-slate-200 p-8 rounded-2xl max-w-md text-center">
              <p className="text-red-400 font-medium mb-4">{error}</p>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download File
              </button>
            </div>
          ) : isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video src={fileUrl} controls autoPlay className="w-full h-full object-contain rounded-lg shadow-lg" />
            </div>
          ) : isImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img src={fileUrl} alt={file.name} className="w-full h-full object-contain select-none transition-transform duration-300 ease-out" />
            </div>
          ) : isPdf ? (
            <div className="w-full h-full bg-white rounded-lg overflow-hidden pt-6">
              <iframe src={fileUrl} className="w-full h-full border-none" title={file.name} />
            </div>
          ) : isDocx ? (
            /* Microsoft Word Viewer Container */
            <div className="w-full h-[85vh] bg-white text-slate-900 p-8 sm:p-12 rounded-xl overflow-auto shadow-2xl mt-6 max-w-4xl mx-auto border border-slate-200 prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: docHtml || "" }} />
            </div>
          ) : isExcel ? (
            /* Microsoft Excel Viewer Container */
            <div className="w-full h-[85vh] bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl mt-6 flex flex-col border border-slate-200">
              {/* Sheet Tabs */}
              {excelSheets.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-100 p-2 border-b border-slate-200 overflow-x-auto">
                  {excelSheets.map((sheet, idx) => (
                    <button
                      key={sheet.name}
                      onClick={() => setActiveSheetIndex(idx)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        activeSheetIndex === idx
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              )}
              {/* Table Data */}
              <div 
                className="flex-1 overflow-auto p-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:p-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_td]:text-xs"
                dangerouslySetInnerHTML={{ __html: excelSheets[activeSheetIndex]?.html || "<p>No data</p>" }}
              />
            </div>
          ) : isText ? (
            <div className="w-full h-[85vh] bg-slate-900 text-slate-100 p-6 rounded-lg overflow-auto font-mono text-sm border border-slate-700 mt-6">
              <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
            </div>
          ) : null}

          {currentIndex < mediaFiles.length - 1 && currentIndex !== -1 && (
            <button
              onClick={handleNext}
              title="Next"
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
