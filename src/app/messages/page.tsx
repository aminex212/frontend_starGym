"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  MessageCircle,
  Search,
  Phone,
  Users,
  CreditCard,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { apiFetch, resolveApiAsset } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Member = {
  _id: string;
  name: string;
  phone: string;
  age: number;
  disciplines: string[];
  status: "Active" | "Out";
  paymentStatus: "Paid" | "Unpaid";
  paymentAmount?: number;
  insuranceStatus: "Paid" | "Unpaid";
  unpaidCompetitions: string[];
  incompleteCompetitionDocuments: string[];
  photo: string | null;
};

type CompetitionParticipant = {
  member?: { _id: string } | null;
  competition?: { name: string } | null;
  competitionPayment: "Paid" | "Unpaid";
  documentsStatus: "Complete" | "Incomplete";
  incompleteDocuments: string[];
};

type Payment = {
  member?: { _id: string } | null;
  amount: number;
  month: string;
  year: number;
};

export default function MessagesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const [membersResponse, participantsResponse, paymentsResponse] = await Promise.all([
          apiFetch("/api/members"),
          apiFetch("/api/competition-participants"),
          apiFetch("/api/payments"),
        ]);
        const membersData = await membersResponse.json();
        const participantsData = await participantsResponse.json();
        const paymentsData = await paymentsResponse.json();
        const currentMonth = new Date().toLocaleString("en-US", {
          month: "long",
        });
        const paymentAmountByMember = new Map<string, number>();

        if (Array.isArray(paymentsData)) {
          paymentsData.forEach((payment: Payment) => {
            if (
              payment.month === currentMonth &&
              payment.year === new Date().getFullYear() &&
              payment.member?._id &&
              typeof payment.amount === "number"
            ) {
              paymentAmountByMember.set(payment.member._id, payment.amount);
            }
          });
        }

        const unpaidCompetitionsByMember = new Map<string, string[]>();
        const incompleteDocumentsByMember = new Map<string, string[]>();

        if (Array.isArray(participantsData)) {
          participantsData.forEach((participant: CompetitionParticipant) => {
            if (!participant.member?._id) {
              return;
            }

            const memberId = participant.member._id;
            const competitionName =
              participant.competition?.name || "المنافسة";

            if (participant.competitionPayment === "Unpaid") {
              const competitions =
                unpaidCompetitionsByMember.get(memberId) || [];

              if (!competitions.includes(competitionName)) {
                competitions.push(competitionName);
              }

              unpaidCompetitionsByMember.set(memberId, competitions);
            }

            if (participant.documentsStatus !== "Incomplete") {
              return;
            }

            const documents = incompleteDocumentsByMember.get(memberId) || [];

            participant.incompleteDocuments.forEach((document) => {
              const documentDetails = `${competitionName}: ${document}`;

              if (!documents.includes(documentDetails)) {
                documents.push(documentDetails);
              }
            });

            incompleteDocumentsByMember.set(memberId, documents);
          });
        }

        setMembers(
          Array.isArray(membersData)
            ? membersData.map((member) => ({
                ...member,
                paymentAmount: paymentAmountByMember.get(member._id),
                unpaidCompetitions:
                  unpaidCompetitionsByMember.get(member._id) || [],
                incompleteCompetitionDocuments:
                  incompleteDocumentsByMember.get(member._id) || [],
              }))
            : []
        );
      } catch (error) {
        console.error("Failed to load members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const normalizePhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");

    // Moroccan number:
    // 06XXXXXXXX -> 2126XXXXXXXX
    // 07XXXXXXXX -> 2127XXXXXXXX
    if (cleaned.startsWith("0")) {
      cleaned = "212" + cleaned.substring(1);
    }

    // Already starts with Morocco country code
    if (cleaned.startsWith("212")) {
      return cleaned;
    }

    return cleaned;
  };

  const getMessage = (member: Member) => {
    const reminders: string[] = [];
    const documentsByCompetition = new Map<string, string[]>();

    member.incompleteCompetitionDocuments.forEach((documentDetails) => {
      const separatorIndex = documentDetails.indexOf(": ");
      const competitionName =
        separatorIndex >= 0
          ? documentDetails.slice(0, separatorIndex)
          : "المنافسة";
      const documentName =
        separatorIndex >= 0
          ? documentDetails.slice(separatorIndex + 2)
          : documentDetails;
      const documents = documentsByCompetition.get(competitionName) || [];
      const documentLabels: Record<string, string> = {
        Insurance: "وثيقة التأمين",
        "ID Card Copy": "نسخة من بطاقة التعريف الوطنية",
        Photo: "صورة شخصية",
        "Medical Certificate": "شهادة طبية",
      };
      const clearDocumentName =
        documentLabels[documentName] || documentName;

      if (!documents.includes(clearDocumentName)) {
        documents.push(clearDocumentName);
      }

      documentsByCompetition.set(competitionName, documents);
    });

    if (member.paymentStatus === "Unpaid") {
      const paymentAmount =
        member.paymentAmount !== undefined
          ? ` بقيمة ${member.paymentAmount} DH`
          : "";
      reminders.push(`المرجو تسوية واجب الاشتراك${paymentAmount}`);
    }

    if (member.insuranceStatus === "Unpaid") {
      reminders.push("المرجو تسوية واجب التأمين");
    }

    if (member.unpaidCompetitions.length > 0) {
      reminders.push(
        `المرجو تسوية واجب المشاركة في: ${member.unpaidCompetitions.join(
          "، "
        )}`
      );
    }

    documentsByCompetition.forEach((documents, competitionName) => {
      reminders.push(
        `المرجو استكمال الوثائق التالية للمشاركة في ${competitionName}: ${documents.join(
          "، "
        )}`
      );
    });

    if (member.status === "Out") {
      reminders.push(
        "نتواصل معكم للاطمئنان عليكم، والمرجو التواصل معنا إذا كنتم ترغبون في العودة للنادي"
      );
    }

    if (reminders.length === 0) {
      return `السلام عليكم ${member.name}، نتواصل معكم من StarGym Fighting Academy. شكراً.`;
    }

    return `السلام عليكم ${member.name}، نذكركم من StarGym Fighting Academy:

${reminders.join("\n\n")}.

شكراً.`;
  };

  const openWhatsApp = (member: Member) => {
    const phone = normalizePhone(member.phone);

    if (!phone) {
      alert("رقم الهاتف غير صالح لهذا العضو.");
      return;
    }

    const message = getMessage(member);

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.phone.includes(query)
      );
    });
  }, [members, search]);

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  ).length;

  const unpaidMembers = members.filter(
    (member) => member.paymentStatus === "Unpaid"
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / pageSize)
  );
  const displayPage = Math.min(currentPage, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (displayPage - 1) * pageSize,
    displayPage * pageSize
  );
  const firstDisplayedMember =
    filteredMembers.length === 0 ? 0 : (displayPage - 1) * pageSize + 1;
  const lastDisplayedMember = Math.min(
    displayPage * pageSize,
    filteredMembers.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Messages
        </h1>

        <p className="text-muted-foreground">
          Contact StarGym members directly through WhatsApp.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total Members
              </p>

              <p className="text-2xl font-bold">
                {members.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Active Members
              </p>

              <p className="text-2xl font-bold">
                {activeMembers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Unpaid Members
              </p>

              <p className="text-2xl font-bold">
                {unpaidMembers}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Members
            </CardTitle>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or phone..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <p className="text-muted-foreground">
                Loading members...
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  No members found
                </p>

                <p className="text-sm text-muted-foreground">
                  Try another name or phone number.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
              {paginatedMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex flex-col gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                >
                  {/* Member information */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
                      {resolveApiAsset(member.photo) ? (
                        <Image
                          src={resolveApiAsset(member.photo)!}
                          alt={member.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Name + phone */}
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {member.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />

                        <span>
                          {member.phone || "No phone number"}
                        </span>
                      </div>

                      {member.disciplines?.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {member.disciplines.join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status + action */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      {member.status === "Active" ? (
                        <Badge
                          variant="default"
                          className="gap-1"
                        >
                          <UserCheck className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="gap-1"
                        >
                          <UserX className="h-3 w-3" />
                          Out
                        </Badge>
                      )}

                      {member.paymentStatus === "Paid" ? (
                        <Badge
                          variant="outline"
                          className="border-green-500/30 text-green-600"
                        >
                          Paid
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                        >
                          Unpaid
                        </Badge>
                      )}

                      {member.insuranceStatus === "Paid" ? (
                        <Badge
                          variant="outline"
                          className="border-green-500/30 text-green-600"
                        >
                          Insurance Paid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Insurance Unpaid
                        </Badge>
                      )}

                      {member.unpaidCompetitions.length > 0 && (
                        <Badge variant="destructive">
                          Competition Unpaid
                        </Badge>
                      )}

                      {member.incompleteCompetitionDocuments.length > 0 && (
                        <Badge variant="destructive">
                          Missing Competition Documents
                        </Badge>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => openWhatsApp(member)}
                      className="gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />

                      Send WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {firstDisplayedMember}-{lastDisplayedMember} of {filteredMembers.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(displayPage - 1)}
                      disabled={displayPage === 1}
                      aria-label="Previous page"
                      title="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="min-w-20 text-center text-sm font-medium">
                      Page {displayPage} of {totalPages}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(displayPage + 1)}
                      disabled={displayPage === totalPages}
                      aria-label="Next page"
                      title="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
