import { motion } from 'framer-motion';
import { Home, LayoutGrid, LogOut, Mic, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RecordingList } from '@/components/dashboard/RecordingList';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col z-50">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TranscribeAI
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-white bg-slate-800/50 hover:bg-slate-800"
            >
              <LayoutGrid className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-slate-800 hover:text-white"
            >
              <Home className="mr-3 h-5 w-5" />
              Back to Website
            </Button>
          </Link>
          {/* Placeholder for future links */}
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-slate-800 hover:text-white opacity-50 cursor-not-allowed"
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings (Soon)
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Free Plan</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile Header (visible on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 z-40 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TranscribeAI</span>
        </Link>
        <Button variant="ghost" size="icon" className="text-slate-300" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-slate-900"
              >
                Welcome back, {user?.email?.split('@')[0]}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 mt-2"
              >
                Here's what's happening with your recordings today.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/upload">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl px-8"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  New Recording
                </Button>
              </Link>
            </motion.div>
          </header>

          {/* Search Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </motion.div>

          {/* Content Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Recordings</h2>
              {/* Could add filter/sort dropdowns here later */}
            </div>

            <RecordingList search={search} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
