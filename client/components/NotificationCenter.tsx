import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  MessageSquare,
  Handshake,
  Clock,
  AlertTriangle,
  Check,
  Eye,
} from "lucide-react";
import {
  ProposalService,
  ProposalNotification,
} from "@/services/proposalService";
import { MessageService } from "@/services/messageService";
import { BlockService } from "@/services/blockService";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ProposalNotification[]>(
    [],
  );
  const [isOpen, setIsOpen] = useState(false);
  const myBusinessId = user ? `biz_${user.id}` : "";

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const all = await ProposalService.notifications(user.id);
      const filtered = all.filter((notification) => {
        if (notification.type === "message" && notification.actionUrl) {
          try {
            const url = new URL(notification.actionUrl, window.location.origin);
            const open = url.searchParams.get("open");
            if (open) {
              const conv = MessageService.getConversationById(open);
              if (conv) {
                const otherBiz = conv.participants.find(
                  (p) => p !== myBusinessId,
                );
                if (
                  otherBiz &&
                  BlockService.isBlocked(myBusinessId, otherBiz)
                ) {
                  return false;
                }
              }
            }
          } catch {}
        }
        return true;
      });
      setNotifications(filtered);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      await ProposalService.markNotificationRead(user.id, notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.isRead)
          .map((n) => ProposalService.markNotificationRead(user.id, n.id)),
      );
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: ProposalNotification["type"]) => {
    switch (type) {
      case "new_proposal":
        return <Handshake className="h-4 w-4 text-blue-500" />;
      case "status_change":
        return <Check className="h-4 w-4 text-green-500" />;
      case "negotiation_update":
        return <Handshake className="h-4 w-4 text-purple-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - notificationTime.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0"
                onSelect={() => setIsOpen(false)}
              >
                <Link
                  to={notification.actionUrl || "/proposals"}
                  className="w-full p-3 block hover:bg-gray-50"
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`text-sm font-medium truncate ${
                            notification.isRead
                              ? "text-gray-900"
                              : "text-gray-900 font-semibold"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/proposals"
                className="text-center text-sm text-blue-600 hover:text-blue-700"
                onClick={() => setIsOpen(false)}
              >
                View all proposals
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
