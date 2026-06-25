import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { showToast, showErrorToast } from '../../utils/toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@workforce.com',
    password: 'Password123!',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      setToken(response.data.data.token);
      setUser(response.data.data.user);
      showToast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" aria-hidden="true"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Card with modern styling */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Workforce CRM
            </h1>
            <p className="text-white/70 text-sm font-medium tracking-wide">
              Employee Performance Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login form">
            <div>
              <label htmlFor="email-input" className="block text-sm font-semibold text-white/80 mb-2">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition backdrop-blur-sm"
                placeholder="your@email.com"
                required
                aria-required="true"
                aria-label="Email address"
              />
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-semibold text-white/80 mb-2">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition backdrop-blur-sm"
                placeholder="••••••••"
                required
                aria-required="true"
                aria-label="Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></span>
                  Logging in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/50 text-xs font-medium">DEMO ACCESS</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Demo credentials card */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-white/80 font-semibold text-sm mb-3">Test Credentials:</p>
            <div className="space-y-2 text-xs text-white/70 font-mono">
              <div className="flex justify-between items-center">
                <span>admin@workforce.com</span>
                <span className="text-purple-300 text-[10px] uppercase tracking-wide">Super Admin</span>
              </div>
              <div className="text-white/50">Password123!</div>
            </div>
            <p className="text-white/50 text-[11px] mt-3 pt-3 border-t border-white/10">
              Other accounts: hr@, lead@, emp1@, intern@ with same password
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-white/60 text-sm mt-6">
            Ready to get started?{' '}
            <Link to="/register" className="text-purple-300 hover:text-purple-200 font-semibold transition">
              Create an account
            </Link>
          </p>
        </div>

        {/* Bottom accent */}
        <p className="text-center text-white/40 text-xs mt-8 tracking-widest uppercase">
          Powered by Workforce CRM
        </p>
      </div>
    </div>
  );
}
