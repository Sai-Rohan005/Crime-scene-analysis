import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();


  useEffect(() => {
    const allowed = sessionStorage.getItem("authToken");
  
    if (!allowed) {
      // Redirect or show "Page Not Found"
      navigate("/404"); // Or use a real 404 route
    }
  }, [navigate]);

  const resendotp=async()=>{
    try{

        const resend=await axios.post("http://localhost:5500/resent_otp",{}, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        })
        if(resend.data.status===200){
            toast({
                title: "code sent",
                description: resend.data.message,
            });
        }else{
            toast({
                variant:"destructive",
                title: "Error",
                description: resend.data.message,
            });
        }
    }catch(err){
        toast({
            variant:"destructive",
            title: "Error",
            description: err?.response?.data?.message || err.message || "Something went wrong",
        });

    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5500/verify-otp", {
        otp
      },{
        headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
      }
    );

      if (response.data.status === 200) {
        toast({
          title: "Verified",
          description: response.data.message,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }else if(response.data.status===210){
        toast({
          title: "Verified",
          description: response.data.message,
        });
        setTimeout(() => {
          navigate("/common");
        }, 1000);
      }
      else{
        toast({
            variant:"destructive",
            title: "Error",
            description: response.data.message,
          });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1 container flex flex-col items-center justify-center px-4 py-12">
        <Link
          to="/"
          className="absolute left-4 top-20 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>

        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Fingerprint className="h-8 w-8 text-forensic" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify OTP
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the one-time password sent to your email
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>

            <div className="text-center text-sm">
              Didn't receive the code?{" "}
              <button
                onClick={(resendotp)}
                className="font-medium text-primary hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
