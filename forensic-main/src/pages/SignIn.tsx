import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 🔐 Cleanup any leftover localStorage token
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await axios.post("http://localhost:5500/login", formData);

      if (response.status === 200 && response.data.token) {
        const token = response.data.token;

        // ✅ Store token in sessionStorage
        sessionStorage.setItem("authToken", token);

        toast({
          title: "Welcome back",
          description: response.data.message,
        });

        // Navigate after a slight delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      if (error.response) {
        const { status, message } = error.response.data;
        if (status === 410) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Account Doesnot exist with this mail",
          });
          setTimeout(() => navigate("/signup"), 1500);
        } else if (status === 401) {
          toast({
            variant: "destructive",
            title: "Error",
            description: message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: message,
          });
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
              Sign in to CrimeSleuth AI
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to sign in to your account
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
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
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>

            {message && (
              <div
                className="text-center text-sm"
                style={{ color: isSuccess ? "green" : "red" }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
