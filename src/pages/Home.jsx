import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useProgress } from "../context/ProgressContext"
import { Button } from "../components/ui/button"
import { 
  Cloud, 
  Lock, 
  Share2, 
  Smartphone, 
  Search, 
  Trash2,
  FolderOpen,
  UploadCloud,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  MoreVertical
} from "lucide-react"

export function Home() {
  const { user } = useAuth()
  const { startUpload, updateProgress, completeUpload, isUploading } = useProgress()

  const simulateUpload = () => {
    if (isUploading) return;
    startUpload();
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15; // Simulate chunk uploads
      if (currentProgress >= 100) {
        clearInterval(interval);
        completeUpload();
      } else {
        updateProgress(currentProgress);
      }
    }, 300);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24">
        {/* Subtle Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
          <div className="w-[600px] h-[600px] rounded-full bg-blue-100/50 dark:bg-blue-900/20 blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
          <div className="w-[500px] h-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 blur-3xl" />
        </div>

        <div className="w-full px-4 md:px-12 lg:px-20 mx-auto max-w-[1600px]">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & CTAs */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium mb-6 border border-blue-100 dark:border-blue-900">
                <Lock className="w-4 h-4" />
                <span>Your Data, Always Secure</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                All your files.<br />
                One <span className="text-blue-600 dark:text-blue-500">secure</span> place.
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Store, access, and share your files from anywhere. CloudBox keeps your data safe, organized, and always within reach.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to={user ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-base h-12 px-8">
                    {user ? "Go to Dashboard" : "Get Started Free"}
                  </Button>
                </Link>
                <Link to="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                    Explore Features
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  Secure Encryption
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-500" />
                  Easy Sharing
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-500" />
                  Access Anywhere
                </div>
              </div>
            </div>

            {/* Right Column: Dashboard Mockup */}
            <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
              {/* Floating Decorative Elements */}
              <div className="absolute -left-6 lg:-left-12 top-1/4 animate-bounce-slow z-10 bg-background shadow-xl rounded-2xl p-4 border border-border">
                <FolderOpen className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="absolute -right-6 lg:-right-8 top-12 animate-pulse-slow z-10 bg-background shadow-xl rounded-full p-4 border border-border">
                <UploadCloud className="w-8 h-8 text-blue-500" />
              </div>
              <div className="absolute right-4 bottom-1/4 animate-bounce-slow z-10 bg-background shadow-xl rounded-full p-4 border border-border" style={{ animationDelay: "1s" }}>
                <Lock className="w-6 h-6 text-green-500" />
              </div>

              {/* Browser/Dashboard Window */}
              <div className="relative rounded-xl overflow-hidden border border-border bg-background shadow-2xl shadow-blue-500/10 w-full aspect-[4/3] sm:aspect-[16/10] flex flex-col">
                {/* Browser Header */}
                <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 flex-1 max-w-sm h-6 bg-background rounded border border-border mx-auto flex items-center px-3">
                    <Search className="w-3 h-3 text-muted-foreground mr-2" />
                    <div className="w-24 h-2 bg-muted rounded-full" />
                  </div>
                </div>

                {/* Dashboard Layout */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Sidebar Mockup */}
                  <div className="w-1/4 min-w-[120px] max-w-[200px] border-r border-border bg-muted/10 p-4 hidden sm:flex flex-col gap-4">
                    <div className="w-24 h-8 bg-blue-600/10 rounded-md flex items-center px-2 border border-blue-600/20">
                      <div className="w-4 h-4 rounded bg-blue-600 mr-2" />
                      <div className="w-12 h-2 bg-blue-600/40 rounded-full" />
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2 px-2">
                          <div className="w-4 h-4 rounded bg-muted-foreground/20" />
                          <div className="w-16 h-2 bg-muted-foreground/20 rounded-full" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-blue-500" />
                      </div>
                      <div className="w-16 h-2 bg-muted-foreground/30 rounded-full mt-2" />
                    </div>
                  </div>

                  {/* Main Content Mockup */}
                  <div className="flex-1 p-6 bg-background flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold flex items-center gap-2">
                        My Drive
                      </div>
                      <div 
                        onClick={simulateUpload}
                        className={`w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Simulate Upload"
                      >
                        <span className="text-lg leading-none">+</span>
                      </div>
                    </div>

                    {/* Folders Row */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-3">Folders</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Work', 'Projects', 'Personal'].map((folder, i) => (
                          <div key={i} className="p-3 border border-border rounded-lg bg-muted/5 flex flex-col gap-2">
                            <div className="flex justify-between">
                              <FolderOpen className={`w-6 h-6 ${i === 0 ? 'text-blue-500' : 'text-blue-300 dark:text-blue-700'}`} />
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{folder}</div>
                              <div className="text-[10px] text-muted-foreground">{12 + i*4} files</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Files List */}
                    <div className="flex-1 border border-border rounded-lg bg-muted/5 overflow-hidden flex flex-col">
                      <div className="flex items-center gap-2 p-3 border-b border-border text-xs font-medium text-muted-foreground">
                        <div className="flex-1 min-w-0">Name</div>
                        <div className="hidden sm:block w-12 shrink-0">Owner</div>
                        <div className="hidden sm:block w-12 shrink-0">Size</div>
                        <div className="w-4 shrink-0"></div>
                      </div>
                      
                      {/* File Items */}
                      <div className="flex flex-col divide-y divide-border">
                        {[
                          { icon: FileText, color: "text-red-500", name: "Project Proposal.pdf" },
                          { icon: FileSpreadsheet, color: "text-green-500", name: "Budget_2024.xlsx" },
                          { icon: FileImage, color: "text-blue-500", name: "Design_Assets.zip" },
                          { icon: FileVideo, color: "text-purple-500", name: "Demo_Recording.mp4" },
                        ].map((file, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 hover:bg-muted/30 transition-colors">
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <file.icon className={`w-4 h-4 ${file.color} flex-shrink-0`} />
                              <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <div className="hidden sm:block w-12 shrink-0 text-xs text-muted-foreground truncate">me</div>
                            <div className="hidden sm:block w-12 shrink-0 text-xs text-muted-foreground truncate">{2.4 * (i+1)} MB</div>
                            <div className="w-4 shrink-0 flex justify-end">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border">
        <div className="w-full px-4 md:px-12 lg:px-20 mx-auto max-w-[1600px]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage files</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to keep your data secure, organized, and accessible to the people who need it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Secure Cloud Storage</h3>
              <p className="text-sm text-muted-foreground">Bank-level encryption ensures your data is always safe and protected.</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Easy Collaboration</h3>
              <p className="text-sm text-muted-foreground">Share files and folders with team or clients with custom permissions.</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Powerful Search</h3>
              <p className="text-sm text-muted-foreground">Find files quickly with advanced search, filters, and sorting options.</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Trash & Restore</h3>
              <p className="text-sm text-muted-foreground">Recover deleted files within 30 days with our smart trash system.</p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Access Anywhere</h3>
              <p className="text-sm text-muted-foreground">Access your files anytime, anywhere from any device.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
