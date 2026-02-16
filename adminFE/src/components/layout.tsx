"use client";
import React from 'react';
import { Sidebar, Header } from "../index";

export default function Layout({ children, title }: { children: React.ReactNode; title: string }) {
    return (
        <div className="flex h-screen overflow-hidden">

            {/* Sidebar on the left */}
            <div className=''>
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col ml-3 sm:ml-4 md:ml-5 mt-5 mr-5 lg:ml-6 overflow-y-hidden">

                {/* Header at the top */}
                <Header title={title} />

                {/* Dynamic content (children) */}
                <main className='flex-grow overflow-y-auto overflow-x-hidden mt-5 rounded-2xl'>

                    {children}

                </main>
            </div>
        </div>
    );
}
