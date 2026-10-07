import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Star, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Loading';
import { MessageCard } from '@/components/MessageCard';
import { fetchMessages, toggleMessageStar } from '@/lib/services';
import { PLATFORMS, STATUSES, getPlatformMeta, getStatusMeta } from '@/lib/constants';
import type { Message, Platform, MessageStatus } from '@/types';

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [starredOnly, setStarredOnly] = useState(false);

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
    return messages.filter((m) => {
      if (platform !== 'all' && m.platform !== platform) return false;
      if (status !== 'all' && m.status !== status) return false;
      if (starredOnly && !m.is_starred) return false;
      return true;
    });
  }, [messages, platform, status, starredOnly]);

  const handleStar = async (id: string, current: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_starred: !current } : m)));
    await toggleMessageStar(id, !current);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {messages.length} messages</p>
        </div>
        <Link to="/messages/new">
          <Button><Plus size={16} /> Add Message</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={16} />
          <span>Filter:</span>
        </div>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="!w-auto !py-2">
          <option value="all">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-auto !py-2">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <Button
          variant={starredOnly ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStarredOnly(!starredOnly)}
        >
          <Star size={14} className={starredOnly ? 'fill-current' : ''} /> Starred
        </Button>
      </div>

      {loading ? (
        <InlineLoader text="Loading messages..." />
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Inbox size={28} />}
              title="No messages found"
              description={messages.length === 0 ? "Add your first message to start tracking" : "Try adjusting your filters"}
              action={messages.length === 0 ? <Link to="/messages/new"><Button size="sm"><Plus size={14} /> Add Message</Button></Link> : undefined}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((m) => (
            <div key={m.id} className="relative group">
              <Link to={`/messages/${m.id}`}>
                <MessageCard message={m} showStar={false} />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleStar(m.id, m.is_starred);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
              >
                <Star
                  size={16}
                  className={m.is_starred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
