import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Loading';
import { MessageCard } from '@/components/MessageCard';
import { fetchMessages } from '@/lib/services';
import { PLATFORMS, PRIORITIES, CATEGORIES, STATUSES } from '@/lib/constants';
import type { Message } from '@/types';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [platform, setPlatform] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return messages.filter((m) => {
      if (q) {
        const matches =
          m.sender.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.sender_contact?.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (platform !== 'all' && m.platform !== platform) return false;
      if (priority !== 'all' && m.priority !== priority) return false;
      if (status !== 'all' && m.status !== status) return false;
      if (category !== 'all' && m.category !== category) return false;
      return true;
    });
  }, [messages, query, platform, priority, status, category]);

  const hasFilters = platform !== 'all' || priority !== 'all' || status !== 'all' || category !== 'all' || query !== '';

  const clearFilters = () => {
    setQuery('');
    setPlatform('all');
    setPriority('all');
    setStatus('all');
    setCategory('all');
  };

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading search..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search & Filter</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find messages across all your platforms</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by sender, content, contact, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={16} />
        </div>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="!w-auto !py-2">
          <option value="all">All Platforms</option>
          {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="!w-auto !py-2">
          <option value="all">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-auto !py-2">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="!w-auto !py-2">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<Inbox size={28} />} title="No messages found" description={hasFilters ? "Try adjusting your search or filters" : "Start by adding a message"} />
        </CardBody></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((m) => (
            <Link key={m.id} to={`/messages/${m.id}`}>
              <MessageCard message={m} />
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
