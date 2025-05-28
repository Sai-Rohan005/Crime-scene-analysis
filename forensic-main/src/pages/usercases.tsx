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
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import socket from './socket';
import { jwtDecode } from "jwt-decode";




export default function Case() {
    const { caseId } = useParams();
    const [caseName, setCaseName] = useState(`Case #${caseId?.replace("case-", "")}`);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
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
    const token = sessionStorage.getItem('authToken');

    const [callSignal, setCallSignal] = useState(null);
    const [callerId, setCallerId] = useState(null);
    // const socket = io('http://localhost:5500'); // Your server URL

    const navigate=useNavigate();
    
    const decoded = jwtDecode<{ email: string }>(token);
    

    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const [messages, setMessages] = useState([
      { from: "other", text: "Hello! How can I help you today?" },
    ]);
    
    const [chatMessages, setChatMessages] = useState<{
    timestamp: ReactNode;
    id: number; text: string, isBot: boolean 
    }[]>([]);
    const [messageInput, setMessageInput] = useState('');



    useEffect(() => {
      const con = async()=>{
          if (!socket.connected) {
              await socket.connect();
            }
  
      }
      con();
      
    }, []);
    
    useEffect(() => {
      const fetchImages = async () => {
        try {
          // Fetch images for the given caseId
          const response = await axios.get(`http://localhost:5500/get_case_images/${caseId}`);
          // console.log("Response from backend:", response); // Log the entire response
    
          if (response.data && Array.isArray(response.data.images)) {
            const { images } = response.data; // Get images array from response
            const imageUrls = images.map((image) => `http://localhost:5500/images/${image.imageUrl}`);
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
          // console.log(getmsg);
          const updatedMessages = getmsg.data.messages.map(msg => ({
            ...msg,
            isBot: msg.senderId === decoded.email
          }));
          const username = getmsg.data.messages[0].senderId.split('@')[0];
          const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
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
    
    }, [caseId, toast,uploadedImages]); // Effect triggers when caseId changes
    
    // Simplify the socket connection management
    useEffect(() => {
      if (!decoded?.email) return;
    
      const registerUser = () => {
        console.log("🔁 Emitting registerUser for:", decoded.email);
        socket.emit("registerUser", decoded.email, (response) => {
          if (response?.success) {
            console.log("✅ Registered successfully");
          } else {
            console.error("❌ Register failed:", response?.error);
          }
        });
      };
    
      socket.on("connect", registerUser);
    
      if (socket.connected) {
        registerUser(); // In case already connected before listener added
      }
    
      return () => {
        socket.off("connect", registerUser);
      };
    }, [decoded?.email]);
    

// Handle incoming calls
  useEffect(() => {
    const handleIncomingCall = ({ signalData, from }) => {
      setCallSignal(signalData);
      setCallerId(from);
      setIsIncomingCall(true);
    };

    socket.on('incomingCall', handleIncomingCall);
    
    return () => {
      socket.off('incomingCall', handleIncomingCall);
    };
  }, []);

    
  



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
    
      const formData = new FormData();
      formData.append("case_id", caseName);
    
      let imageCount = 0;
      let videoCount = 0;
    
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          formData.append("images", file); // same key used for multiple images
          imageCount++;
        } else if (file.type.startsWith("video/")) {
          formData.append("videos", file); // same key used for multiple videos
          videoCount++;
        } else {
          toast({
            title: "Invalid File Type",
            description: `Unsupported file type: ${file.name}`,
            variant: "destructive",
          });
        }
      });
    
      try {
        const response = await axios.post("http://localhost:5500/Upload_media", formData, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
    
        if (response.data.status !== 200) {
          toast({
            variant: "destructive",
            title: "File Upload Error",
            description: response.data.message,
          });
        } else {
          toast({
            title: "Upload Successful",
            description: `Uploaded ${imageCount} image${imageCount !== 1 ? "s" : ""} and ${videoCount} video${videoCount !== 1 ? "s" : ""}.`,
          });
    
          setUploadedImages((prev) => [
            ...prev,
            ...Array.from(files)
              .filter((f) => f.type.startsWith("image/"))
              .map((file) => URL.createObjectURL(file)),
          ]);
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to upload files. Please try again.",
          variant: "destructive",
        });
      }
    
      // Clear input
      if (e.target) {
        e.target.value = "";
      }
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
  
   
    const sendMessage = async () => {
      if (!messageInput.trim()) return;
    
      const currentMessage = messageInput;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessageInput('');
    
      // Optimistically show the message
      const tempId = Date.now(); // unique id for temp tracking
      // setChatMessages((prev) => [
      //   ...prev,
      //   { id: tempId, text: currentMessage, isBot: false, sending: true, timestamp }
      // ]);
    
      try {
        // Send the message to the server
        const response = await axios.post(`http://localhost:5500/messages/${caseId}`, {
          text: currentMessage,
          senderId: ""  // Handle senderId logic as per your requirement
        });
    
        // Mark message as successfully sent (remove "sending" flag)
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
    
    


    


  


    const acceptCall = () => {
      console.log('Call accepted');
      setIsIncomingCall(false); // Hide incoming call notification
  
      // Notify the caller that the call was accepted
      socket.emit('acceptCall', {
        to: callerId, // Send back the socket ID of the caller
        signal: callSignal, // Send back the signal data needed for WebRTC
      });
  
      // Trigger video call UI to start
      // Open the video call component or route to a video call page
      navigate(`/video/${caseId}`);
    };
  
    const rejectCall = () => {
      console.log('Call rejected');
      setIsIncomingCall(false); // Hide incoming call notification
  
      // Notify the caller that the call was rejected
      socket.emit('rejectCall', {
        to: callerId, // Send back the socket ID of the caller
      });
  
      // Handle call rejection, close any opened video-related UI
      // Optionally display a rejection message or any other action
    };
  
  
    return (
        
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


{/* Main Content */}
<div className="flex flex-1 flex-col md:flex-row overflow-hidden">

  <div className={`w-full md:w-96 border-r overflow-y-auto ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="font-semibold">Evidence</h2>
      <Button variant="ghost" size="icon">
        <LayoutGrid className="w-4 h-4" />
      </Button>
    </div>

    <div className="p-3">
      <Input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
    </div>

    {uploadedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground">
          <div className="p-6 bg-muted/50 rounded-lg mb-6">
            {/* Placeholder for file upload icon */}
          </div>
          <h3 className="font-medium text-lg">Upload evidence</h3>
          <p className="text-sm mt-2 max-w-xs mb-8">
            Upload images and videos from the crime scene or other evidence to analyze patterns and generate insights.
          </p>
          <Button variant="default" className="gap-1" onClick={triggerFileUpload}>
            {/* Upload icon */}
            Upload evidence
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-3">
           {uploadedImages.map((src, index) => {
                                const isVideo = src.match(/\.(mp4|webm|ogg)$/i);
                                return (
                                <div
                                    key={index}
                                    className={`relative group rounded-md border overflow-hidden flex items-center p-2 hover:bg-accent cursor-pointer `
                                   
                                  }
                                >
                                    <div className="h-16 w-16 rounded overflow-hidden mr-3 flex-shrink-0">
                                    {isVideo ? (
                                        <video
                                        src={src}
                                        className="h-full w-full object-cover"
                                        muted
                                        loop
                                        playsInline
                                        />
                                    ) : (
                                        <img
                                        src={src}
                                        alt={`Evidence ${index + 1}`}
                                        className="h-full w-full object-cover"
                                        />
                                    )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">Evidence {index + 1}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isVideo ? 'Video' : 'Image'} • Added {new Date().toLocaleDateString()}
                                    </p>
                                    </div>
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                );
                            })}
        
      </div>
    )}

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

  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
  {/* Chat Header */}
  <div className="flex items-center justify-between p-4 border-b bg-slate-500 text-white">
    <h2 className="font-semibold text-lg">{officer}</h2>
  </div>

  {/* Incoming Video Call Notification */}
  {isIncomingCall && (
    <div className="flex items-center justify-between p-4 border-b bg-yellow-500 text-white">
      <p className="text-lg">Incoming Video Call</p>
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={acceptCall}
        >
          Accept
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={rejectCall}
        >
          Reject
        </button>
      </div>
    </div>
  )}

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

function animateTyping(summary) {
  throw new Error("Function not implemented.");
}