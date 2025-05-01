
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
import axios from 'axios'
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
  MessageCircle,
  MessageSquare,
  Microscope,
  Plus,
  Scroll,
  Settings,
  Share,
  Trash2,
  UploadCloud
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Textarea } from "@/components/ui/textarea";

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
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [canMessage,setcanMessage]=useState(false);
    const [BgColor,setBgColor]=useState("bg-white");
    const [officer,setofficer]=useState("");
    const [images,setimages]=useState(null);

     const token = sessionStorage.getItem('authToken');
        
    const decoded = jwtDecode<{ email: string }>(token);
    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };


    useEffect(() => {
        const fetchmail = async () => {
          try {
            const respmail = await axios.get(`http://localhost:5500/filer/${caseId}`);
            console.log(respmail);
            if (respmail.data.status === 200) {
              setcanMessage(true);
            }
          } catch (err) {
            console.error("Failed to fetch filer email:", err);
          }
        };
        const fetchImages = async () => {
            try {
              // Fetch images for the given caseId
              const response = await axios.get(`http://localhost:5500/get_case_images/${caseId}`);
              // console.log("Response from backend:", response); // Log the entire response
        
              if (response.data && Array.isArray(response.data.images)) {
                const { images } = response.data; // Get images array from response
                const imageUrls = images.map((image) => `http://localhost:5500/images/${image.image_id}`);
                setUploadedImages(imageUrls); // Store the image URLs in the state
              }
            } catch (err) {
              console.log("Error fetching images:", err);
              toast({
                variant: "destructive",
                title: "Error Fetching Images",
                description: "There was an error while fetching images."
              });
            }
            try {
              const getmsg=await axios.get(`http://localhost:5500/conversations/${caseId}`);
              console.log(getmsg);
              const updatedMessages = getmsg.data.messages.map(msg => ({
                ...msg,
                isBot: msg.senderId === decoded.email
              }));
              const username = getmsg.data.mail.split('@')[0];
              const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
              console.log(formattedName);
              setofficer(formattedName);
              // console.log(updatedMessages);
              
              setChatMessages(updatedMessages);
    
            }catch(err){
              console.log(err);
            }
    
    
          };
        
          if (caseId) {
            fetchImages(); // Trigger fetch if caseId exists
          }
      
        fetchmail();
      }, [caseId]);
      

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
    
        const formData = new FormData();
        formData.append("caseName", caseName); // Append case ID or name
    
        Array.from(files).forEach((file) => {
            formData.append("files", file); // Append each file under the same key
        });
    
        try {
            const imgresp = await axios.post("http://localhost:5500/Upload_images", formData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
                    "Content-Type": "multipart/form-data", 
                },
            });
    
            toast({
                title: "Upload Successful",
                description: `Uploaded ${files.length} image${files.length !== 1 ? "s" : ""}.`,
            });
    
            // Display uploaded images
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) {
                        setUploadedImages((prev) => [...prev, e.target!.result!.toString()]);
                    }
                };
                reader.readAsDataURL(file);
            });
    
        } catch (err) {
            console.error("Upload error", err);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: "Uploading image failed.",
            });
        }
    
        if (e.target) {
            e.target.value = ""; // Clear input after upload
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
    const animateTyping = (text: string, delay = 20) => {
      setTypedSummary(""); // Reset previous summary
      let index = 0;
    
      const type = () => {
        if (index <= text.length) {
          setTypedSummary(text.slice(0, index));
          index++;
          setTimeout(type, delay);
        }
      };
    
      type();
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



    const [messages, setMessages] = useState([
          { from: "other", text: "Hello! How can I help you today?" },
        ]);
        
      const [chatMessages, setChatMessages] = useState<{
        timestamp: ReactNode;
        id: number; text: string, isBot: boolean 
    }[]>([]);
      const [messageInput, setMessageInput] = useState('');
    
    

    const sendMessage = async () => {
        if (!messageInput.trim()) return;
      
        const currentMessage = messageInput;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessageInput('');

        const tempId = Date.now(); 

      
        try {
            
          const response = await axios.post(`http://localhost:5500/messages/${caseId}`, {
            text: currentMessage,
            senderId: ""  
          });
      
          
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, sending: false, failed: false, timestamp } : msg
            )
          );
      
          // Optionally add the server's response (if it includes the full message data or metadata) to the chat
          setChatMessages((prev) => [
            ...prev,
            { id: response.data.messageId, text: currentMessage, isBot: false, sending: false, timestamp }
          ]);
        } catch (error) {
          console.error('Failed to send message:', error);
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, sending: false, failed: true, timestamp } : msg
            )
          );
        }
      };


    return (
        <div className={`flex flex-col h-screen min-h-screen p-6 transition-colors duration-300 ${BgColor}`}>
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold">{caseName}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Message Dialog */}
                    {canMessage && (
                        <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
                            <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-[60vh]">
                              <div className="flex items-center justify-between p-4 border-b bg-slate-500 text-white">
                              <DialogTitle>
                                <span className="text-xl font-semibold">{officer}</span>
                            </DialogTitle>

                              </div>
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
                          
                          
                        </DialogContent>
                      </Dialog>
                      
                    )}

                    {/* Share Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Share className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share this case</DialogTitle>
                                <DialogDescription>
                                    Invite others to collaborate on this forensic investigation.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Input placeholder="Enter email address" />
                                    <Button size="sm" className="w-full">Send invitation</Button>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium mb-2">Share link</p>
                                    <div className="flex items-center gap-2">
                                        <Input value={window.location.href} readOnly />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast({
                                                    title: "Link copied",
                                                    description: "Case link copied to clipboard.",
                                                });
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Background Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Background</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setBgColor("bg-white")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBgColor("bg-gray-900 text-white")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBgColor("bg-blue-50")}>
                                Soft Blue
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setBgColor("bg-yellow-50")}>
                                Cream
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </header>
            <div className="flex flex-1 overflow-hidden">
                <div className={`w-96 border-r overflow-y-auto flex flex-col ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold">Evidence Images</h2>
                        <Button variant="ghost" size="icon">
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

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

                    {!canMessage && uploadedImages.length === 0 ? (
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
                                        <img
                                            src={src}
                                            alt={`Evidence ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
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

                            <div className="pt-3">
                                {canMessage && uploadedImages.length > 0 && (
                                    <Button
                                        className="w-full"
                                        onClick={analyzeEvidence}
                                        disabled={isAnalyzing}
                                    >
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
                    {canMessage==false ? (
                    <div className="mt-auto p-4 border-t">
                        <div className="flex items-center bg-muted/50 rounded-lg p-3">
                            <div className="flex-1">
                                <p className="text-sm font-medium">Evidence summary</p>
                                <p className="text-xs text-muted-foreground">{uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}</p>
                            </div>
                            <Button size="sm" className="rounded-full w-8 h-8 p-0 flex-shrink-0" onClick={triggerFileUpload}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    ):(
                        <div className="mt-auto p-4 border-t">
                        <div className="flex items-center bg-muted/50 rounded-lg p-3">
                            <div className="flex-1">
                            </div>
                        </div>
                    </div>
                    )
                    }
                </div>
                <div className={`flex-1 flex flex-col ${activeTab === "chat" ? "block" : "hidden md:block"} overflow-y-auto`}>
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold">Image Preview</h2>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {selectedImage && (
                        <div className="mt-4 bg-muted/40 p-4 rounded text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                        <span className="whitespace-pre-line">
                          {typedSummary}
                          <span className="blinking-cursor inline-block w-1 bg-black ml-1 animate-blinking" />

                        </span>

                      </div>
                      
                    )
                    }
                    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-card/40 overflow-y-auto max-h-screen">
                        {uploadedImages.length === 0 ? (
                            <div className="text-center max-w-md">
                                <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No images to display</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Upload evidence images from the Sources panel to view and analyze them here.
                                </p>
                                <Button onClick={triggerFileUpload}>
                                    <UploadCloud className="h-4 w-4 mr-2" />
                                    Upload images
                                </Button>
                            </div>
                        ) : selectedImage ? (
                            <div className="flex flex-col w-full max-w-3xl h-full">
                                <div className="relative flex-1 flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
                                    <img
                                        src={selectedImage}
                                        alt="Selected evidence"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <div className="mt-4 flex gap-4">
                                    {selectedImage && (
                                        <Button
                                        variant="outline"
                                        className="flex-1 text-sm"
                                        onClick={fetchSummary}
                                        >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Summarize
                                        </Button>
                                    )}

                                    <Button variant="outline" size="sm" className="flex-1 text-sm">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Generate report
                                    </Button>

                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 text-sm"
                                        onClick={analyzeEvidence}
                                        disabled={isAnalyzing}
                                    >
                                        {isAnalyzing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                            Analyzing...
                                        </>
                                        ) : (
                                        <>
                                            <Microscope className="h-4 w-4 mr-2" />
                                            Analyze
                                        </>
                                        )}
                                    </Button>
                                </div>

                            </div>
                        ) : (
                            <div className="text-center">
                                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Select an image to analyze</h3>
                                <p className="text-sm mt-2 max-w-md text-muted-foreground">
                                    Click on any image in the Evidence Images panel to view and analyze it.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Studio/Tools Panel */}
                <div className={`w-96 border-l overflow-y-auto flex flex-col ${activeTab === "studio" ? "block" : "hidden md:block"}`}>
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold">Forensic Tools</h2>
                        <Button variant="ghost" size="icon">
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="p-4">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium flex items-center">
                                    Image Analysis
                                    <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                                        <Info className="w-3 h-3" />
                                    </Button>
                                </h3>
                            </div>

                            <Card className="mb-4">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Microscope className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Crime Scene Analysis</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""} available
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 flex items-center justify-center">
                                        <Button className="justify-start" size="sm" disabled={uploadedImages.length === 0 || isAnalyzing} onClick={analyzeEvidence}>
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <BarChart3 className="w-4 h-4 mr-2" />
                                                    Analyze
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">Analysis Notes</h3>
                                <Button variant="ghost" size="sm" className="h-7 gap-1">
                                    <Plus className="h-3.5 w-3.5" />
                                    Add note
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <Button variant="outline" className="justify-start text-left" size="sm">
                                    <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">Evidence guide</span>
                                </Button>
                                <Button variant="outline" className="justify-start text-left" size="sm">
                                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">Case report</span>
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="justify-start text-left" size="sm">
                                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">Key findings</span>
                                </Button>
                                <Button variant="outline" className="justify-start text-left" size="sm">
                                    <Scroll className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">Timeline</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

