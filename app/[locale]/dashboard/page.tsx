'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DeleteConfirmationModal from '@/components/dashboard/DeleteConfirmationModal';
import SettingsModal from '@/components/dashboard/SettingsModal';
import LogsModal from '@/components/dashboard/LogsModal';

// Mock data generator
const generateMetric = (base: number, variance: number) =>
    Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance));

export default function DashboardPage() {
    const { data: session } = useSession();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const t = useTranslations('Dashboard');
    const [activeTab, setActiveTab] = useState('containers');

    // Modals state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Real-time metrics state
    const [cpuData, setCpuData] = useState<Array<{ time: string, value: number }>>([]);
    const [memoryData, setMemoryData] = useState<Array<{ time: string, value: number }>>([]);
    const [currentMetrics, setCurrentMetrics] = useState({
        cpu: 42,
        memory: 68,
        disk: 55,
        networkDown: '125',
        networkUp: '45'
    });

    // Timeline events
    const [timeline, setTimeline] = useState([
        { id: 1, time: '2 min ago', event: 'Container nginx-proxy started', type: 'success' },
        { id: 2, time: '15 min ago', event: 'Container redis-cache stopped', type: 'warning' },
        { id: 3, time: '1 hour ago', event: 'System update completed', type: 'info' },
        { id: 4, time: '3 hours ago', event: 'High CPU usage detected', type: 'error' },
    ]);

    // Containers data
    const [containers, setContainers] = useState([
        { id: 1, name: 'nginx-proxy', status: 'running', cpu: '12%', memory: '256MB', uptime: '5d 3h', image: 'nginx:latest' },
        { id: 2, name: 'postgres-db', status: 'running', cpu: '8%', memory: '512MB', uptime: '12d 7h', image: 'postgres:14' },
        { id: 3, name: 'redis-cache', status: 'stopped', cpu: '0%', memory: '0MB', uptime: '-', image: 'redis:alpine' },
        { id: 4, name: 'app-backend', status: 'running', cpu: '25%', memory: '1.2GB', uptime: '2d 14h', image: 'node:18' },
        { id: 5, name: 'worker-service', status: 'running', cpu: '15%', memory: '340MB', uptime: '1d 2h', image: 'python:3.9' },
    ]);

    // Update metrics every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            const newCpu = generateMetric(currentMetrics.cpu, 20);
            const newMemory = generateMetric(currentMetrics.memory, 15);

            setCpuData(prev => [...prev.slice(-19), { time: timeStr, value: newCpu }]);
            setMemoryData(prev => [...prev.slice(-19), { time: timeStr, value: newMemory }]);

            setCurrentMetrics({
                cpu: Math.round(newCpu),
                memory: Math.round(newMemory),
                disk: currentMetrics.disk,
                networkDown: Math.round(100 + Math.random() * 50).toString(),
                networkUp: Math.round(30 + Math.random() * 20).toString()
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [currentMetrics.cpu, currentMetrics.memory, currentMetrics.disk]);

    const handleContainerAction = async (containerId: number, action: string) => {
        if (action === 'delete') {
            const container = containers.find(c => c.id === containerId);
            setSelectedContainer(container);
            setIsDeleteModalOpen(true);
            return;
        }

        if (action === 'logs') {
            const container = containers.find(c => c.id === containerId);
            setSelectedContainer(container);
            setIsLogsModalOpen(true);
            return;
        }

        setActionLoading(containerId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (action === 'toggle') {
            setContainers(prev => prev.map(c =>
                c.id === containerId
                    ? { ...c, status: c.status === 'running' ? 'stopped' : 'running' }
                    : c
            ));
        } else if (action === 'restart') {
            // Visual feedback for restart
        }

        setActionLoading(null);
    };

    const handleDeleteConfirm = () => {
        if (selectedContainer) {
            setContainers(prev => prev.filter(c => c.id !== selectedContainer.id));
            setIsDeleteModalOpen(false);
            setSelectedContainer(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
            {/* Header */}
            <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-40">
                <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="./" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
                                <h1 className="text-xl font-bold text-white">Nexus Panel</h1>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-green-400 text-sm font-medium">Live</span>
                            </div>
                            <button
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity"
                                >
                                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl py-1 z-50">
                                        <div className="px-4 py-2 border-b border-slate-700">
                                            <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
                                            <p className="text-slate-400 text-xs truncate">{session?.user?.email}</p>
                                        </div>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white text-sm"
                                        >
                                            Settings
                                        </Link>
                                        {(session?.user as any)?.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="block px-4 py-2 text-purple-400 hover:bg-slate-700 hover:text-purple-300 text-sm"
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 hover:text-red-300 text-sm"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Metrics & Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* System Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* CPU */}
                            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-xs font-medium">CPU</span>
                                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{currentMetrics.cpu}%</div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${currentMetrics.cpu}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Memory */}
                            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-xs font-medium">Memory</span>
                                        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{currentMetrics.memory}%</div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-gradient-to-r from-pink-500 to-pink-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${currentMetrics.memory}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Disk */}
                            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-xs font-medium">Disk</span>
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{currentMetrics.disk}%</div>
                                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${currentMetrics.disk}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Network */}
                            <div className="relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-4">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
                                <div className="relative h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-xs font-medium">Network</span>
                                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Download */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                                <span className="text-lg font-bold text-white">{currentMetrics.networkDown}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">MB/s</span>
                                        </div>

                                        {/* Upload */}
                                        <div className="flex items-center justify-between border-t border-slate-700/50 pt-1">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                                <span className="text-lg font-bold text-white">{currentMetrics.networkUp}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">MB/s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CPU Chart */}
                            <div className="rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                    CPU Usage (Live)
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={cpuData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#cbd5e1' }}
                                        />
                                        <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Memory Chart */}
                            <div className="rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                                    Memory Usage (Live)
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={memoryData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                            labelStyle={{ color: '#cbd5e1' }}
                                        />
                                        <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Containers Table */}
                        <div className="rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">Docker Containers</h2>
                                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm">
                                        + New Container
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">CPU</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Memory</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Uptime</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {containers.map((container) => (
                                            <tr key={container.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-white font-medium text-sm">{container.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">{container.image}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${container.status === 'running'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${container.status === 'running' ? 'bg-green-400' : 'bg-red-400'
                                                            }`} />
                                                        {container.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{container.cpu}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{container.memory}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{container.uptime}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleContainerAction(container.id, 'toggle')}
                                                            disabled={actionLoading === container.id}
                                                            className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors ${actionLoading === container.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            title={container.status === 'running' ? 'Stop' : 'Start'}
                                                        >
                                                            {actionLoading === container.id ? (
                                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : container.status === 'running' ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleContainerAction(container.id, 'restart')}
                                                            disabled={actionLoading === container.id}
                                                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                                                            title="Restart"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleContainerAction(container.id, 'logs')}
                                                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                                                            title="View Logs"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleContainerAction(container.id, 'delete')}
                                                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Timeline */}
                    <div className="space-y-6">
                        <div className="rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activity Timeline
                            </h3>

                            <div className="space-y-4">
                                {timeline.map((event) => (
                                    <div key={event.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${event.type === 'success' ? 'bg-green-400' :
                                                event.type === 'warning' ? 'bg-yellow-400' :
                                                    event.type === 'error' ? 'bg-red-400' :
                                                        'bg-blue-400'
                                                }`} />
                                            {event.id !== timeline[timeline.length - 1].id && (
                                                <div className="w-0.5 h-full bg-slate-700 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-white text-sm">{event.event}</p>
                                            <p className="text-slate-400 text-xs mt-1">{event.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6">
                            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Total Containers</span>
                                    <span className="text-white font-semibold">{containers.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Running</span>
                                    <span className="text-green-400 font-semibold">{containers.filter(c => c.status === 'running').length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Stopped</span>
                                    <span className="text-red-400 font-semibold">{containers.filter(c => c.status === 'stopped').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Language Selector - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-slate-700/80 transition-all duration-300 shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span className="text-sm font-medium">Language</span>
                    </button>

                    <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <div className="p-2 space-y-1">
                            <Link href="/en/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <span className="text-2xl">🇬🇧</span>
                                <span className="text-white text-sm">English</span>
                            </Link>
                            <Link href="/es/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <span className="text-2xl">🇪🇸</span>
                                <span className="text-white text-sm">Español</span>
                            </Link>
                            <Link href="/zh/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <span className="text-2xl">🇨🇳</span>
                                <span className="text-white text-sm">中文</span>
                            </Link>
                            <Link href="/hi/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <span className="text-2xl">🇮🇳</span>
                                <span className="text-white text-sm">हिन्दी</span>
                            </Link>
                            <Link href="/fr/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <span className="text-2xl">🇫🇷</span>
                                <span className="text-white text-sm">Français</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                containerName={selectedContainer?.name || ''}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />

            <LogsModal
                isOpen={isLogsModalOpen}
                onClose={() => setIsLogsModalOpen(false)}
                containerName={selectedContainer?.name || ''}
            />
        </div>
    );
}
