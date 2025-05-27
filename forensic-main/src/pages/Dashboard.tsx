import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Fingerprint,
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
import { NavDashbord } from "@/components/NavDashbord";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import axios from "axios";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
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
  const [displayName,setdisplayName]=useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const checkLoginStatus = async () => {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      navigate("/signin"); 
      return;
    }

    try {
      const resp = await axios.get("http://localhost:5500/checklogin", {
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      });

      if (resp.data.status === 200) {
        setIsLoggedIn(true);  // User is logged in, set the state
      } else {
        navigate("/signin");  // If status is not 200, redirect to signin
      }
    } catch (error) {
      console.error("Authentication error: ", error);
      navigate("/signin");  // If error, redirect to signin
    }
  };
  

  useEffect(() => {
    const islogin=async()=>{
      try {
        const token = sessionStorage.getItem("authToken");
        if (token){
          const resp = await axios.get("http://localhost:5500/checklogin", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if(resp.data.status === 200) { 
            const role=await axios.post("http://localhost:5500/role",{},{
              headers: { Authorization: `Bearer ${token}` },
            });
            if(role.data.status===200){
                if(role.data.role!=="police"){
                  navigate("/unauthorized");
                }
            }
            
          } 
        }
      } catch (error) {
        console.error("Authentication error: ", error);
      }
    }
    islogin();
    checkLoginStatus();
    
  }, []);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5500/cases",{
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });
        // console.log(res);
        if (res.data.status === 200) {
          // console.log(res.data.data);
          const mail = res.data.data[0].officer;
          const username = mail.split('@')[0];
          const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
          setdisplayName(formattedName);

          
          
          // Normalize data before setting state
          setCases(res.data.data.map(c => ({
            _id: c._id,
            title: c.title,
            type: c.type,
            status: c.status || "New",
            date: c.datetime || new Date().toISOString(),
            lastUpdated: c.updatedAt || new Date().toISOString(),
            
          })));
        }
      } catch (error) {
        // toast({
        //   variant: "destructive",
        //   title: "Error",
        //   description: "Failed to fetch cases. Please try again later.",
        // });
        console.log(error);
      } finally {
        setLoading(false);
      }
      
    }
    if (isLoggedIn) fetchCases();
  
  }, [isLoggedIn,formData]);

  const filteredCases = cases.filter(
    (c) => {
      if (c.title && typeof c.title === 'string') {
        return (
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }
  );

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  const handleCreateCase = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a title for the case.",
      });
      return;
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
      const response = await axios.post("http://localhost:5500/newcase", formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (response?.data?.status === 200) {
        const newCase = {
          _id: `case-${String(cases.length + 1).padStart(3, "0")}`,
          caseTitle: formData.title,
          date: new Date().toISOString().split("T")[0],
          status: "New",
          caseType: formData.type || "Unspecified",
          lastUpdated: new Date().toISOString().split("T")[0],
        };

        setCases([newCase, ...cases]);
        setFormData({ title: "",
          type: "",
          description: "",
          location: "",
          datetime: formatDateTimeLocal(new Date()),
          suspect: "",
          evidence: "",
          browserloc:{}});
        setIsDialogOpen(false);

        toast({
          title: "Case Created",
          description: "Your new case has been created successfully.",
        });
      } else {
        throw new Error("Failed to create case.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create case. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const newCaseDetails = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (isLoggedIn === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {isLoggedIn ? <NavDashbord /> : <Navbar />}
      <div className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">Manage your forensic investigation cases</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cases..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Sort
                    {sortDirection === "asc" ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleSort("title")}>Title</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("date")}>Creation Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("lastUpdated")}>Last Updated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort("type")}>Case Type</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dialog for New Case */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1">
                    <FolderPlus className="h-4 w-4" />
                    New Case
                  </Button>
                </DialogTrigger>
                <DialogContent>
                              <DialogHeader>
                                <DialogTitle>New Case</DialogTitle>
                                <DialogDescription>Fill in the details of the issue.</DialogDescription>
                              </DialogHeader>
                
                              <form onSubmit={handleCreateCase}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="complaint-title">Case Title</Label>
                                    <Input
                                      type="text"
                                      id="complaint-title"
                                      placeholder="E.g., Phone Theft"
                                      name="title"
                                      value={formData.title}
                                      onChange={newCaseDetails}
                                    />
                                  </div>
                
                                  <div className="grid gap-2">
                                    <Label htmlFor="complaint-type">Complaint Category</Label>
                                    <Input
                                      id="complaint-type"
                                      placeholder="E.g., Theft, Harassment"
                                      name="type"
                                      value={formData.type}
                                      onChange={newCaseDetails}
                                    />
                                  </div>
                
                                  <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                      id="description"
                                      placeholder="Briefly describe the incident"
                                      name="description"
                                      value={formData.description}
                                      onChange={newCaseDetails}
                                    />
                                  </div>
                
                                  <div className="grid gap-2">
                                    <Label htmlFor="location">Location of Incident</Label>
                                    <Input
                                      id="location"
                                      placeholder="E.g., Near City Mall, 5th Street"
                                      name="location"
                                      value={formData.location}
                                      onChange={newCaseDetails}
                                    />
                                  </div>
                
                                  <div className="grid gap-2">
                                    <Label htmlFor="datetime">Date & Time</Label>
                                    <Input
                                      type="datetime-local"
                                      id="datetime"
                                      name="datetime"
                                      value={formData.datetime}
                                      onChange={newCaseDetails}
                                    />
                                  </div>
                
                                  <div className="grid gap-2">
                                    <Label htmlFor="suspect">Suspect Details (Optional)</Label>
                                    <Input
                                      id="suspect"
                                      placeholder="E.g., Male, 6ft, wearing black hoodie"
                                      name="suspect"
                                      value={formData.suspect}
                                      onChange={newCaseDetails}
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

          {/* Case Cards */}
          {sortedCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-1">No cases found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No cases match your search query"
                  : "Create your first case to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-1">
                  <FolderPlus className="h-4 w-4" />
                  Create a case
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCases.map((c) => (
                <Link to={`/case/${c._id}`} key={c._id}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="line-clamp-2">{c.title}</span>
                        <span className="text-xs font-normal px-2 py-1 rounded-full bg-forensic bg-opacity-10 text-forensic">
                          {c.status}
                        </span>
                      </CardTitle>
                      <CardDescription>{c.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mr-1" />
                        Created on {formatDate(c.date)}
                      </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground flex justify-end">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Updated {formatDate(c.lastUpdated)}
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
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
      {children}
    </label>
  );
}

function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
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

