import React, { useState, useEffect } from 'react';
import { User, Project, OBSERVER_TITLES } from '../../types';
import { BarChart3, Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../../services/supabaseDb';

interface ObserverDashboardProps {
    user: User;
    onLogout: () => void;
}

const ObserverDashboard: React.FC<ObserverDashboardProps> = ({ user, onLogout }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState<'overview' | 'projects' | 'approvals' | 'calendar'>('overview');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const allProjects = await db.projects.getAll();
            setProjects(allProjects);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get personalized title and message
    const jobTitle = user.job_title || 'EXECUTIVE';
    const fullTitle = OBSERVER_TITLES[jobTitle] || jobTitle;

    const getIcon = () => {
        if (jobTitle === 'COO') return '👔';
        if (jobTitle === 'CRO') return '💰';
        if (jobTitle === 'CTO') return '💻';
        if (jobTitle === 'CFO') return '📊';
        if (jobTitle === 'BOARD') return '🎯';
        return '👁️';
    };

    const getWelcomeMessage = () => {
        if (jobTitle === 'COO') return 'Track operational efficiency across all content workflows';
        if (jobTitle === 'CRO') return 'Monitor content impact on revenue and lead generation';
        if (jobTitle === 'CTO') return 'Review technical content and product announcements';
        if (jobTitle === 'CFO') return 'Oversee content investment and resource allocation';
        if (jobTitle === 'BOARD') return 'Executive overview of content pipeline and performance';
        return 'Complete visibility into content creation pipeline';
    };

    // Calculate stats
    const stats = {
        pending: projects.filter(p => p.status === 'WAITING_APPROVAL').length,
        approved: projects.filter(p => p.status === 'DONE' && p.created_at.includes(new Date().toISOString().split('T')[0].slice(0, 7))).length,
        inProduction: projects.filter(p => p.status === 'IN_PROGRESS').length,
        posted: projects.filter(p => p.current_stage === 'POSTED').length,
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b-2 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-600 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-2xl">
                            {getIcon()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">
                                {jobTitle} - Executive Dashboard
                            </h1>
                            <p className="text-sm text-slate-600 font-medium">Content Pipeline Overview</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{fullTitle}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-6 py-2 bg-black text-white border-2 border-black font-bold uppercase text-sm hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 border-b-2 border-black">
                <div className="max-w-7xl mx-auto px-6 py-8 text-white">
                    <h2 className="text-3xl font-black uppercase mb-2">
                        Welcome back, {user.full_name.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-purple-100 font-medium text-lg">{getWelcomeMessage()}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8">
                    <button
                        onClick={() => setCurrentView('overview')}
                        className={`px-6 py-3 font-bold uppercase text-sm border-2 border-black transition-all ${currentView === 'overview'
                            ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        📊 Overview
                    </button>
                    <button
                        onClick={() => setCurrentView('projects')}
                        className={`px-6 py-3 font-bold uppercase text-sm border-2 border-black transition-all ${currentView === 'projects'
                            ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        🗂️ All Projects
                    </button>
                    <button
                        onClick={() => setCurrentView('approvals')}
                        className={`px-6 py-3 font-bold uppercase text-sm border-2 border-black transition-all ${currentView === 'approvals'
                            ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        ✅ Approvals
                    </button>
                    <button
                        onClick={() => setCurrentView('calendar')}
                        className={`px-6 py-3 font-bold uppercase text-sm border-2 border-black transition-all ${currentView === 'calendar'
                            ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-slate-900 hover:bg-slate-100'
                            }`}
                    >
                        📅 Calendar
                    </button>
                </div>

                {/* Overview Stats */}
                {currentView === 'overview' && (
                    <div>
                        <h3 className="text-xl font-black uppercase mb-6">📈 Quick Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-amber-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="w-8 h-8 text-black" />
                                    <span className="text-4xl font-black text-black">{stats.pending}</span>
                                </div>
                                <p className="text-black font-bold uppercase text-sm">Pending Review</p>
                            </div>

                            <div className="bg-green-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between mb-2">
                                    <CheckCircle className="w-8 h-8 text-black" />
                                    <span className="text-4xl font-black text-black">{stats.approved}</span>
                                </div>
                                <p className="text-black font-bold uppercase text-sm">Approved Today</p>
                            </div>

                            <div className="bg-blue-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="w-8 h-8 text-black" />
                                    <span className="text-4xl font-black text-black">{stats.inProduction}</span>
                                </div>
                                <p className="text-black font-bold uppercase text-sm">In Production</p>
                            </div>

                            <div className="bg-purple-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center justify-between mb-2">
                                    <BarChart3 className="w-8 h-8 text-black" />
                                    <span className="text-4xl font-black text-black">{stats.posted}</span>
                                </div>
                                <p className="text-black font-bold uppercase text-sm">Posted This Week</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <h3 className="text-xl font-black uppercase mb-6">🔔 Recent Activity</h3>
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="space-y-4">
                                {projects.slice(0, 5).map((project) => (
                                    <div key={project.id} className="flex items-center justify-between border-b border-slate-200 pb-4 last:border-0">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{project.title}</h4>
                                            <p className="text-sm text-slate-600">
                                                {project.channel} • {project.current_stage}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold uppercase ${project.status === 'DONE' ? 'bg-green-200 text-green-800' :
                                            project.status === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-800' :
                                                project.status === 'WAITING_APPROVAL' ? 'bg-amber-200 text-amber-800' :
                                                    'bg-slate-200 text-slate-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Views */}
                {currentView !== 'overview' && (
                    <div className="bg-white border-2 border-black p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                        <div className="text-6xl mb-4">{
                            currentView === 'projects' ? '🗂️' :
                                currentView === 'approvals' ? '✅' :
                                    '📅'
                        }</div>
                        <h3 className="text-2xl font-black uppercase mb-2">
                            {currentView === 'projects' ? 'All Projects View' :
                                currentView === 'approvals' ? 'Approval History' :
                                    'Publishing Calendar'}
                        </h3>
                        <p className="text-slate-600 mb-6">Coming soon in next update...</p>
                        <p className="text-sm text-slate-500">This view will show detailed {currentView === 'projects' ? 'project list' : currentView === 'approvals' ? 'approval history' : 'content calendar'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ObserverDashboard;
