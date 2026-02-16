"use client";
import { useEffect, useState } from "react";
import images from '@/assets/images';
import Image from 'next/image';
import { useRouter } from "next/navigation";

interface SidebarItem {
    name: string;
    href: string;
    icon: string;
}

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [activeItem, setActiveItem] = useState<string>('');
    const router = useRouter();

    const handleItemClick = (href: string) => {
        setActiveItem(href);
        router.push(href);
    };

    useEffect(() => {
        setActiveItem(window.location.pathname);
    }, []);

    const sidebarItems: SidebarItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: images.sidebar.dashboardIcon },
        { name: 'Offers', href: '/offers', icon: images.sidebar.offersIcon },
        { name: 'Member KPIs', href: '/member_KPIs', icon: images.sidebar.memberKPIsIcon },
        { name: 'Brands KPIs', href: '/brands_KPIs', icon: images.sidebar.brandsKPIsIcon },
        { name: 'Tribes', href: '/tribes', icon: images.sidebar.tribesIcon },
        { name: 'Request', href: '/request', icon: images.sidebar.requestIcon },
        { name: 'Approved', href: '/approved', icon: images.sidebar.approvedIcon },
    ];


    const toggleSidebar = () => { setIsOpen(!isOpen); };

    // Automatically close the sidebar on mobile screens and high zoom levels
    useEffect(() => {
        const handleResize = () => {
            const widthThreshold = 768;
            const zoomThreshold = 2.0;

            if (window.innerWidth < widthThreshold || window.devicePixelRatio >= zoomThreshold) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        // Run on initial load
        handleResize();

        // Add event listener to handle window resize and zoom changes
        window.addEventListener('resize', handleResize);

        // Clean up the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={`flex flex-col h-screen bg-soft-gray shadow-xl transition-all duration-200 
        ${isOpen ? 'md:w-60 w-40 p-2 md:p-4' : 'w-12 md:w-16 p-2'}
        `}>
            <nav className="flex-grow" >
                {/* Header Section */}
                <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
                    <Image src={images.sidebar.tribemeIcon} alt="Tribe Me" width={100} height={100} className={`${isOpen ? 'sm:h-7' : 'hidden'}`} />
                    <div onClick={toggleSidebar} className={`hover:bg-light-silver rounded-md cursor-pointer flex justify-center items-center ${isOpen ? 'sm:p-0' : 'p-1'}`}>
                        <Image src={images.sidebar.sidebarIcon} alt="Sidebar Icon" width={isOpen ? 25 : 30} height={isOpen ? 25 : 30} className={`transition-all duration-200 ${activeItem === 'sidebarIcon' ? 'filter-black' : 'filter-gray'}`} />
                    </div>
                </div>

                {/* Divider */}
                <div className="p-1 flex items-center justify-between border-b border-cool-gray"></div>

                {/* Navigation Items */}
                <ul className="mt-2 space-y-1">
                    {sidebarItems.map((item) => (
                        <li key={item.name} title={item.name} onClick={() => handleItemClick(item.href)} className={`flex items-center rounded-md cursor-pointer transition-all duration-300 ${activeItem === item.href ? 'bg-light-silver text-Blackish' : 'hover:bg-light-silver text-gray-4e4e4e'} ${isOpen ? 'px-2 py-3' : 'justify-center py-2'}`}>
                            <Image src={item.icon} alt={`${item.name} Icon`} width={isOpen ? 25 : 30} height={isOpen ? 25 : 30} className={`transition-all duration-200 ${activeItem === item.href ? 'filter-black' : 'filter-gray'}`} />
                            {isOpen && <span className="ml-2 font-proxima">{item.name}</span>}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Settings Section */}
            <div
                onClick={() => handleItemClick('/settings')}
                title="Settings" className={`mt-auto rounded-md cursor-pointer transition-all duration-300 ${activeItem === '/settings' ? 'bg-light-silver text-Blackish' : 'hover:bg-light-silver text-gray-4e4e4e'} ${isOpen ? 'px-2 py-3 flex justify-start' : 'justify-center flex py-2'}`}>
                <div className="flex items-center justify-center">
                    <Image src={images.sidebar.settingsIcon} alt="Settings Icon" width={isOpen ? 25 : 30} height={isOpen ? 25 : 30} className={`transition-all duration-200 ${activeItem === '/settings' ? 'filter-black' : 'filter-gray'}`} />
                    {isOpen && <span className="ml-2 font-proxima">Settings</span>}
                </div>
            </div>
        </div>
    );
}