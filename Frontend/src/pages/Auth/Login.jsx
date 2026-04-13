import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Building,
  ArrowRight
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      toast.success('Successfully logged in!');
      
      // Smart redirection based on permissions
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.permissions?.includes('dashboard.view') || user?.roles?.includes('SuperAdmin') || user?.roles?.includes('Owner')) {
        navigate('/dashboard');
      } else if (user?.permissions?.includes('users.view')) {
        navigate('/users');
      } else if (user?.permissions?.includes('products.view')) {
        navigate('/products');
      } else if (user?.permissions?.includes('orders.view')) {
        navigate('/orders');
      } else if (user?.permissions?.includes('expenses.view')) {
        navigate('/expenses');
      } else if (user?.permissions?.includes('deliveries.view')) {
        navigate('/deliveries');
      } else if (user?.permissions?.includes('audit-logs.view')) {
        navigate('/audit-logs');
      } else if (user?.permissions?.includes('settings.view')) {
        navigate('/settings');
      } else {
        navigate('/profile'); // Fallback to profile if no specific page permissions
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <Toaster />
      
      <div className="w-full max-w-[440px]">
        {/* All-in-one Login Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-10 sm:p-12 space-y-10">
            {/* Integrated Header */}
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Company Management</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Business Suite</p>
              
              <div className="pt-8 space-y-1">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
                <p className="text-sm font-medium text-slate-400">Sign in to your account to continue</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-slate-700 placeholder:text-slate-300"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-slate-700 placeholder:text-slate-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-start px-1">
                  <button type="button" className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors">Forgot Password?</button>
                </div>
              </div>

              {/* Sign In Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer / Support */}
            <div className="pt-6 border-t border-slate-50 text-center">
              <p className="text-sm font-medium text-slate-400">
                Don't have an account?{' '}
                <button className="text-blue-600 font-bold hover:underline transition-all underline-offset-4">Contact Support</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
