"use client";

import { useEffect, useState } from "react";
import UserList from "@/components/Chat/UserList";
import ChatBox from "@/components/Chat/ChatBox";
import { User } from "@/services/api";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Kullanıcı girişi kontrolü
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Banner için boşluk */}
      <div className="h-7" />
      {/* Chat container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sol taraf - Kullanıcı listesi */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute left-0 top-0 h-full w-[280px] border-r border-input-border bg-card-background transition-transform duration-300 ease-in-out z-10 shadow-lg`}>
          <UserList 
            onSelectUser={setSelectedUser} 
            selectedUser={selectedUser}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Sağ taraf - Chat alanı */}
        <div className="flex-1 bg-background pl-0">
          {selectedUser ? (
            <div className="relative h-full">
              <ChatBox
                selectedUser={selectedUser}
                onClose={() => {
                  setSelectedUser(null);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 relative">
              <div className="bg-[#1F2937] p-8 rounded-2xl flex flex-col items-center max-w-md mx-auto shadow-lg">
                <div className="bg-blue-500/10 p-4 rounded-full mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-100 mb-4 text-center">
                  Sohbete Başlamaya Hazır mısın?
                </h2>
                <p className="text-gray-400 text-center mb-8">
                  Sol taraftan bir kullanıcı seçerek yeni bir sohbet başlatabilirsin. Hemen şimdi iletişime geç!
                </p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Yeni Sohbet Başlat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
