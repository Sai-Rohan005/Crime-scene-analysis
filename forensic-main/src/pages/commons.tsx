
// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   FolderPlus,
//   Search,
//   FileText,
//   Clock,
//   Filter,
//   ArrowUp,
//   ArrowDown,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useToast } from "@/hooks/use-toast";
// import { NavDashbord } from "@/components/NavDashbord";
// import { Navbar } from "@/components/Navbar";
// import { Footer } from "@/components/Footer";
// import axios from "axios";

// export default function CitizenDashboard() {
//   const [complaints, setComplaints] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortField, setSortField] = useState("lastUpdated");
//   const [sortDirection, setSortDirection] = useState("desc");
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     type: "",
//     description: "",
//     location: "",
//     datetime: "",
//     suspect: "",
//     evidence: "",
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [displayName, setDisplayName] = useState("");

//   const { toast } = useToast();
//   const navigate = useNavigate();

//   const checkLoginStatus = async () => {
//     const token = sessionStorage.getItem("authToken");
//     if (!token) return navigate("/signin");

//     try {
//       const resp = await axios.get("http://localhost:5500/checklogin", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       resp.data.status === 200 ? setIsLoggedIn(true) : navigate("/signin");
//     } catch (error) {
//       console.error("Authentication error: ", error);
//       navigate("/signin");
//     }
//   };

//   useEffect(() => { checkLoginStatus(); }, []);

//   useEffect(() => {
//     async function fetchComplaints() {
//       setLoading(true);
//       try {
//         const res = await axios.get("http://localhost:5500/cases", {
//           headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
//         });
//         if (res.data.status === 200) {
//           const mail = res.data.data[0]?.email || "anonymous";
//           const username = mail.split("@")[0];
//           setDisplayName(username.charAt(0).toUpperCase() + username.slice(1));

//           setComplaints(res.data.data.map(c => ({
//             _id: c._id,
//             title: c.caseTitle,
//             type: c.caseType,
//             status: c.status || "New",
//             date: c.createdAt || new Date().toISOString(),
//             lastUpdated: c.updatedAt || new Date().toISOString(),
//           })));
//         }
//       } catch (error) {
//         toast({ variant: "destructive", title: "Error", description: "Failed to fetch complaints." });
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (isLoggedIn) fetchComplaints();
//   }, [isLoggedIn]);

//   const filteredComplaints = complaints.filter((c) => {
//     return c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//            c.type?.toLowerCase().includes(searchQuery.toLowerCase());
//   });

//   const sortedComplaints = [...filteredComplaints].sort((a, b) => {
//     return sortDirection === "asc" ? (a[sortField] > b[sortField] ? 1 : -1) : (a[sortField] < b[sortField] ? 1 : -1);
//   });

//   const handleFileComplaint = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.type) {
//       return toast({ variant: "destructive", title: "Error", description: "Please complete all fields." });
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("http://localhost:5500/newcase", formData, {
//         headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
//       });

//       if (response?.data?.status === 200) {
//         const newComplaint = {
//           _id: `complaint-${String(complaints.length + 1).padStart(3, "0")}`,
//           title: formData.title,
//           date: new Date().toISOString(),
//           status: "New",
//           type: formData.type,
//           lastUpdated: new Date().toISOString(),
//         };
//         setComplaints([newComplaint, ...complaints]);
//         // setFormData({ title: "", type: "" });
//         setIsDialogOpen(false);
//         toast({ title: "Complaint Filed", description: "Your complaint has been submitted." });
//       } else {
//         throw new Error("Failed to file complaint.");
//       }
//     } catch (error) {
//       toast({ variant: "destructive", title: "Error", description: "Could not file complaint." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const newComplaintDetails = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };
  

//   const toggleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("desc");
//     }
//   };

//   if (isLoggedIn === null) return <div className="flex justify-center items-center h-screen">Loading...</div>;

//   return (
//     <div className="flex min-h-screen flex-col">
//       {isLoggedIn ? <NavDashbord /> : <Navbar />}
//       <div className="flex-1 container py-8">
//         <div className="flex flex-col gap-8">
//           <div className="flex flex-col gap-2">
//             <h1 className="text-3xl font-bold">Welcome, {displayName}</h1>
//             <p className="text-muted-foreground">File and track your complaints to the local police department.</p>
//           </div>

//           {/* Search & Filter */}
//           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//             <div className="relative w-full sm:w-72">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search complaints..."
//                 className="pl-8"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             <div className="flex gap-2 w-full sm:w-auto">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className="gap-1">
//                     <Filter className="h-4 w-4" /> Sort
//                     {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuLabel>Sort By</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => toggleSort("title")}>Title</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => toggleSort("date")}>Filed Date</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => toggleSort("lastUpdated")}>Last Updated</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => toggleSort("type")}>Category</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="gap-1">
//                     <FolderPlus className="h-4 w-4" /> File Complaint
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>File a New Complaint</DialogTitle>
//                     <DialogDescription>Fill in the details of your issue.</DialogDescription>
//                   </DialogHeader>
//                   <form onSubmit={handleFileComplaint}>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid gap-2">
//                         <Label htmlFor="complaint-title">Complaint Title</Label>
//                         <Input
//                           type="text"
//                           id="complaint-title"
//                           placeholder="E.g., Noise Disturbance"
//                           name="title"
//                           value={formData.title}
//                           onChange={newComplaintDetails}
//                         />
//                       </div>
//                       <div className="grid gap-2">
//                         <Label htmlFor="complaint-type">Complaint Category</Label>
//                         <Input
//                           id="complaint-type"
//                           placeholder="E.g., Theft, Harassment"
//                           name="type"
//                           value={formData.type}
//                           onChange={newComplaintDetails}
//                         />
//                       </div>
//                     </div>
//                     <DialogFooter>
//                       <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
//                       <Button type="submit" disabled={!formData.title || !formData.type || loading}>
//                         {loading ? "Filing..." : "Submit Complaint"}
//                       </Button>
//                     </DialogFooter>
//                   </form>
//                 </DialogContent>
//               </Dialog> */}
//               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                     <DialogTrigger asChild>
//                         <Button className="gap-1">
//                         <FolderPlus className="h-4 w-4" /> File Complaint
//                         </Button>
//                     </DialogTrigger>

//                     <DialogContent>
//                         <DialogHeader>
//                         <DialogTitle>File a New Complaint</DialogTitle>
//                         <DialogDescription>Fill in the details of your issue.</DialogDescription>
//                         </DialogHeader>

//                         <form onSubmit={handleFileComplaint}>
//                         <div className="grid gap-4 py-4">

//                             <div className="grid gap-2">
//                             <Label htmlFor="complaint-title">Complaint Title</Label>
//                             <Input
//                                 type="text"
//                                 id="complaint-title"
//                                 placeholder="E.g., Phone Theft"
//                                 name="title"
//                                 value={formData.title}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div>

//                             <div className="grid gap-2">
//                             <Label htmlFor="complaint-type">Complaint Category</Label>
//                             <Input
//                                 id="complaint-type"
//                                 placeholder="E.g., Theft, Harassment"
//                                 name="type"
//                                 value={formData.type}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div>

//                             <div className="grid gap-2">
//                             <Label htmlFor="description">Description</Label>
//                             <Input
//                                 id="description"
//                                 placeholder="Briefly describe the incident"
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div>

//                             <div className="grid gap-2">
//                             <Label htmlFor="location">Location of Incident</Label>
//                             <Input
//                                 id="location"
//                                 placeholder="E.g., Near City Mall, 5th Street"
//                                 name="location"
//                                 value={formData.location}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div>

//                             <div className="grid gap-2">
//                             <Label htmlFor="datetime">Date & Time</Label>
//                             <Input
//                                 type="datetime-local"
//                                 id="datetime"
//                                 name="datetime"
//                                 value={formData.datetime}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div>

//                             <div className="grid gap-2">
//                             <Label htmlFor="suspect">Suspect Details (Optional)</Label>
//                             <Input
//                                 id="suspect"
//                                 placeholder="E.g., Male, 6ft, wearing black hoodie"
//                                 name="suspect"
//                                 value={formData.suspect}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div>

//                             {/* <div className="grid gap-2">
//                             <Label htmlFor="evidence">Evidence Link (Optional)</Label>
//                             <Input
//                                 id="evidence"
//                                 placeholder="E.g., https://imgur.com/photo123"
//                                 name="evidence"
//                                 value={formData.evidence}
//                                 onChange={newComplaintDetails}
//                             />
//                             </div> */}

//                         </div>

//                         <DialogFooter>
//                             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//                             Cancel
//                             </Button>
//                             <Button
//                             type="submit"
//                             disabled={!formData.title || !formData.type || loading}
//                             >
//                             {loading ? "Filing..." : "Submit Complaint"}
//                             </Button>
//                         </DialogFooter>
//                         </form>
//                     </DialogContent>
//                 </Dialog>


//             </div>
//           </div>

//           {/* Complaint Cards */}
//           {sortedComplaints.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
//                 <FileText className="h-6 w-6 text-muted-foreground" />
//               </div>
//               <h3 className="font-medium text-lg mb-1">No complaints found</h3>
//               <p className="text-muted-foreground mb-4">
//                 {searchQuery ? "No complaints match your search" : "File your first complaint to get started."}
//               </p>
//               {!searchQuery && (
//                 <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-1">
//                   <FolderPlus className="h-4 w-4" /> File a Complaint
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {sortedComplaints.map((c) => (
//                 <Link to={`/Usercases/${c._id}`} key={c._id}>
//                   <Card className="h-full transition-shadow hover:shadow-md">
//                     <CardHeader>
//                       <CardTitle className="flex justify-between items-start">
//                         <span className="line-clamp-2">{c.title}</span>
//                         <span className="text-xs font-normal px-2 py-1 rounded-full bg-forensic bg-opacity-10 text-forensic">
//                           {c.status}
//                         </span>
//                       </CardTitle>
//                       <CardDescription>{c.type}</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="flex items-center text-sm text-muted-foreground">
//                         <FileText className="h-4 w-4 mr-1" /> Filed on {formatDate(c.date)}
//                       </div>
//                     </CardContent>
//                     <CardFooter className="text-xs text-muted-foreground flex justify-end">
//                       <div className="flex items-center">
//                         <Clock className="h-3 w-3 mr-1" /> Updated {formatDate(c.lastUpdated)}
//                       </div>
//                     </CardFooter>
//                   </Card>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }

// function Label({ htmlFor, children }) {
//   return <label htmlFor={htmlFor} className="text-sm font-medium leading-none">{children}</label>;
// }

// function formatDate(dateString: string): string {
//   const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
//   return new Date(dateString).toLocaleDateString(undefined, options);
// }


import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderPlus,
  Search,
  FileText,
  Clock,
  Filter,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { NavCommon } from "@/components/NavCommon";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import axios from "axios";

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("lastUpdated");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    location: "",
    datetime: formatDateTimeLocal(new Date()),
    suspect: "",
    evidence: "",
    browserloc:{},
  });

  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    try {
      const resp = await axios.get("http://localhost:5500/checklogin", { headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      }, });
      resp.data.status === 200 ? setIsLoggedIn(true) : navigate("/signin");
    } catch (error) {
      console.error("Authentication error: ", error);
      navigate("/signin");
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    async function fetchComplaints() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5500/commonscases", { headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },});
        if (res.data.status === 200) {
          // console.log(res);
          const mail = res.data.data[0]?.email || "anonymous";
          const username = mail.split("@")[0];
          setDisplayName(username.charAt(0).toUpperCase() + username.slice(1));

          setComplaints(res.data.data.map(c => ({
            _id: c._id,
            title: c.title,
            type: c.type,
            status: c.status || "New",
            datetime: c.datetime || new Date().toISOString(),
            lastUpdated: c.updatedAt || new Date().toISOString(),
          })));
          
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch complaints." });
      } finally {
        setLoading(false);
      }
    }
    if (isLoggedIn) fetchComplaints();
  }, [isLoggedIn,formData]);

  const filteredComplaints = complaints.filter((c) => {
    return c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.type?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    return sortDirection === "asc" ? (a[sortField] > b[sortField] ? 1 : -1) : (a[sortField] < b[sortField] ? 1 : -1);
  });

  const handleFileComplaint = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type) {
      return toast({ variant: "destructive", title: "Error", description: "Please complete all fields." });
    }

    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const browserlocation={
            latitude,
            longitude,
          }
          formData.browserloc=browserlocation
        })
      const response = await axios.post("http://localhost:5500/common_cases", formData, { headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },});
      // console.log(response);
      if (response?.data?.status === 200) {
        const newComplaint = {
          _id: response.data.id,
          title: formData.title,
          date: new Date().toISOString(),
          status: "New",
          type: formData.type,
          lastUpdated: new Date().toISOString(),
        };
        setComplaints([newComplaint, ...complaints]);
        setIsDialogOpen(false);
        toast({ title: "Complaint Filed", description: "Your complaint has been submitted." });
      } else {
        throw new Error("Failed to file complaint.");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not file complaint." });
    } finally {
      setLoading(false);
    }
  };

  const newComplaintDetails = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (isLoggedIn === null) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (

  <div className="flex min-h-screen flex-col">
  {isLoggedIn ? <NavCommon /> : <Navbar />}
  <div className="flex-1 container py-8">
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome, {displayName}</h1>
        <p className="text-muted-foreground">File and track your complaints to the local police department.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search complaints..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 w-auto">
                <Filter className="h-4 w-4" /> Sort
                {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toggleSort('title')}>Title</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort('date')}>Filed Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort('lastUpdated')}>Last Updated</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort('type')}>Category</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1 w-auto">
                <FolderPlus className="h-4 w-4" /> File Complaint
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>File a New Complaint</DialogTitle>
                <DialogDescription>Fill in the details of your issue.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleFileComplaint}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="complaint-title">Complaint Title</Label>
                    <Input
                      type="text"
                      id="complaint-title"
                      placeholder="E.g., Phone Theft"
                      name="title"
                      value={formData.title}
                      onChange={newComplaintDetails}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="complaint-type">Complaint Category</Label>
                    <Input
                      id="complaint-type"
                      placeholder="E.g., Theft, Harassment"
                      name="type"
                      value={formData.type}
                      onChange={newComplaintDetails}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Briefly describe the incident"
                      name="description"
                      value={formData.description}
                      onChange={newComplaintDetails}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location of Incident</Label>
                    <Input
                      id="location"
                      placeholder="E.g., Near City Mall, 5th Street"
                      name="location"
                      value={formData.location}
                      onChange={newComplaintDetails}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <Input
                      type="datetime-local"
                      id="datetime"
                      name="datetime"
                      value={formData.datetime}
                      onChange={newComplaintDetails}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="suspect">Suspect Details (Optional)</Label>
                    <Input
                      id="suspect"
                      placeholder="E.g., Male, 6ft, wearing black hoodie"
                      name="suspect"
                      value={formData.suspect}
                      onChange={newComplaintDetails}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.title || !formData.type || loading}
                  >
                    {loading ? "Filing..." : "Submit Complaint"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Complaint Cards */}
      {loading ? (
        <div>Loading...</div>
      ) : sortedComplaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No complaints found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No complaints match your search' : 'File your first complaint to get started.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-1">
              <FolderPlus className="h-4 w-4" /> File a Complaint
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedComplaints.map((c) => (
            <Link to={`/Usercases/${c._id}`} key={c._id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span className="line-clamp-2">{c.title}</span>
                    <span className="text-xs font-normal px-2 py-1 rounded-full bg-forensic bg-opacity-10 text-forensic">
                      {c.status || "Pending"}
                    </span>
                  </CardTitle>
                  <CardDescription>{c.type}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <FileText className="h-4 w-4 mr-1" /> Filed on {formatDate(c.datetime)}
                  </div>
                </CardContent>

                <CardFooter className="text-xs text-muted-foreground flex justify-end">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> Updated {formatDate(c.lastUpdated || c.datetime)}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  </div>
  <Footer />
</div>

  
  );
}

function Label({ htmlFor, children }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium leading-none">{children}</label>;
}

function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
