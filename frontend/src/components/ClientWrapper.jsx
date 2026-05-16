'use client';
import ChatButton from '@/components/chat/ChatButton';
import Sidebar from '@/components/layout/Sidebar';

export default function ClientWrapper() {
  return (
    <>
      <Sidebar />
      <ChatButton />
    </>
  );
}