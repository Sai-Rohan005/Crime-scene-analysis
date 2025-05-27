
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import socket from "./socket";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    login: true,
  });


  // Countdown logic for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5500/login", formData);

      if (response.status === 200 && response.data.token) {
        setIsSignIn(false);
        setResendTimer(30); // start 30s countdown
      }
    } catch (error) {
      if (error.response) {
        const { status, message } = error.response.data;
        toast({
          variant: "destructive",
          title: "Error",
          description:
            status === 410 ? "Account does not exist with this email" : message,
        });

        if (status === 410) {
          setTimeout(() => navigate("/signup"), 1500);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Network or server error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      const updatedFormData = { ...formData, login: false };
      const resend = await axios.post("http://localhost:5500/login", updatedFormData);

      if (resend.data.status === 200) {
        toast({
          title: "Code sent",
          description: resend.data.message,
        });
        setResendTimer(30); // reset countdown
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: resend.data.message,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.response?.data?.message || err.message || "Something went wrong",
      });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { email } = formData;
      const response = await axios.post("http://localhost:5500/verify-otp", {
        email,
        otp,
      });

      const status = response.data.status;
      const token = response.data.token;

      if (status === 200 || status === 210) {
        if (token) sessionStorage.setItem("authToken", token);

        socket.on('connect', () => {
          socket.emit('registerUser', email);
        });

        setIsSuccess(true);
        toast({
          title: "Verified",
          description: response.data.message,
        });

        setTimeout(() => {
          navigate(status === 200 ? "/dashboard" : "/common");
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description:
          error?.response?.data?.message || "Something went wrong",
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
          {isSignIn ? (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Fingerprint className="h-8 w-8 text-forensic" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Sign in to CrimeSleuth AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email below to sign in to your account
                </p>
              </div>

              <form onSubmit={handleSignInSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleSignInChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleSignInChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="text-center text-sm">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Fingerprint className="h-8 w-8 text-forensic" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Verify OTP</h1>
                <p className="text-sm text-muted-foreground">
                  Enter the one-time password sent to your email
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    autoComplete="one-time-code"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </form>

              <div className="text-center text-sm">
                {resendTimer > 0 ? (
                  <span className="text-muted-foreground">
                    Resend OTP in {resendTimer}s
                  </span>
                ) : (
                  <>
                    Didn’t receive the code?{" "}
                    <button
                      onClick={resendOtp}
                      className="font-medium text-primary hover:underline"
                    >
                      Resend OTP
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}



