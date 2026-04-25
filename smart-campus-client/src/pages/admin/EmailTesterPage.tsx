import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  Mail,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Send,
  Ticket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// ─── Email type definitions ────────────────────────────────────────────────
type EmailType = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultSubject: string;
  defaultMessage: string;
  badgeColor: string;
};

const EMAIL_TYPES: EmailType[] = [
  {
    id: "VERIFICATION",
    label: "Verification Email",
    description: "Account verification with logo and expiration notice",
    icon: <CheckCircle className="h-5 w-5 text-[#10b981]" />,
    defaultSubject: "Verify your HelaUni account",
    defaultMessage:
      "Please verify your email address to activate your HelaUni account. This link will expire in 24 hours.",
    badgeColor: "bg-[#d1fae5] text-[#065f46]",
  },
  {
    id: "TICKET_CONFIRMATION",
    label: "Ticket Confirmation",
    description: "Support ticket creation confirmation",
    icon: <Ticket className="h-5 w-5 text-[#5e6ad2]" />,
    defaultSubject: "Your support ticket has been received",
    defaultMessage:
      "We have received your support request. Our team will review it and get back to you within 24 hours.",
    badgeColor: "bg-[#ede9fe] text-[#5b21b6]",
  },
  {
    id: "PROMOTIONAL",
    label: "Promotional Email",
    description: "Marketing email with discount offers",
    icon: <Megaphone className="h-5 w-5 text-[#f59e0b]" />,
    defaultSubject: "Exclusive offer just for you!",
    defaultMessage:
      "🎉 You're invited! Explore the latest features of HelaUni — your all-in-one smart campus platform. Get started today.",
    badgeColor: "bg-[#fef3c7] text-[#92400e]",
  },
  {
    id: "JOIN_US",
    label: "Join Us Email",
    description: "Community invitation and benefits",
    icon: <Users className="h-5 w-5 text-[#7170ff]" />,
    defaultSubject: "You're invited to join HelaUni",
    defaultMessage:
      "Join thousands of students and staff already using HelaUni to manage bookings, tickets, and campus resources seamlessly.",
    badgeColor: "bg-[#ede9fe] text-[#4c1d95]",
  },
  {
    id: "UPDATE",
    label: "System Update",
    description: "Platform update and maintenance notices",
    icon: <RefreshCw className="h-5 w-5 text-[#3b82f6]" />,
    defaultSubject: "HelaUni platform update",
    defaultMessage:
      "We have released a new update to the HelaUni platform. Improvements include faster booking confirmations and enhanced security.",
    badgeColor: "bg-[#dbeafe] text-[#1e40af]",
  },
  {
    id: "CUSTOM",
    label: "Custom Email",
    description: "Fully customizable email content",
    icon: <MessageSquare className="h-5 w-5 text-[#8a8f98]" />,
    defaultSubject: "",
    defaultMessage: "",
    badgeColor: "bg-[#f3f4f5] text-[#43464b]",
  },
];

// ─── Component ────────────────────────────────────────────────────────────
export function EmailTesterPage() {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<EmailType>(EMAIL_TYPES[0]);
  const [formData, setFormData] = useState({
    to: "",
    name: "",
    subject: EMAIL_TYPES[0].defaultSubject,
    message: EMAIL_TYPES[0].defaultMessage,
  });

  const handleTypeSelect = (emailType: EmailType) => {
    setSelectedType(emailType);
    setFormData((prev) => ({
      ...prev,
      subject: emailType.defaultSubject,
      message: emailType.defaultMessage,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to) {
      toast.error("Recipient email is required");
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
      const response = await fetch(`${API_BASE_URL}/api/emailTester`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify({
          to: formData.to,
          type: selectedType.id,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`${selectedType.label} sent to ${formData.to}`);
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch {
      toast.error("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8]">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5e6ad2]/10">
              <Mail className="h-4 w-4 text-[#5e6ad2]" />
            </div>
            <span className="text-xs font-[510] uppercase tracking-[0.18em] text-[#5e6ad2]">
              HelaUni · Email Tools
            </span>
          </div>
          <h1 className="text-[2rem] font-[590] tracking-[-0.044em] text-[#191a1b]">
            Email Tester
          </h1>
          <p className="text-[15px] font-[400] text-[#62666d]">
            Test different types of emails with professional templates
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* ── Left: Email Types Grid ──────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <h2 className="text-[13px] font-[590] uppercase tracking-[0.12em] text-[#8a8f98]">
                Email Types Available
              </h2>
              <p className="mt-0.5 text-[13px] text-[#8a8f98]">
                Overview of different email templates
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {EMAIL_TYPES.map((emailType) => {
                const isSelected = selectedType.id === emailType.id;
                return (
                  <button
                    key={emailType.id}
                    type="button"
                    onClick={() => handleTypeSelect(emailType)}
                    className={[
                      "group relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-150",
                      isSelected
                        ? "border-[#5e6ad2] bg-[#ffffff] shadow-[0_0_0_3px_rgba(94,106,210,0.12)]"
                        : "border-[#e2e6eb] bg-[#ffffff] hover:border-[#c5cad4] hover:shadow-sm",
                    ].join(" ")}
                  >
                    {/* Selection dot */}
                    <div
                      className={[
                        "absolute right-3 top-3 h-2.5 w-2.5 rounded-full transition-all",
                        isSelected ? "bg-[#5e6ad2]" : "bg-transparent border border-[#d0d6e0]",
                      ].join(" ")}
                    />

                    <div className="flex items-start gap-3">
                      <div
                        className={[
                          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isSelected
                            ? "border-[#5e6ad2]/20 bg-[#5e6ad2]/8"
                            : "border-[#e2e6eb] bg-[#f7f8f8]",
                        ].join(" ")}
                      >
                        {emailType.icon}
                      </div>
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-[13px] font-[590] text-[#191a1b]">
                          {emailType.label}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-[1.5] text-[#8a8f98]">
                          {emailType.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right: Send Form ────────────────────────────────────── */}
          <div className="space-y-4">
            <Card className="border-[#e2e6eb] bg-[#ffffff] shadow-sm">
              <CardHeader className="border-b border-[#e2e6eb] bg-[#f7f8f8] pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2e6eb] bg-[#ffffff]">
                    <Send className="h-3.5 w-3.5 text-[#5e6ad2]" />
                  </div>
                  <CardTitle className="text-[15px] font-[590] text-[#191a1b]">
                    Send Test Email
                  </CardTitle>
                </div>
                <CardDescription className="mt-1.5 text-[13px] leading-[1.6] text-[#62666d]">
                  Select an email type and enter the recipient details to send a test email
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-5">
                {/* Selected type indicator */}
                <div className="flex items-center gap-2 rounded-lg border border-[#e2e6eb] bg-[#f7f8f8] px-3 py-2.5">
                  {selectedType.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-[510] text-[#43464b]">Selected Type</p>
                    <p className="text-[13px] font-[590] text-[#191a1b]">{selectedType.label}</p>
                  </div>
                </div>

                <Separator className="bg-[#e2e6eb]" />

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Recipient Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="to" className="text-[13px] font-[510] text-[#191a1b]">
                      Recipient Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="student@university.edu"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="h-9 border-[#d0d6e0] bg-[#f7f8f8] text-[13px] text-[#191a1b] placeholder:text-[#8a8f98] focus-visible:ring-[#5e6ad2]"
                      required
                    />
                  </div>

                  {/* Recipient Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[13px] font-[510] text-[#191a1b]">
                      Recipient Name{" "}
                      <span className="text-[11px] font-[400] text-[#8a8f98]">(optional)</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-9 border-[#d0d6e0] bg-[#f7f8f8] text-[13px] text-[#191a1b] placeholder:text-[#8a8f98] focus-visible:ring-[#5e6ad2]"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-[13px] font-[510] text-[#191a1b]">
                      Subject{" "}
                      <span className="text-[11px] font-[400] text-[#8a8f98]">(optional)</span>
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Email subject line"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-9 border-[#d0d6e0] bg-[#f7f8f8] text-[13px] text-[#191a1b] placeholder:text-[#8a8f98] focus-visible:ring-[#5e6ad2]"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-[13px] font-[510] text-[#191a1b]">
                      Message{" "}
                      <span className="text-[11px] font-[400] text-[#8a8f98]">(optional)</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message content..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="min-h-[100px] border-[#d0d6e0] bg-[#f7f8f8] text-[13px] text-[#191a1b] placeholder:text-[#8a8f98] focus-visible:ring-[#5e6ad2]"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-9 w-full bg-[#5e6ad2] text-[13px] font-[510] text-white hover:bg-[#828fff] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" />
                        Send Test Email
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer note */}
            <p className="text-center text-[11px] text-[#8a8f98]">
              Emails are sent from{" "}
              <span className="font-[510] text-[#5e6ad2]">no-reply@helauni.app</span> via Resend
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
