'use client';
import { useState, useEffect } from 'react';
import ChatButton from '@/components/chat/ChatButton';
import Sidebar from '@/components/layout/Sidebar';

export default function ClientWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <>
      <Sidebar />
      <ChatButton />
    </>
  );
}