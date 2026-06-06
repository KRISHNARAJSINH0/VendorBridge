"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "../../context/StateContext";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function DashboardLayout({ children }) {
  const { currentUser, activeView, setActiveView } = useAppState();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    // We check window to avoid issues with initial SSR
    if (typeof window !== "undefined" && !currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Redirecting to login portal...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #030712;
            color: #9ca3af;
            gap: 1rem;
            font-family: sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="dashboard-main-area">
        <Header activeView={activeView} />
        <main className="main-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .dashboard-main-area {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow-y: auto;
          position: relative;
        }

        @media (max-width: 768px) {
          .dashboard-main-area {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}
