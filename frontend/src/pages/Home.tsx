import { useEffect, useState } from 'react';
import axios from 'axios';

function Home() {
  const [health, setHealth] = useState<string>('Checking...');

  useEffect(() => {
    axios
      .get('/api/health')
      .then(response => {
        setHealth(`Backend is ${response.data.status}`);
      })
      .catch(() => {
        setHealth('Backend connection failed');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          AI Mental Health Companion
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your journey to better mental health starts here
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700">{health}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
