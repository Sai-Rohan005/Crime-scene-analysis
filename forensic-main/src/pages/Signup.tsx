
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_Password: '', 
  });
  
  const [result,setresult]=useState("");
  const [bool,setbool]=useState(false);
  const [boolborder,setboolborder]=useState(null);
  const [passcheck,setpasscheck]=useState("");


  const handelchange=(e)=>{
    const {name,value}=e.target;
    const formupdate=({
        ...formData,
        [name]:value
    })
    setFormData(formupdate);
    if(formupdate.password && formupdate.confirm_Password){
        if(formupdate.password===formupdate.confirm_Password){
            setboolborder(true);
            setpasscheck("Password and Confirm Password matched.");
        }else{
            setboolborder(false);
            setpasscheck("Password and Confirm Password must be same.");
        }
    }

  }

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    
    if(formData.password!==formData.confirm_Password){
        return;
    }

    try{
      setIsLoading(true);
      const responseback=await axios.post('http://localhost:5500/signup',formData);
      if(responseback){
        console.log(responseback);
        if(responseback.data.status==200){
          toast({
            title: "Account Created",
            description: "Sucessfull",
          });
          navigate("/SignIn");

        }
        else{
          toast({
            variant: "destructive",
            title: "Error",
            description: responseback.data.message,
          });

        }
      }
    }catch(error){
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error in submiting form",
      });


    }

  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <div className="flex-1 container flex flex-col items-center justify-center px-4 py-12">
        <Link to="/" className="absolute left-4 top-20 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
        
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Fingerprint className="h-8 w-8 text-forensic" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign up to CrimeSleuth AI</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create to your account
            </p>
          </div>
          
          <div className="grid gap-6">
            <form method="post" action="/login" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handelchange}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handelchange}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    required
                  />
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    name="confirm_Password"
                    value={formData.confirm_Password}
                    onChange={handelchange}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    required
                    style={{borderColor : boolborder===null ? "":  boolborder ? 'green': 'red'}}
                  />
                  <p style={{color :  boolborder ? 'green': 'red'}} className="text-center text-[12px]">{passcheck}</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/signin" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </div>
            <div className="text-center text-sm" style={{color : bool ? 'green' : 'red'}}>
              {result}
            </div>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
