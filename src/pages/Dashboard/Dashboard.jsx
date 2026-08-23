import { 
  FolderOpen, 
  MoreVertical, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileVideo 
} from "lucide-react"
import { Button } from "../../components/ui/button"

export function Dashboard() {
  // Mock Data
  const folders = [
    { name: 'Work', files: 12, color: 'text-blue-500' },
    { name: 'Projects', files: 8, color: 'text-indigo-500' },
    { name: 'Personal', files: 24, color: 'text-purple-500' },
    { name: 'Designs', files: 16, color: 'text-blue-400' }
  ]

  const files = [
    { icon: FileText, color: "text-red-500", name: "Project Proposal.pdf", owner: "me", date: "May 20, 2024", size: "2.4 MB" },
    { icon: FileSpreadsheet, color: "text-green-500", name: "Budget_2024.xlsx", owner: "me", date: "May 18, 2024", size: "1.1 MB" },
    { icon: FileImage, color: "text-blue-500", name: "Design_Assets.zip", owner: "me", date: "May 15, 2024", size: "3.2 MB" },
    { icon: FileVideo, color: "text-purple-500", name: "Demo_Recording.mp4", owner: "me", date: "May 8, 2024", size: "25.6 MB" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Drive</h1>
        <div className="flex items-center gap-2">
          {/* We can add view toggles or filters here later */}
        </div>
      </div>

      {/* Folders Section */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder, i) => (
            <div 
              key={i} 
              className="group p-4 border border-border rounded-xl bg-card hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <FolderOpen className={`w-8 h-8 ${folder.color}`} />
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <div>
                <div className="font-medium">{folder.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{folder.files} files</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Files Section */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Files</h2>
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground">
            <div className="col-span-12 sm:col-span-6 md:col-span-5">Name</div>
            <div className="hidden sm:block sm:col-span-3 md:col-span-2">Owner</div>
            <div className="hidden md:block md:col-span-3">Last modified</div>
            <div className="hidden sm:block sm:col-span-2 md:col-span-1">Size</div>
            <div className="col-span-1 flex justify-end"></div>
          </div>
          
          {/* File Items */}
          <div className="flex flex-col divide-y divide-border">
            {files.map((file, i) => (
              <div 
                key={i} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                <div className="col-span-11 sm:col-span-6 md:col-span-5 flex items-center gap-3">
                  <file.icon className={`w-5 h-5 ${file.color}`} />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <div className="hidden sm:block sm:col-span-3 md:col-span-2 text-sm text-muted-foreground">{file.owner}</div>
                <div className="hidden md:block md:col-span-3 text-sm text-muted-foreground">{file.date}</div>
                <div className="hidden sm:block sm:col-span-2 md:col-span-1 text-sm text-muted-foreground">{file.size}</div>
                <div className="col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
