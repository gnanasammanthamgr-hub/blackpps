import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Trash2, Edit2, CheckCircle, Clock, AlertCircle,
  Calendar, Bell, MessageSquare, User, Tag,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { InlineLoader } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlatformIcon } from '@/components/MessageCard';
import { fetchMessage, deleteMessage, updateMessageStatus, toggleMessageStar } from '@/lib/services';
import { getPlatformMeta, getPriorityMeta, getStatusMeta } from '@/lib/constants';
import { formatDate, formatRelative, initials } from '@/lib/utils';
import type { Message } from '@/types';

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const data = await fetchMessage(id);
        setMessage(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <DashboardLayout><InlineLoader text="Loading message..." /></DashboardLayout>;
  }

  if (!message) {
    return (
      <DashboardLayout>
        <Card>
          <CardBody>
            <EmptyState title="Message not found" description="This message may have been deleted" />
          </CardBody>
        </Card>
      </DashboardLayout>
    );
  }

  const platformMeta = getPlatformMeta(message.platform);
  const priorityMeta = getPriorityMeta(message.priority);
  const statusMeta = getStatusMeta(message.status);

  const handleDelete = async () => {
    await deleteMessage(message.id);
    navigate('/messages');
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateMessageStatus(message.id, newStatus);
    setMessage({ ...message, status: newStatus as Message['status'] });
  };

  const handleStar = async () => {
    await toggleMessageStar(message.id, !message.is_starred);
    setMessage({ ...message, is_starred: !message.is_starred });
  };

  return (
    <DashboardLayout>
      {/* Back */}
      <Link to="/messages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Messages
      </Link>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardBody>
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shrink-0"
                  style={{ backgroundColor: platformMeta.color }}
                >
                  {initials(message.sender)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">{message.sender}</h1>
                    <button onClick={handleStar} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <Star size={18} className={message.is_starred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                    </button>
                  </div>
                  {message.sender_contact && (
                    <p className="text-sm text-gray-500 mt-0.5">{message.sender_contact}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <PlatformIcon platform={message.platform} size={14} /> {platformMeta.label}
                    </span>
                    <Badge color={priorityMeta.color} bg={priorityMeta.bg}>{priorityMeta.label}</Badge>
                    <Badge color={statusMeta.color} bg={statusMeta.bg}>{statusMeta.label}</Badge>
                    {message.is_demo && <Badge color="#8b5cf6" bg="#ede9fe">Demo</Badge>}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Notes */}
              {message.notes && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Notes</h4>
                  <p className="text-sm text-gray-600">{message.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-gray-100">
                {message.status !== 'completed' && (
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('completed')}>
                    <CheckCircle size={15} /> Mark Completed
                  </Button>
                )}
                {message.status !== 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusChange('pending')}>
                    <Clock size={15} /> Mark Pending
                  </Button>
                )}
                {message.status !== 'postponed' && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusChange('postponed')}>
                    <AlertCircle size={15} /> Postpone
                  </Button>
                )}
                <Link to={`/messages/${message.id}/edit`}>
                  <Button variant="outline" size="sm"><Edit2 size={15} /> Edit</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
                  <Trash2 size={15} /> Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <DetailRow icon={MessageSquare} label="Platform" value={platformMeta.label} />
              <DetailRow icon={User} label="Sender" value={message.sender} />
              {message.sender_contact && <DetailRow icon={User} label="Contact" value={message.sender_contact} />}
              <DetailRow icon={Tag} label="Category" value={message.category} />
              <DetailRow icon={Calendar} label="Date" value={formatDate(message.message_date, true)} />
              {message.due_date && <DetailRow icon={Calendar} label="Due Date" value={formatDate(message.due_date, true)} />}
              {message.reminder_time && <DetailRow icon={Bell} label="Reminder" value={formatDate(message.reminder_time, true)} />}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardBody className="space-y-3">
              <TimelineItem label="Created" value={formatRelative(message.created_at)} />
              <TimelineItem label="Updated" value={formatRelative(message.updated_at)} />
              {message.due_date && <TimelineItem label="Due" value={formatRelative(message.due_date)} />}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Message">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this message from {message.sender}? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-gray-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
