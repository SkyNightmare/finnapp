import React, { useState } from 'react';
+import { User, Mail, Lock, UserPlus, LogIn, Wallet } from 'lucide-react';
+
+interface AuthFormProps {
+  onLogin: (userData: { id: string; email: string; name: string }) => void;
+}
+
+export function AuthForm({ onLogin }: AuthFormProps) {
+  const [isLogin, setIsLogin] = useState(true);
+  const [formData, setFormData] = useState({
+    name: '',
+    email: '',
+    password: '',
+    confirmPassword: ''
+  });
+  const [errors, setErrors] = useState<string[]>([]);
+
+  const handleSubmit = (e: React.FormEvent) => {
+    e.preventDefault();
+    setErrors([]);
+
+    // Basic validation
+    const newErrors: string[] = [];
+    
+    if (!formData.email.trim()) {
+      newErrors.push('Email is required');
+    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
+      newErrors.push('Please enter a valid email address');
+    }
+    
+    if (!formData.password.trim()) {
+      newErrors.push('Password is required');
+    } else if (formData.password.length < 6) {
+      newErrors.push('Password must be at least 6 characters long');
+    }
+    
+    if (!isLogin) {
+      if (!formData.name.trim()) {
+        newErrors.push('Name is required');
+      }
+      if (formData.password !== formData.confirmPassword) {
+        newErrors.push('Passwords do not match');
+      }
+    }
+
+    if (newErrors.length > 0) {
+      setErrors(newErrors);
+      return;
+    }
+
+    // Simulate authentication (in a real app, this would be an API call)
+    const userData = {
+      id: isLogin ? 
+        btoa(formData.email).replace(/[^a-zA-Z0-9]/g, '') : // Generate ID from email for login
+        Date.now().toString() + Math.random().toString(36).substr(2), // Generate new ID for registration
+      email: formData.email.trim(),
+      name: isLogin ? 
+        formData.email.split('@')[0] : // Use email prefix as name for login
+        formData.name.trim()
+    };
+
+    // For registration, store user data
+    if (!isLogin) {
+      const users = JSON.parse(localStorage.getItem('finance-users') || '{}');
+      users[formData.email] = {
+        id: userData.id,
+        name: userData.name,
+        email: userData.email,
+        password: formData.password // In a real app, this would be hashed
+      };
+      localStorage.setItem('finance-users', JSON.stringify(users));
+    } else {
+      // For login, verify user exists
+      const users = JSON.parse(localStorage.getItem('finance-users') || '{}');
+      const user = users[formData.email];
+      
+      if (!user) {
+        setErrors(['Account not found. Please register first.']);
+        return;
+      }
+      
+      if (user.password !== formData.password) {
+        setErrors(['Invalid password.']);
+        return;
+      }
+      
+      userData.id = user.id;
+      userData.name = user.name;
+    }
+
+    onLogin(userData);
+  };
+
+  const handleInputChange = (field: string, value: string) => {
+    setFormData(prev => ({ ...prev, [field]: value }));
+    // Clear errors when user starts typing
+    if (errors.length > 0) {
+      setErrors([]);
+    }
+  };
+
+  return (
+    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
+      <div className="w-full max-w-md">
+        {/* Logo/Header */}
+        <div className="text-center mb-8">
+          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300 mx-auto mb-4">
+            <Wallet className="w-10 h-10 text-white" />
+          </div>
+          <h1 className="text-3xl font-black bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
+            Finance Tracker
+          </h1>
+          <p className="text-gray-600 font-medium mt-2">
+            {isLogin ? 'Welcome back! Sign in to your account' : 'Create your account to get started'}
+          </p>
+        </div>
+
+        {/* Auth Form */}
+        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
+          <div className="flex items-center justify-center mb-6">
+            <div className="flex bg-gray-100 rounded-xl p-1">
+              <button
+                type="button"
+                onClick={() => setIsLogin(true)}
+                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
+                  isLogin
+                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
+                    : 'text-gray-600 hover:text-gray-800'
+                }`}
+              >
+                <LogIn className="w-4 h-4" />
+                Login
+              </button>
+              <button
+                type="button"
+                onClick={() => setIsLogin(false)}
+                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
+                  !isLogin
+                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
+                    : 'text-gray-600 hover:text-gray-800'
+                }`}
+              >
+                <UserPlus className="w-4 h-4" />
+                Register
+              </button>
+            </div>
+          </div>
+
+          {errors.length > 0 && (
+            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
+              <ul className="text-red-700 text-sm space-y-1">
+                {errors.map((error, index) => (
+                  <li key={index} className="flex items-center gap-2">
+                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
+                    {error}
+                  </li>
+                ))}
+              </ul>
+            </div>
+          )}
+
+          <form onSubmit={handleSubmit} className="space-y-6">
+            {!isLogin && (
+              <div>
+                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
+                  Full Name
+                </label>
+                <div className="relative">
+                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
+                  <input
+                    type="text"
+                    value={formData.name}
+                    onChange={(e) => handleInputChange('name', e.target.value)}
+                    placeholder="Enter your full name"
+                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
+                  />
+                </div>
+              </div>
+            )}
+
+            <div>
+              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
+                Email Address
+              </label>
+              <div className="relative">
+                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
+                <input
+                  type="email"
+                  value={formData.email}
+                  onChange={(e) => handleInputChange('email', e.target.value)}
+                  placeholder="Enter your email"
+                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
+                />
+              </div>
+            </div>
+
+            <div>
+              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
+                Password
+              </label>
+              <div className="relative">
+                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
+                <input
+                  type="password"
+                  value={formData.password}
+                  onChange={(e) => handleInputChange('password', e.target.value)}
+                  placeholder="Enter your password"
+                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
+                />
+              </div>
+            </div>
+
+            {!isLogin && (
+              <div>
+                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
+                  Confirm Password
+                </label>
+                <div className="relative">
+                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
+                  <input
+                    type="password"
+                    value={formData.confirmPassword}
+                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
+                    placeholder="Confirm your password"
+                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white shadow-inner font-medium"
+                  />
+                </div>
+              </div>
+            )}
+
+            <button
+              type="submit"
+              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-bold text-lg shadow-2xl transform hover:scale-105 active:scale-95"
+            >
+              {isLogin ? 'Sign In' : 'Create Account'}
+            </button>
+          </form>
+
+          <div className="mt-6 text-center">
+            <p className="text-gray-600 text-sm">
+              {isLogin ? "Don't have an account? " : "Already have an account? "}
+              <button
+                type="button"
+                onClick={() => setIsLogin(!isLogin)}
+                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
+              >
+                {isLogin ? 'Register here' : 'Sign in here'}
+              </button>
+            </p>
+          </div>
+        </div>
+
+        {/* Demo Account Info */}
+        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
+          <p className="text-yellow-800 text-sm text-center">
+            <strong>Demo:</strong> You can create any account - data is stored locally in your browser
+          </p>
+        </div>
+      </div>
+    </div>
+  );
+}