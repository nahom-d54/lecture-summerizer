import { LogOut, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Lecture Summarizer</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Link to="/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Recording
            </Button>
          </Link>
        </div>

        <RecordingList search={search} />
      </main>
    </div>
  );
}
