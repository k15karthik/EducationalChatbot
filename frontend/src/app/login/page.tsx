"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, BookOpen, Brain, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Login failed");
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", formData.username);
        
        router.push("/");
      } else {
        // Register
        const response = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            full_name: formData.fullName,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Registration failed");
        }

        // Auto-login after registration
        const loginResponse = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const loginData = await loginResponse.json();
        localStorage.setItem("token", loginData.access_token);
        localStorage.setItem("username", formData.username);
        
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (username: string, password: string) => {
    setFormData({ ...formData, username, password });
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F5F5F5] to-[#E8E8E8] flex">
      {/* Left Side - Promotional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3B6B8C] to-[#2F5570] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">EduChatbot</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Learn Smarter,<br />Not Harder
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Your AI-powered learning companion. Master CS concepts, practice coding, and track your progress—all in one place.
            </p>

            <div className="space-y-6 mt-12">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI-Powered Learning</h3>
                  <p className="text-white/70">Get personalized help and instant feedback</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Interactive Lessons</h3>
                  <p className="text-white/70">Learn by doing with hands-on exercises</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Track Progress</h3>
                  <p className="text-white/70">Monitor your learning journey in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 EduChatbot. Empowering students everywhere.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <Sparkles className="w-6 h-6 text-[#3B6B8C]" />
            <span className="text-xl font-bold text-[#1F1F1F]">EduChatbot</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-[#E8E8E8] p-8">
            <div className="flex space-x-2 mb-8 bg-[#F5F5F5] p-1 rounded-lg">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                  isLogin ? "bg-white text-[#3B6B8C] shadow-sm" : "text-[#5C5C5C] hover:text-[#1F1F1F]"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                  !isLogin ? "bg-white text-[#3B6B8C] shadow-sm" : "text-[#5C5C5C] hover:text-[#1F1F1F]"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">
                {isLogin ? "Welcome Back!" : "Create Account"}
              </h2>
              <p className="text-[#5C5C5C]">
                {isLogin ? "Enter your credentials to access your account" : "Sign up to start your learning journey"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-[#D4D4D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1F1F1F] mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D4D4D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1F1F1F] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-[#D4D4D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-[#D4D4D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5C5C] hover:text-[#1F1F1F]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3B6B8C] text-white py-3 rounded-lg font-semibold hover:bg-[#2F5570] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Processing..." : isLogin ? "Login" : "Create Account"}
              </button>
            </form>

            {isLogin && (
              <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                <p className="text-sm text-[#5C5C5C] mb-3 text-center">Quick login with demo accounts:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleQuickLogin("student1", "password123")}
                    className="px-4 py-2 bg-[#F5F5F5] hover:bg-[#E8E8E8] rounded-lg text-sm font-medium text-[#1F1F1F] transition-colors"
                  >
                    Student 1
                  </button>
                  <button
                    onClick={() => handleQuickLogin("student2", "password123")}
                    className="px-4 py-2 bg-[#F5F5F5] hover:bg-[#E8E8E8] rounded-lg text-sm font-medium text-[#1F1F1F] transition-colors"
                  >
                    Student 2
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#5C5C5C]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-[#3B6B8C] font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}