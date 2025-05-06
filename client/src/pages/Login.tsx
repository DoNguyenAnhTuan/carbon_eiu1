import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DEFAULT_ACCOUNT = { username: "admin", password: "admin" };

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize account in localStorage if not exists
  useEffect(() => {
    const stored = localStorage.getItem("account");
    if (!stored) {
      localStorage.setItem("account", JSON.stringify(DEFAULT_ACCOUNT));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem("account");
    const account = stored ? JSON.parse(stored) : DEFAULT_ACCOUNT;
    if (username === account.username && password === account.password) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B3D61] to-[#002855]">
      <Card className="w-[450px] shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/images/logo%20EIU.png"
              alt="EIU Logo"
              className="h-32 w-auto"
              onError={(e) => {
                console.error('Failed to load logo:', e);
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/150x50";
              }}
            />
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-[#0B3D61]">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your energy management dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="border-gray-300 focus:border-[#0B3D61] focus:ring-[#0B3D61]"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-[#0B3D61] hover:text-[#002855] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="border-gray-300 focus:border-[#0B3D61] focus:ring-[#0B3D61] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-[#0B3D61] hover:bg-[#002855] text-white"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 