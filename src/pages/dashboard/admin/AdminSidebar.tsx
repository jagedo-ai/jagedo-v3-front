/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    ChevronFirst, Users, Briefcase, Home, ShoppingCart, LayoutDashboard,
    Package, Eye, Tag, Settings, MapPin, User, Hammer, Banknote, ChevronDown, ChartNoAxesCombined, FileText
} from "lucide-react";
import { rolePermissions } from "@/config/adminRoles";

const SidebarContext = createContext();

const sidebarItems = [
    { title: "Overview", items: [{ title: "Home", icon: Home, href: "/dashboard/admin", color: "#2B7FFF" }] },
    {
        title: "Management",
        items: [
            { title: "Jobs", icon: Briefcase, href: "/dashboard/admin/jobs", color: "#BC68FF" },
            { title: "Orders", icon: ShoppingCart, href: "/dashboard/admin/orders", color: "#05CA55" },
            {
                title: "Shop App", icon: LayoutDashboard, color: "#F4C440", submenu: [
                    { title: "Products", href: "/dashboard/admin/shop/products", icon: Package },
                    { title: "Customer View", href: "/dashboard/admin/shop/customer-view", icon: Eye },
                    { title: "Categories", href: "/dashboard/admin/shop/categories", icon: Tag },
                    { title: "Attributes", href: "/dashboard/admin/shop/attributes", icon: Settings },
                    { title: "Regions", href: "/dashboard/admin/shop/regions", icon: MapPin },
                    { title: "Prices", href: "/dashboard/admin/shop/prices", icon: Banknote },
                ]
            },
            {
                title: "Registers", icon: Users, color: "#9B59B6", submenu: [
                    { title: "Customers", href: "/dashboard/admin/customers", icon: User },
                    { title: "Builders", href: "/dashboard/admin/builders", icon: Hammer },
                ]
            },
            { title: "Analytics", icon: ChartNoAxesCombined, href: "/dashboard/admin/analytics", color: "#FB3C47" },
            { title: "Reports", icon: FileText, href: "/dashboard/admin/reports", color: "#14B8A6" },

        ]
    }
];

export function AdminSidebar({ expanded, setExpanded, adminRole = "SUPER_ADMIN" }) {
    const location = useLocation();

    const isActive = (href) => location.pathname === href;
    const isSubActive = (submenu) => submenu?.some(sub => location.pathname.startsWith(sub.href));

    const allowedItems = rolePermissions[adminRole] || rolePermissions.SUPER_ADMIN;
    const filteredSidebarItems = useMemo(() =>
        sidebarItems.map(section => ({
            ...section,
            items: section.items.filter(item => allowedItems.includes(item.title)),
        })).filter(section => section.items.length > 0),
        [adminRole]
    );

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setExpanded(false);
            } else {
                setExpanded(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setExpanded]);

    return (
        <>
            <div
                onClick={() => setExpanded(false)}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />
            <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r shadow-lg z-50 transition-all duration-300 ease-in-out lg:relative lg:shadow-sm ${expanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>
                <nav className="h-full flex flex-col">
                    <div className={`p-4 pb-2 flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
                        <div className={`overflow-hidden transition-all ${expanded ? "w-40" : "w-0"}`}>
                            <Link to="/admin/dashboard"><img src="/jagedologo.png" alt="JAGEDO Logo" className="relative" /></Link>
                        </div>
                        <button onClick={() => setExpanded((curr) => !curr)} className="p-2 rounded-xl bg-white shadow-sm border hover:bg-gray-50 transition-all text-gray-600">
                            {expanded ? <ChevronFirst className="w-5 h-5" /> : <ChevronFirst className="w-5 h-5 rotate-180" />}
                        </button>
                    </div>

                    <SidebarContext.Provider value={{ expanded, setExpanded }}>
                        <ul className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
                            {filteredSidebarItems.map((section, sectionIndex) => (
                                <div key={sectionIndex}>
                                    {expanded && <li className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</li>}
                                    {!expanded && sectionIndex > 0 && <hr className="my-3" />}
                                    {section.items.map((item, itemIndex) => (
                                        <SidebarItem key={item.title + itemIndex} icon={<item.icon size={20} style={{ color: item.color }} />} text={item.title} href={item.href} submenu={item.submenu} active={item.href ? isActive(item.href) : isSubActive(item.submenu)} />
                                    ))}
                                </div>
                            ))}
                        </ul>
                    </SidebarContext.Provider>

                    <div className="border-t flex p-3">
                        <img src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true" alt="User Avatar" className="w-10 h-10 rounded-md" />
                        <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                            <div className="leading-4">
                                <h4 className="font-semibold text-sm whitespace-nowrap">{adminRole.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</h4>
                                <span className="text-xs text-gray-600">admin@jagedo.com</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}

export function SidebarItem({ icon, text, href, active, submenu }) {
    const { expanded, setExpanded } = useContext(SidebarContext);
    const [open, setOpen] = useState(active);
    const location = useLocation();

    useEffect(() => { if (active) setOpen(true); }, [active]);

    const handleSubmenuClick = () => {
        if (!expanded) {
            setExpanded(true);
            setOpen(true);
        } else {
            setOpen(prev => !prev);
        }
    };

    if (submenu) {
        return (
            <li className={`rounded-md text-sm my-1 ${active ? "bg-indigo-50 text-indigo-800" : "text-gray-600"}`}>
                <div onClick={handleSubmenuClick} className="relative flex items-center py-2 px-3 font-medium rounded-md cursor-pointer transition-colors hover:bg-indigo-50">
                    {icon}
                    <span className={`overflow-hidden transition-all whitespace-nowrap ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
                    {expanded && <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
                </div>
                {open && expanded && (
                    <ul className="pl-9 text-xs transition-all duration-300">
                        {submenu.map((subItem, index) => {
                            const SubIcon = subItem.icon;
                            return (
                                <li key={index} className="py-1">
                                    <Link to={subItem.href} className={`flex items-center gap-2 rounded-md p-1 transition-colors whitespace-nowrap ${location.pathname === subItem.href ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}>
                                        <SubIcon size={18} />
                                        <span>{subItem.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </li>
        );
    }

    return (
        <Link to={href}>
            <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group text-sm ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-indigo-50 text-gray-600"}`}>
                {icon}
                <span className={`overflow-hidden transition-all whitespace-nowrap ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
                {!expanded && <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all z-20 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>{text}</div>}
            </li>
        </Link>
    );
}




