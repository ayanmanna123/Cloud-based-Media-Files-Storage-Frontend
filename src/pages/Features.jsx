import { 
  ShieldCheck, 
  FolderTree, 
  UploadCloud, 
  Share2, 
  Link as LinkIcon, 
  Search, 
  Clock, 
  Trash2,
  History,
  FileImage,
  Activity,
  Tags,
  Users,
  PieChart
} from "lucide-react"

export function Features() {
  const mvpFeatures = [
    {
      icon: ShieldCheck,
      title: "Secure Authentication",
      description: "Robust Email and OAuth login with secure session management and detailed user profiles.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: FolderTree,
      title: "Advanced Folder Management",
      description: "Full CRUD operations, hierarchical tree structure, and intuitive breadcrumb navigation.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    },
    {
      icon: UploadCloud,
      title: "Seamless File Operations",
      description: "Drag-and-drop uploads, file pickers, renaming, moving, and instant downloads.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: Share2,
      title: "Granular Sharing",
      description: "Share securely with Viewer or Editor roles, revoke access instantly, and audit permissions.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20"
    },
    {
      icon: LinkIcon,
      title: "Public Share Links",
      description: "Generate shareable links with customizable expiration dates and optional password protection.",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20"
    },
    {
      icon: Search,
      title: "Smart Search & Filtering",
      description: "Find exactly what you need by name, type, or owner, complete with dynamic sorting.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20"
    },
    {
      icon: Clock,
      title: "Quick Access",
      description: "Instantly jump back in with Recent files and organize your most important work with Favorites.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      icon: Trash2,
      title: "Smart Trash Recovery",
      description: "Accidentally deleted something? Recover files easily within a 30-day retention window.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    }
  ]

  const phase2Features = [
    {
      icon: History,
      title: "Version History",
      description: "Keep current pointers and access archived versions of your files.",
    },
    {
      icon: FileImage,
      title: "Rich Previews",
      description: "Instant in-app previews for images, PDFs, and basic text files with generated thumbnails.",
    },
    {
      icon: Activity,
      title: "Audit Logs",
      description: "Comprehensive tracking of all file activities and workspace events.",
    },
    {
      icon: Tags,
      title: "Advanced Organization",
      description: "Custom tags, powerful bulk actions, and lightning-fast keyboard shortcuts.",
    },
    {
      icon: Users,
      title: "Team Workspaces",
      description: "Shared drives for teams and deep content indexing for enterprise-grade search.",
    },
    {
      icon: PieChart,
      title: "Usage Analytics",
      description: "Detailed quotas and visually rich dashboards to monitor storage usage.",
    }
  ]

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
        <div className="w-[800px] h-[800px] rounded-full bg-blue-500/10 dark:bg-blue-900/20 blur-3xl" />
      </div>
      <div className="absolute top-1/2 left-0 -z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-900/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-20 pb-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold tracking-wide border border-blue-100 dark:border-blue-900 shadow-sm">
            <span>Platform Capabilities</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">master your data</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Discover a comprehensive suite of tools engineered for absolute security, seamless collaboration, and effortless file management.
          </p>
        </div>

        {/* Core MVP Features */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Core Features</h2>
              <p className="text-muted-foreground">The essential tools powering your everyday workflow.</p>
            </div>
            <div className="hidden sm:flex px-3 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground border border-border">
              Available Now
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mvpFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative flex flex-col p-6 bg-card hover:bg-muted/50 rounded-2xl border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} ${feature.color} border ${feature.borderColor} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-bold mb-3 group-hover:text-foreground transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 2 Features */}
        <div className="relative rounded-3xl overflow-hidden border border-border bg-muted/20 backdrop-blur-sm p-8 md:p-12 lg:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  Coming Soon
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Future of CloudBox</h2>
                <p className="text-lg text-muted-foreground">
                  We're constantly innovating. Here's a sneak peek at the powerful capabilities coming in our next major release.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {phase2Features.map((feature, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
