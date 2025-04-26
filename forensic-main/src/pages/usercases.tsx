
// FULL UPDATED CODE
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator
  } from "@/components/ui/dropdown-menu";

import {
  ArrowLeft,
  BarChart3,
  Book,
  Camera,
  Eye,
  FileText,
  FileUp,
  Fingerprint,
  Image,
  Info,
  LayoutGrid,
  MessageSquare,
  Microscope,
  Plus,
  Scroll,
  Settings,
  Share,
  Trash2,
  UploadCloud,
  Send

} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Case() {
    const { caseId } = useParams();
    const [caseName, setCaseName] = useState(`Case #${caseId?.replace("case-", "")}`);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [typedSummary, setTypedSummary] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"sources" | "chat" | "studio">("sources");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [officer,setofficer]=useState("Chat Interface");
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [BgColor,setBgColor]=useState("bg-white");

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // useEffect(async()=>{
    //     try{
    //         const chat=await axios.post("http://localhost:5500/commonscases",)
    //     }
    // })

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let uploadedCount = 0;

        Array.from(files).forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        setUploadedImages((prev) => [...prev, e.target!.result!.toString()]);
                        uploadedCount++;
                        if (uploadedCount === files.length) {
                            toast({
                                title: "Upload Successful",
                                description: `Uploaded ${files.length} image${files.length !== 1 ? "s" : ""}.`,
                            });
                        }
                    }
                };
                reader.readAsDataURL(file);
            } else {
                toast({
                    title: "Invalid File Type",
                    description: "Only image files are supported at this time.",
                    variant: "destructive",
                });
            }
        });

        if (e.target) {
            e.target.value = "";
        }
    };

    const handleDeleteImage = (index: number) => {
        const newImages = [...uploadedImages];
        newImages.splice(index, 1);
        setUploadedImages(newImages);

        toast({
            title: "Image Deleted",
            description: "The image has been removed from your case.",
        });

        if (selectedImage === uploadedImages[index]) {
            setSelectedImage(null);
            setSummary(null);
        }
    };

    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setSummary(null);
    };

    
    const fetchSummary = async () => {
      if (!selectedImage) return;
    
      toast({ title: "Summarizing...", description: "Fetching summary from AI model." });
    
      try {
    
        // Convert base64 data URL to Blob
        const res = await fetch(selectedImage);
        const blob = await res.blob();
        const filename = `evidence_${Date.now()}.png`;
    
        // Create FormData
        const formData = new FormData();
        formData.append("case_id", caseId || "unknown_case");
        formData.append("image_id", filename);
        formData.append("image", blob, filename);
        console.log(formData);
        const response = await fetch("http://localhost:8000/generate-summary", {
          method: "POST",
          body: formData,
        });
    
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
    
        const data = await response.json();
        console.log(data);
        if (data.summary) {
          setSummary(data.summary); // Store full summary for backup if needed
          animateTyping(data.summary);
        } else {
          throw new Error("No summary returned.");
        }
        
      } catch (error) {
        console.error("Error fetching summary:", error);
        toast({
          title: "Summary Failed",
          description: error.message || "Unable to get summary from the API.",
          variant: "destructive",
        });
      }
    };
    const [messages, setMessages] = useState([
        { from: "other", text: "Hello! How can I help you today?" },
      ]);
      
    const [chatMessages, setChatMessages] = useState<{ text: string, isBot: boolean }[]>([]);
    const [messageInput, setMessageInput] = useState('');

    
    const sendMessage = async () => {
      if (!messageInput.trim()) return;
    
      const currentMessage = messageInput;
      setMessageInput('');
    
      // Optimistically show the message
      const tempId = Date.now(); // unique id for temp tracking
      setChatMessages(prev => [...prev, { id: tempId, text: currentMessage, isBot: false, sending: true }]);
    
      try {
        await axios.post('http://localhost:5500/messages', {
          // receiverId,
          text: currentMessage
        });
    
        // After success, mark message as sent
        // setChatMessages(prev => prev.map(msg => 
        //   msg.id === tempId ? { ...msg, sending: false } : msg
        // ));
    
      } catch (error) {
        console.error('Failed to send message:', error);
    
        // Optionally mark message as failed
        // setChatMessages(prev => prev.map(msg => 
        //   msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
        // ));
      }
    };
    


    

    const analyzeEvidence = () => {
        setIsAnalyzing(true);
        toast({ title: "Analysis Started", description: "Analyzing your evidence..." });

        setTimeout(() => {
            setIsAnalyzing(false);
            if (!isMobile) setActiveTab("studio");
            toast({ title: "Analysis Complete", description: "View results in Studio tab." });
        }, 2000);
    };

    return (
        // <div className={`flex flex-col h-screen min-h-screen p-6 transition-colors duration-300 ${BgColor}`}>

        //     {/* Header */}
        //     <header className="flex items-center justify-between p-4 border-b">
        //         <div className="flex items-center gap-4">
        //             <Link to="/common">
        //                 <Button variant="ghost" size="icon" className="rounded-full">
        //                     <ArrowLeft className="w-5 h-5" />
        //                 </Button>
        //             </Link>
        //             <div className="flex items-center">
        //                 <h1 className="text-xl font-semibold">{caseName}</h1>
        //             </div>
        //         </div>

        //         <div className="flex items-center gap-2">
        //             <Dialog>
        //                 <DialogTrigger asChild>
        //                     <Button variant="outline" size="sm">
        //                     <Share className="w-4 h-4 mr-2" />
        //                     Share
        //                     </Button>
        //                 </DialogTrigger>
        //                 <DialogContent>
        //                     <DialogHeader>
        //                     <DialogTitle>Share this case</DialogTitle>
        //                     <DialogDescription>
        //                         Invite others to collaborate on this forensic investigation.
        //                     </DialogDescription>
        //                     </DialogHeader>
        //                     <div className="grid gap-4 py-4">
        //                     <div className="grid gap-2">
        //                         <Input placeholder="Enter email address" />
        //                         <Button size="sm" className="w-full">Send invitation</Button>
        //                     </div>
        //                     <Separator />
        //                     <div>
        //                         <p className="text-sm font-medium mb-2">Share link</p>
        //                         <div className="flex items-center gap-2">
        //                         <Input value={window.location.href} readOnly />
        //                         <Button
        //                             variant="outline"
        //                             size="sm"
        //                             onClick={() => {
        //                             navigator.clipboard.writeText(window.location.href);
        //                             toast({
        //                                 title: "Link copied",
        //                                 description: "Case link copied to clipboard.",
        //                             });
        //                             }}
        //                         >
        //                             Copy
        //                         </Button>
        //                         </div>
        //                     </div>
        //                     </div>
        //                 </DialogContent>
        //                 </Dialog>
        //                 <DropdownMenu>
        //                     <DropdownMenuTrigger asChild>
        //                     <Button variant="outline" size="sm">
        //                         <Settings className="w-4 h-4" />
        //                     </Button>
        //                     </DropdownMenuTrigger>
        //                     <DropdownMenuContent align="end" className="w-40">
        //                     <DropdownMenuLabel>Background</DropdownMenuLabel>
        //                     <DropdownMenuSeparator />
        //                     <DropdownMenuItem onClick={() => setBgColor("bg-white")}>
        //                         Light
        //                     </DropdownMenuItem>
        //                     <DropdownMenuItem onClick={() => setBgColor("bg-gray-900 text-white")}>
        //                         Dark
        //                     </DropdownMenuItem>
        //                     <DropdownMenuItem onClick={() => setBgColor("bg-blue-50")}>
        //                         Soft Blue
        //                     </DropdownMenuItem>
        //                     <DropdownMenuItem onClick={() => setBgColor("bg-yellow-50")}>
        //                         Cream
        //                     </DropdownMenuItem>
        //                     </DropdownMenuContent>
        //                 </DropdownMenu>
        //         </div>
        //     </header>
        //     <div className="flex flex-1 overflow-hidden">
        //         {/* Sources Panel */}
        //         <div className={`w-96 border-r overflow-y-auto flex flex-col ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
        //             <div className="flex items-center justify-between p-4 border-b">
        //                 <h2 className="font-semibold">Evidence Images</h2>
        //                 <Button variant="ghost" size="icon">
        //                     <LayoutGrid className="w-4 h-4" />
        //                 </Button>
        //             </div>

        //             <div className="p-3">
        //                 <Input
        //                     id="file-upload"
        //                     type="file"
        //                     className="hidden"
        //                     accept="image/*"
        //                     multiple
        //                     ref={fileInputRef}
        //                     onChange={handleFileUpload}
        //                 />
        //             </div>

        //             {uploadedImages.length === 0 ? (
        //                 <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground">
        //                     <div className="p-6 bg-muted/50 rounded-lg mb-6">
        //                         <FileUp className="w-12 h-12" />
        //                     </div>
        //                     <h3 className="font-medium text-lg">Upload evidence images</h3>
        //                     <p className="text-sm mt-2 max-w-xs mb-8">
        //                         Upload images from the crime scene or other evidence to analyze patterns and generate insights.
        //                     </p>

        //                     <Button variant="default" className="gap-1" onClick={triggerFileUpload}>
        //                         <UploadCloud className="h-4 w-4 mr-1" />
        //                         Upload images
        //                     </Button>
        //                 </div>
        //             ) : (
        //                 <div className="p-4 space-y-3">
        //                     {uploadedImages.map((src, index) => (
        //                         <div
        //                             key={index}
        //                             className={`relative group rounded-md border overflow-hidden flex items-center p-2 hover:bg-accent cursor-pointer ${selectedImage === src ? 'bg-accent/60' : ''}`}
        //                             onClick={() => handleImageClick(src)}
        //                         >
        //                             <div className="h-16 w-16 rounded overflow-hidden mr-3 flex-shrink-0">
        //                                 <img
        //                                     src={src}
        //                                     alt={`Evidence ${index + 1}`}
        //                                     className="h-full w-full object-cover"
        //                                 />
        //                             </div>
        //                             <div className="flex-1 min-w-0">
        //                                 <p className="font-medium truncate">Evidence image {index + 1}</p>
        //                                 <p className="text-xs text-muted-foreground">Image • Added {new Date().toLocaleDateString()}</p>
        //                             </div>
        //                             <Button
        //                                 variant="ghost"
        //                                 size="icon"
        //                                 className="opacity-0 group-hover:opacity-100"
        //                                 onClick={(e) => {
        //                                     e.stopPropagation();
        //                                     handleDeleteImage(index);
        //                                 }}
        //                             >
        //                                 <Trash2 className="h-4 w-4" />
        //                             </Button>
        //                         </div>
        //                     ))}

        //                     <div className="pt-3">
        //                         {uploadedImages.length > 0 && (
        //                             <Button
        //                                 className="w-full"
        //                                 onClick={analyzeEvidence}
        //                                 disabled={isAnalyzing}
        //                             >
        //                                 {isAnalyzing ? (
        //                                     <>
        //                                         <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        //                                         Analyzing...
        //                                     </>
        //                                 ) : (
        //                                     <>
        //                                         <Microscope className="h-4 w-4 mr-2" />
        //                                         Analyze Evidence
        //                                     </>
        //                                 )}
        //                             </Button>
        //                         )}
        //                     </div>
        //                 </div>
        //             )}

        //             {/* Upload button at the bottom */}
        //             <div className="mt-auto p-4 border-t">
        //                 <div className="flex items-center bg-muted/50 rounded-lg p-3">
        //                     <div className="flex-1">
        //                         <p className="text-sm font-medium">Evidence summary</p>
        //                         <p className="text-xs text-muted-foreground">{uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}</p>
        //                     </div>
        //                     <Button size="sm" className="rounded-full w-8 h-8 p-0 flex-shrink-0" onClick={triggerFileUpload}>
        //                         <Plus className="h-4 w-4" />
        //                     </Button>
        //                 </div>
        //             </div>
        //         </div>

        //         {/* <div className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        //             <div className="flex items-center justify-between p-4 border-b bg-slate-500 text-white rounded-t-md">
        //                 <h2 className="font-semibold text-lg">{officer}</h2>
        //             </div>

        //             <div className="flex-1 flex flex-col p-4 bg-gray-100 shadow-lg rounded-b-md overflow-y-auto max-h-[calc(100vh-150px)]">
        //                 <div className="flex-1 overflow-y-auto space-y-4">
        //                     {chatMessages.map((msg, index) => (
        //                         <div key={index} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
        //                             <div className={`max-w-xs p-3 rounded-lg ${msg.isBot ? "bg-muted" : "bg-primary text-white"}`}>
        //                                 <p className="text-sm">{msg.text}</p>
        //                             </div>
        //                         </div>
        //                     ))}
        //                 </div>

        //                 <div className="flex items-center space-x-2 p-4 border-t">
        //                     <input
        //                         type="text"
        //                         className="flex-1 p-2 border rounded-md"
        //                         placeholder="Type a message..."
        //                         value={messageInput}
        //                         onChange={(e) => setMessageInput(e.target.value)}
        //                     />
        //                     <button
        //                         className="px-4 py-2 bg-blue-500 text-white rounded-md"
        //                         onClick={sendMessage}
        //                         disabled={messageInput.trim() === ""}
        //                     >
        //                         Send
        //                     </button>
        //                 </div>
        //             </div>
        //         </div> */}







        //     </div>
        //     {/* Mobile Navigation */}
        //     <div className="md:hidden border-t">
        //         <div className="grid grid-cols-3 divide-x">
        //             <button
        //                 className={`flex flex-col items-center py-3 ${activeTab === "sources" ? "text-primary" : "text-muted-foreground"}`}
        //                 onClick={() => setActiveTab("sources")}
        //             >
        //                 <Image className="h-5 w-5 mb-1" />
        //                 <span className="text-xs">Images</span>
        //             </button>
        //             <button
        //                 className={`flex flex-col items-center py-3 ${activeTab === "chat" ? "text-primary" : "text-muted-foreground"}`}
        //                 onClick={() => setActiveTab("chat")}
        //             >
        //                 <Eye className="h-5 w-5 mb-1" />
        //                 <span className="text-xs">Preview</span>
        //             </button>
        //             <button
        //                 className={`flex flex-col items-center py-3 ${activeTab === "studio" ? "text-primary" : "text-muted-foreground"}`}
        //                 onClick={() => setActiveTab("studio")}
        //             >
        //                 <Microscope className="h-5 w-5 mb-1" />
        //                 <span className="text-xs">Tools</span>
        //             </button>
        //         </div>
        //     </div>
        // </div>
<div className={`flex flex-col min-h-screen transition-colors duration-300 ${BgColor}`}>

<header className="flex flex-wrap items-center justify-between p-4 border-b gap-2">
  <div className="flex items-center gap-4 min-w-0">
    <Link to="/common">
      <Button variant="ghost" size="icon" className="rounded-full">
        <ArrowLeft className="w-5 h-5" />
      </Button>
    </Link>
    <h1 className="text-xl font-semibold truncate">{caseName}</h1>
  </div>

  <div className="flex items-center gap-2 flex-shrink-0">
    {/* Share Dialog */}
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent> {/* your share modal code */} </DialogContent>
    </Dialog>

    {/* Settings Dropdown */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          <Settings className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent> {/* your settings menu code */} </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>


{/* Main Content */}
<div className="flex flex-1 flex-col md:flex-row overflow-hidden">

  {/* Sidebar */}
  <div className={`w-full md:w-96 border-r overflow-y-auto ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="font-semibold">Evidence Images</h2>
      <Button variant="ghost" size="icon">
        <LayoutGrid className="w-4 h-4" />
      </Button>
    </div>

    {/* Upload Images */}
    <div className="p-3">
      <Input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
    </div>

    {uploadedImages.length === 0 ? (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground">
        <div className="p-6 bg-muted/50 rounded-lg mb-6">
          <FileUp className="w-12 h-12" />
        </div>
        <h3 className="font-medium text-lg">Upload evidence images</h3>
        <p className="text-sm mt-2 max-w-xs mb-8">
          Upload images from the crime scene or other evidence to analyze patterns and generate insights.
        </p>
        <Button variant="default" className="gap-1" onClick={triggerFileUpload}>
          <UploadCloud className="h-4 w-4 mr-1" />
          Upload images
        </Button>
      </div>
    ) : (
      <div className="p-4 space-y-3">
        {uploadedImages.map((src, index) => (
          <div
            key={index}
            className={`relative group rounded-md border overflow-hidden flex items-center p-2 hover:bg-accent cursor-pointer ${selectedImage === src ? 'bg-accent/60' : ''}`}
            onClick={() => handleImageClick(src)}
          >
            <div className="h-16 w-16 rounded overflow-hidden mr-3 flex-shrink-0">
              <img src={src} alt={`Evidence ${index + 1}`} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Evidence image {index + 1}</p>
              <p className="text-xs text-muted-foreground">Image • Added {new Date().toLocaleDateString()}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteImage(index);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Analyze Button */}
        <div className="pt-3">
          {uploadedImages.length > 0 && (
            <Button className="w-full" onClick={analyzeEvidence} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Microscope className="h-4 w-4 mr-2" />
                  Analyze Evidence
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    )}

    {/* Evidence Summary */}
    <div className="mt-auto p-4 border-t">
      <div className="flex items-center bg-muted/50 rounded-lg p-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Evidence summary</p>
          <p className="text-xs text-muted-foreground">
            {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" className="rounded-full w-8 h-8 p-0 flex-shrink-0" onClick={triggerFileUpload}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>

  {/* Chat Section */}
  <div className="flex-1 flex flex-col overflow-hidden min-h-0">

    {/* Chat Header */}
    <div className="flex items-center justify-between p-4 border-b bg-slate-500 text-white">
      <h2 className="font-semibold text-lg">{officer}</h2>
    </div>

    {/* Chat Messages */}
    <div className="flex-1 flex flex-col p-4 bg-gray-100 overflow-auto min-h-0">
      <div className="space-y-4">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-xs p-3 rounded-lg ${msg.isBot ? "bg-muted" : "bg-primary text-white"}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Chat Input */}
    <div className="flex items-center space-x-2 p-4 border-t bg-white">
      <input
        type="text"
        className="flex-1 p-2 border rounded-md"
        placeholder="Type a message..."
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={sendMessage}
        disabled={messageInput.trim() === ""}
      >
        Send
      </button>
    </div>

  </div>
</div>

{/* Mobile Bottom Nav */}
<div className="md:hidden border-t">
  <div className="grid grid-cols-3 divide-x">
    <button
      className={`flex flex-col items-center py-3 ${activeTab === "sources" ? "text-primary" : "text-muted-foreground"}`}
      onClick={() => setActiveTab("sources")}
    >
      <Image className="h-5 w-5 mb-1" />
      <span className="text-xs">Images</span>
    </button>
    <button
      className={`flex flex-col items-center py-3 ${activeTab === "chat" ? "text-primary" : "text-muted-foreground"}`}
      onClick={() => setActiveTab("chat")}
    >
      <Eye className="h-5 w-5 mb-1" />
      <span className="text-xs">Preview</span>
    </button>
    <button
      className={`flex flex-col items-center py-3 ${activeTab === "studio" ? "text-primary" : "text-muted-foreground"}`}
      onClick={() => setActiveTab("studio")}
    >
      <Microscope className="h-5 w-5 mb-1" />
      <span className="text-xs">Tools</span>
    </button>
  </div>
</div>

</div>

    );
}

function Customize({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2H2v10h10V2z" />
            <path d="M22 12h-10v10h10V12z" />
            <path d="M12 12H2v10h10V12z" />
            <path d="M22 2h-10v10h10V2z" />
        </svg>
    );
}

function animateTyping(summary: any) {
  throw new Error("Function not implemented.");
}

