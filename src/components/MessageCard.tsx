import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Instagram, Send, MessageCircle, Star } from 'lucide-react';
import type { Message } from '@/types';
import { getPlatformMeta, getPriorityMeta, getStatusMeta } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import { formatRelative, truncate, initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const platformIcons: Record<string, typeof MessageSquare> = {
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Instagram,
  email: Mail,
  wechat: MessageSquare,
  other: MessageSquare,
};

export function PlatformIcon({ platform, size = 18 }: { platform: string; size?: number }) {
  const Icon = platformIcons[platform] ?? MessageSquare;
  const meta = getPlatformMeta(platform);
  return <Icon size={size} style={{ color: meta.color }} />;
}

interface MessageCardProps {
  message: Message;
  onClick?: () => void;
  showStar?: boolean;
}

export function MessageCard({ message, onClick, showStar = true }: MessageCardProps) {
  const platformMeta = getPlatformMeta(message.platform);
  const priorityMeta = getPriorityMeta(message.priority);
  const statusMeta = getStatusMeta(message.status);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white rounded-xl border border-gray-100 p-4 transition-all duration-200',
        'hover:shadow-md hover:border-gray-200 cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: platformMeta.color }}
        >
          {initials(message.sender)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{message.sender}</h4>
              {showStar && message.is_starred && (
                <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">{formatRelative(message.message_date)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{truncate(message.content, 120)}</p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <PlatformIcon platform={message.platform} size={14} />
              {platformMeta.label}
            </span>
            <Badge color={priorityMeta.color} bg={priorityMeta.bg}>{priorityMeta.label}</Badge>
            <Badge color={statusMeta.color} bg={statusMeta.bg}>{statusMeta.label}</Badge>
            <span className="text-xs text-gray-400">{message.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageListItem({ message }: { message: Message }) {
  return (
    <Link to={`/messages/${message.id}`} className="block">
      <MessageCard message={message} />
    </Link>
  );
}
