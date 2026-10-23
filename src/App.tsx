import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  Download,
  Check,
  X,
  ArrowUpDown,
  FolderGit2,
  Globe,
  Star,
} from 'lucide-react';

export interface AppEntry {
  id: string;
  name: string;
  category: 'Internal Tool' | 'Customer Facing' | 'Data Service' | 'Developer Platform' | 'Mobile App';
  environment: 'Production' | 'Staging' | 'Development';
  status: 'Active' | 'Maintenance' | 'Deprecated';
  owner: string;
  url: string;
  repository: string;
  version: string;
  updatedAt: string;
  starred: boolean;
  description: string;
}

const INITIAL_APPS: AppEntry[] = [
  {
    id: 'app-101',
    name: 'Atlas Billing Portal',
    category: 'Customer Facing',
    environment: 'Production',
    status: 'Active',
    owner: 'FinOps Team',
    url: 'https://billing.internal.example.com',
    repository: 'org/atlas-billing-web',
    version: '2.14.0',
    updatedAt: '2026-10-21',
    starred: true,
    description: 'Self-serve invoice management, subscription tier adjustments, and tax compliance ledger.',
  },
  {
    id: 'app-102',
    name: 'Pulse Telemetry Collector',
    category: 'Data Service',
    environment: 'Production',
    status: 'Active',
    owner: 'Platform Reliability',
    url: 'https://pulse-ingest.internal.example.com',
    repository: 'org/pulse-collector',
    version: '4.2.1',
    updatedAt: '2026-10-22',
    starred: true,
    description: 'High-throughput event ingestion service normalizing structured application logs across regions.',
  },
  {
    id: 'app-103',
    name: 'Harbor Release Manager',
    category: 'Developer Platform',
    environment: 'Production',
    status: 'Active',
    owner: 'Release Engineering',
    url: 'https://harbor.internal.example.com',
    repository: 'org/harbor-deploy',
    version: '1.9.4',
    updatedAt: '2026-10-19',
    starred: false,
    description: 'Automated canary rollout coordinator and environment promotion dashboard for web microservices.',
  },
  {
    id: 'app-104',
    name: 'Vanguard Inventory Desk',
    category: 'Internal Tool',
    environment: 'Staging',
    status: 'Maintenance',
    owner: 'Supply Chain Ops',
    url: 'https://staging-inventory.internal.example.com',
    repository: 'org/vanguard-desk',
    version: '3.0.0-rc2',
    updatedAt: '2026-10-18',
    starred: false,
    description: 'Warehouse SKU reconciliation, supplier order scheduling, and regional fulfillment routing.',
  },
  {
    id: 'app-105',
    name: 'Courier Field Companion',
    category: 'Mobile App',
    environment: 'Production',
    status: 'Active',
    owner: 'Last-Mile Mobility',
    url: 'https://courier.internal.example.com',
    repository: 'org/courier-pwa',
    version: '5.1.0',
    updatedAt: '2026-10-23',
    starred: true,
    description: 'Offline-capable route manifest and proof-of-delivery capture application for field couriers.',
  },
  {
    id: 'app-106',
    name: 'Legacy CRM Bridge',
    category: 'Data Service',
    environment: 'Development',
    status: 'Deprecated',
    owner: 'Core Integrations',
    url: 'https://crm-bridge.internal.example.com',
    repository: 'org/legacy-crm-sync',
    version: '0.8.9',
    updatedAt: '2026-09-30',
    starred: false,
    description: 'Nightly batch adapter syncing customer contact records to archival storage.',
  },
];

const CATEGORIES: AppEntry['category'][] = [
  'Internal Tool',
  'Customer Facing',
  'Data Service',
  'Developer Platform',
  'Mobile App',
];

const ENVIRONMENTS: AppEntry['environment'][] = ['Production', 'Staging', 'Development'];
const STATUSES: AppEntry['status'][] = ['Active', 'Maintenance', 'Deprecated'];

export default function App() {
  const [apps, setApps] = useState<AppEntry[]>(() => {
    try {
      const saved = localStorage.getItem('app_list_registry_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_APPS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'updatedAt' | 'category'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppEntry | null>(null);
  const [selectedApp, setSelectedApp] = useState<AppEntry | null>(null);

  const [formState, setFormState] = useState<Omit<AppEntry, 'id' | 'updatedAt'>>({
    name: '',
    category: 'Internal Tool',
    environment: 'Production',
    status: 'Active',
    owner: '',
    url: '',
    repository: '',
    version: '1.0.0',
    starred: false,
    description: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_list_registry_v1', JSON.stringify(apps));
    } catch {
      // ignore storage errors
    }
  }, [apps]);

  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        if (onlyStarred && !app.starred) return false;
        if (selectedCategory !== 'All' && app.category !== selectedCategory) return false;
        if (selectedStatus !== 'All' && app.status !== selectedStatus) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            app.name.toLowerCase().includes(q) ||
            app.owner.toLowerCase().includes(q) ||
            app.repository.toLowerCase().includes(q) ||
            app.description.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField].toLowerCase();
        const valB = b[sortField].toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [apps, searchQuery, selectedCategory, selectedStatus, onlyStarred, sortField, sortAsc]);

  const stats = useMemo(() => {
    const total = apps.length;
    const active = apps.filter((a) => a.status === 'Active').length;
    const prod = apps.filter((a) => a.environment === 'Production').length;
    const starred = apps.filter((a) => a.starred).length;
    return { total, active, prod, starred };
  }, [apps]);

  const handleOpenCreate = () => {
    setEditingApp(null);
    setFormState({
      name: '',
      category: 'Internal Tool',
      environment: 'Production',
      status: 'Active',
      owner: '',
      url: 'https://',
      repository: 'org/',
      version: '1.0.0',
      starred: false,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app: AppEntry) => {
    setEditingApp(app);
    setFormState({
      name: app.name,
      category: app.category,
      environment: app.environment,
      status: app.status,
      owner: app.owner,
      url: app.url,
      repository: app.repository,
      version: app.version,
      starred: app.starred,
      description: app.description,
    });
    setIsModalOpen(true);
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    if (editingApp) {
      const updated: AppEntry = {
        ...editingApp,
        ...formState,
        updatedAt: today,
      };
      setApps((prev) => prev.map((item) => (item.id === editingApp.id ? updated : item)));
      if (selectedApp?.id === editingApp.id) {
        setSelectedApp(updated);
      }
    } else {
      const newEntry: AppEntry = {
        ...formState,
        id: `app-${Date.now().toString().slice(-5)}`,
        updatedAt: today,
      };
      setApps((prev) => [newEntry, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteApp = (id: string) => {
    setApps((prev) => prev.filter((item) => item.id !== id));
    if (selectedApp?.id === id) {
      setSelectedApp(null);
    }
  };

  const handleToggleStar = (id: string) => {
    setApps((prev) =>
      prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    );
    if (selectedApp?.id === id) {
      setSelectedApp((prev) => (prev ? { ...prev, starred: !prev.starred } : null));
    }
  };

  const handleSort = (field: 'name' | 'updatedAt' | 'category') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Environment', 'Status', 'Owner', 'Version', 'URL', 'Repository', 'Updated'];
    const rows = filteredApps.map((a) => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      a.environment,
      a.status,
      `"${a.owner.replace(/"/g, '""')}"`,
      a.version,
      a.url,
      a.repository,
      a.updatedAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `app-list-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setOnlyStarred(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleResetFilters();
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          app_list
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setOnlyStarred(false);
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All' && !onlyStarred ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            All Applications
          </button>
          <button
            type="button"
            onClick={() => {
              setOnlyStarred(true);
              setSelectedCategory('All');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              onlyStarred ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Bookmarked
          </button>
          <button
            type="button"
            onClick={() => {
              setOnlyStarred(false);
              setSelectedCategory('Customer Facing');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'Customer Facing' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Customer Facing
          </button>
          <button
            type="button"
            onClick={() => {
              setOnlyStarred(false);
              setSelectedCategory('Developer Platform');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'Developer Platform' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Platform Tools
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Application
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8">
        {/* Page Header & Summary Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              Workspace Directory · Service Catalog
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Application Registry
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Centralized inventory of production services, internal operational tools, and deployment endpoints across engineering teams.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200">
            <div>
              <div className="text-xs text-slate-500">Total Registered</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {stats.total}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Active Services</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-700">
                {stats.active}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Production Env</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {stats.prod}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Bookmarked</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {stats.starred}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="py-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by app name, owner, repository, or description..."
                className="w-full pl-10 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Selector */}
            <select
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-900"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Segmented Status Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
              {(['All', ...STATUSES] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Main Workspace Split: Data Grid + Optional Inspector Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={selectedApp ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {filteredApps.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <p className="text-base font-semibold text-slate-900">
                    No matching applications found
                  </p>
                  <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                    No applications match your current search or filter criteria. Clear filters or register a new service entry.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Register Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                        <th className="py-3 pl-4 pr-2 w-10">
                          <span className="sr-only">Bookmark</span>
                        </th>
                        <th className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleSort('name')}
                            className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                          >
                            Application
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </button>
                        </th>
                        <th className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleSort('category')}
                            className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                          >
                            Category & Env
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </button>
                        </th>
                        <th className="py-3 px-3">Owner</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Version</th>
                        <th className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSort('updatedAt')}
                            className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer whitespace-nowrap ml-auto"
                          >
                            Updated
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </button>
                        </th>
                        <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredApps.map((app) => {
                        const isSelected = selectedApp?.id === app.id;
                        return (
                          <tr
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={`transition-colors cursor-pointer ${
                              isSelected ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td
                              className="py-3 pl-4 pr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(app.id);
                              }}
                            >
                              <button
                                type="button"
                                aria-label={app.starred ? 'Remove bookmark' : 'Bookmark application'}
                                className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    app.starred ? 'fill-amber-400 text-amber-500' : ''
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900">{app.name}</div>
                              <div className="text-xs text-slate-500 truncate max-w-xs">
                                {app.description}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                              <span>{app.category}</span>
                              <span aria-hidden="true" className="mx-1.5 text-slate-300">
                                ·
                              </span>
                              <span className="text-slate-500">{app.environment}</span>
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-700 whitespace-nowrap">
                              {app.owner}
                            </td>
                            <td className="py-3 px-3 text-xs whitespace-nowrap">
                              <span
                                className={`font-medium ${
                                  app.status === 'Active'
                                    ? 'text-emerald-700'
                                    : app.status === 'Maintenance'
                                    ? 'text-amber-700'
                                    : 'text-red-700'
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs font-mono tabular-nums text-slate-600 text-right whitespace-nowrap">
                              v{app.version}
                            </td>
                            <td className="py-3 px-3 text-xs font-mono tabular-nums text-slate-500 text-right whitespace-nowrap">
                              {app.updatedAt}
                            </td>
                            <td
                              className="py-3 pl-3 pr-4 text-right whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center justify-end gap-1">
                                <a
                                  href={app.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open application endpoint"
                                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(app)}
                                  title="Edit application"
                                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteApp(app.id)}
                                  title="Delete application"
                                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Detail Inspector Panel */}
          {selectedApp && (
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    {selectedApp.id} · v{selectedApp.version}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    {selectedApp.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  aria-label="Close inspector"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-sm">
                <div>
                  <div className="text-xs font-medium text-slate-500">Description</div>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {selectedApp.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="mt-0.5 font-medium text-slate-900">
                      {selectedApp.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Environment</div>
                    <div className="mt-0.5 font-medium text-slate-900">
                      {selectedApp.environment}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Operational Status</div>
                    <div
                      className={`mt-0.5 font-medium ${
                        selectedApp.status === 'Active'
                          ? 'text-emerald-700'
                          : selectedApp.status === 'Maintenance'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {selectedApp.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Maintaining Team</div>
                    <div className="mt-0.5 font-medium text-slate-900">
                      {selectedApp.owner}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div>
                    <div className="text-xs text-slate-500">Deployment URL</div>
                    <a
                      href={selectedApp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-mono text-slate-900 hover:underline break-all"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {selectedApp.url}
                    </a>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Source Repository</div>
                    <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-mono text-slate-700">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {selectedApp.repository}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Last Updated</div>
                    <div className="mt-0.5 text-xs font-mono tabular-nums text-slate-700">
                      {selectedApp.updatedAt}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedApp)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Entry
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteApp(selectedApp.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>app_list — Internal Application Directory & Service Registry</div>
          <div className="font-mono tabular-nums">
            Showing {filteredApps.length} of {apps.length} registered services
          </div>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingApp ? 'Edit Application' : 'Register New Application'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="e.g. Atlas Billing Portal"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as AppEntry['category'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Environment
                  </label>
                  <select
                    value={formState.environment}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        environment: e.target.value as AppEntry['environment'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
                  >
                    {ENVIRONMENTS.map((env) => (
                      <option key={env} value={env}>
                        {env}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.value as AppEntry['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Release Version
                  </label>
                  <input
                    type="text"
                    value={formState.version}
                    onChange={(e) => setFormState({ ...formState, version: e.target.value })}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Owner / Team *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.owner}
                    onChange={(e) => setFormState({ ...formState, owner: e.target.value })}
                    placeholder="e.g. Core Platform"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repository
                  </label>
                  <input
                    type="text"
                    value={formState.repository}
                    onChange={(e) =>
                      setFormState({ ...formState, repository: e.target.value })
                    }
                    placeholder="org/repo-name"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formState.url}
                    onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                    placeholder="https://service.internal.example.com"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({ ...formState, description: e.target.value })
                    }
                    placeholder="Brief summary of the application's purpose and primary users..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
