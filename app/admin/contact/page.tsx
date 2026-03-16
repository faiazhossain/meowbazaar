"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Clock,
  Eye,
  Trash2,
  Loader2,
  Inbox,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from "@/lib/actions/contact";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: Date;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-500",
  READ: "bg-amber-500/10 text-amber-500",
  REPLIED: "bg-green-500/10 text-green-500",
  RESOLVED: "bg-success/10 text-success",
};

const statusLabels: Record<string, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  RESOLVED: "Resolved",
};

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await getContactMessages(filter || undefined);
      setMessages(data as ContactMessage[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      const result = await updateContactMessageStatus(id, status);
      if (result.success) {
        toast.success("Status updated");
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const result = await deleteContactMessage(id);
      if (result.success) {
        toast.success("Message deleted");
        setMessages(messages.filter((m) => m.id !== id));
        setSelectedMessage(null);
      } else {
        toast.error(result.error || "Failed to delete message");
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: messages.length,
    new: messages.filter((m) => m.status === "NEW").length,
    read: messages.filter((m) => m.status === "READ").length,
    resolved: messages.filter((m) => m.status === "RESOLVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Contact Messages
          </h1>
          <p className="text-muted-foreground">
            Manage customer inquiries and support requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "bg-card rounded-lg p-4 border border-border text-left transition-colors",
            !filter && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.total}
          </p>
        </button>
        <button
          onClick={() => setFilter("NEW")}
          className={cn(
            "bg-card rounded-lg p-4 border border-border text-left transition-colors",
            filter === "NEW" && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">New</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.new}</p>
        </button>
        <button
          onClick={() => setFilter("READ")}
          className={cn(
            "bg-card rounded-lg p-4 border border-border text-left transition-colors",
            filter === "READ" && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">Read</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.read}
          </p>
        </button>
        <button
          onClick={() => setFilter("RESOLVED")}
          className={cn(
            "bg-card rounded-lg p-4 border border-border text-left transition-colors",
            filter === "RESOLVED" && "border-primary bg-primary/5"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {stats.resolved}
          </p>
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">
                  Sender
                </th>
                <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">
                  Subject
                </th>
                <th className="text-center p-4 font-medium text-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-foreground hidden lg:table-cell">
                  Date
                </th>
                <th className="text-center p-4 font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr
                  key={message.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {message.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {message.email}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-foreground line-clamp-1">
                      {message.subject || "No subject"}
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      className={cn(
                        "text-xs",
                        statusColors[message.status] || statusColors.NEW
                      )}
                    >
                      {statusLabels[message.status] || message.status}
                    </Badge>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(message.createdAt)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedMessage(message)}
                        title="View message"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(message.id)}
                        className="text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              {/* Sender Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {selectedMessage.name}
                  </span>
                  <Badge
                    className={cn(
                      "text-xs",
                      statusColors[selectedMessage.status] || statusColors.NEW
                    )}
                  >
                    {statusLabels[selectedMessage.status] ||
                      selectedMessage.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedMessage.email}
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedMessage.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Subject
                  </p>
                  <p className="text-foreground">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Message
                </p>
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Date */}
              <p className="text-xs text-muted-foreground">
                Received: {formatDate(selectedMessage.createdAt)}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {selectedMessage.status === "NEW" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMessage.id, "READ")
                    }
                    disabled={isUpdating}
                  >
                    Mark as Read
                  </Button>
                )}
                {selectedMessage.status === "READ" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleStatusUpdate(selectedMessage.id, "REPLIED")
                    }
                    disabled={isUpdating}
                  >
                    Mark as Replied
                  </Button>
                )}
                {(selectedMessage.status === "READ" ||
                  selectedMessage.status === "REPLIED") && (
                  <Button
                    size="sm"
                    className="bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() =>
                      handleStatusUpdate(selectedMessage.id, "RESOLVED")
                    }
                    disabled={isUpdating}
                  >
                    Mark as Resolved
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.open(`mailto:${selectedMessage.email}`);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply via Email
                </Button>
                {selectedMessage.phone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.open(`tel:${selectedMessage.phone}`);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
