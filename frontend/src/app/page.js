'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
      .then(res => res.json())
      .then(data => setStatus(data.message))
      .catch(() => setStatus('Backend not reachable'));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-700">Freedge</h1>
        <p className="mt-4 text-gray-500">Backend status: <strong>{status}</strong></p>
      </div>
    </main>
  );
}