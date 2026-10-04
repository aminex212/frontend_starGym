"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Users,
    UserCheck,
    CreditCard,
    Trophy,
    ArrowUpRight,
    ShieldCheck,
    UsersRound,
    UserX,
    Clock,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

type Member = {
    _id: string;
    name: string;
    phone: string;
    age: number;
    disciplines: string[];
    status: "Active" | "Out";
    paymentStatus: "Paid" | "Unpaid";
    insuranceStatus: "Paid" | "Unpaid";
    photo: string | null;
    createdAt: string;
};

type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    days: string[];
    startTime: string;
    endTime: string;
    active: boolean;
};

type Payment = {
    _id: string;
    member: {
        _id: string;
        name: string;
        phone: string;
    };
    amount: number;
    paymentDate: string;
    month: string;
    status: "Paid" | "Unpaid";
    createdAt: string;
};

type Competition = {
    _id: string;
    name: string;
    date: string;
    location: string;
    description?: string;
};

type Participant = {
    _id: string;
    competition: {
        _id: string;
        name: string;
    };
    member: {
        _id: string;
        name: string;
    };
    competitionPayment: "Paid" | "Unpaid";
    documentsStatus: "Complete" | "Incomplete";
    incompleteDocuments: string[];
    createdAt: string;
};

type Stat = {
    title: string;
    value: number;
    description: string;
    icon: typeof Users;
};

export default function DashboardPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [groups, setGroups] = useState<TrainingGroup[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDashboardData = useCallback(async () => {
    try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        const [
            membersResponse,
            paymentsResponse,
            groupsResponse,
            competitionsResponse,
            participantsResponse,
        ] = await Promise.all([
            apiFetch("/api/members"),
            apiFetch("/api/payments"),
            apiFetch("/api/training-groups"),
            apiFetch("/api/competitions"),
            apiFetch("/api/competition-participants"),
        ]);

        if (
            membersResponse.status === 401 ||
            paymentsResponse.status === 401 ||
            groupsResponse.status === 401 ||
            competitionsResponse.status === 401 ||
            participantsResponse.status === 401
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            router.push("/login");
            return;
        }

        if (
            !membersResponse.ok ||
            !paymentsResponse.ok ||
            !groupsResponse.ok ||
            !competitionsResponse.ok ||
            !participantsResponse.ok
        ) {
            throw new Error("Failed to fetch dashboard data");
        }

        const membersData = await membersResponse.json();
        const paymentsData = await paymentsResponse.json();
        const groupsData = await groupsResponse.json();
        const competitionsData =
            await competitionsResponse.json();
        const participantsData =
            await participantsResponse.json();

        setMembers(membersData);
        setPayments(paymentsData);
        setGroups(groupsData);
        setCompetitions(competitionsData);
        setParticipants(participantsData);
    } catch (error) {
        console.error(
            "Error fetching dashboard data:",
            error
        );
    } finally {
        setLoading(false);
    }
    }, [router]);

    useEffect(() => {
        void Promise.resolve().then(fetchDashboardData);
    }, [fetchDashboardData]);

    const activeMembers = members.filter(
        (member) => member.status === "Active"
    );

    const unpaidPayments = members.filter(
        (member) => member.paymentStatus === "Unpaid"
    );

    const unpaidInsurance = members.filter(
        (member) => member.insuranceStatus === "Unpaid"
    );

    const outMembers = members.filter(
        (member) => member.status === "Out"
    );

    const stats: Stat[] = [
        {
            title: "Total Members",
            value: members.length,
            description: "All registered members",
            icon: Users,
        },
        {
            title: "Active Members",
            value: activeMembers.length,
            description: "Currently active",
            icon: UserCheck,
        },
        {
            title: "Out Members",
            value: outMembers.length,
            description: "Members marked out",
            icon: UserX,
        },
        {
            title: "Unpaid Payments",
            value: unpaidPayments.length,
            description: "Payments to follow up",
            icon: CreditCard,
        },
        {
            title: "Unpaid Insurance",
            value: unpaidInsurance.length,
            description: "Insurance to follow up",
            icon: ShieldCheck,
        },
        {
            title: "Total Groups",
            value: groups.length,
            description: "All training groups",
            icon: Clock,
        },
        {
            title: "Competitions",
            value: competitions.length,
            description: `${participants.length} registered participants`,
            icon: Trophy,
        },
        {
            title: "Competition Participants",
            value: participants.length,
            description: "Registered participants",
            icon: UsersRound,
        },
    ];

    const recentMembers = [...members]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

    const recentPayments = [...payments]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

    const recentParticipants = [...participants]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Page header */}

            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Overview of your StarGym Fighting Academy
                </p>
            </div>

            {/* Statistics */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                    <Icon className="h-4 w-4" />
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loading ? "..." : stat.value}
                                </div>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tables */}

            <div className="grid gap-6 xl:grid-cols-2">
                {/* Recent Members */}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>
                                Recent Members
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Recently registered members
                            </p>
                        </div>

                        <a
                            href="/members"
                            className="flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading members...
                            </p>
                        ) : recentMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No members found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentMembers.map((member) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {member.name}
                                                </p>

                                                <p className="truncate text-xs text-muted-foreground">
                                                    {member.disciplines?.length
                                                        ? member.disciplines.join(
                                                              ", "
                                                          )
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <Badge
                                            variant={
                                                member.status ===
                                                "Active"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {member.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Payments */}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>
                                Recent Payments
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest payment activity
                            </p>
                        </div>

                        <a
                            href="/payments"
                            className="flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading payments...
                            </p>
                        ) : recentPayments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No payments found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentPayments.map(
                                    (payment) => (
                                        <div
                                            key={payment._id}
                                            className="flex items-center justify-between gap-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {payment.member
                                                        ?.name ||
                                                        "Unknown"}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {payment.month}{" "}
                                                    ·{" "}
                                                    {payment.amount}{" "}
                                                    DH
                                                </p>
                                            </div>

                                            <Badge
                                                variant={
                                                    payment.status ===
                                                    "Paid"
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Insurance */}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Insurance</CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest member insurance status
                            </p>
                        </div>

                        <a
                            href="/members"
                            className="flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading insurance...
                            </p>
                        ) : recentMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No insurance records found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentMembers.map((member) => (
                                    <div
                                        key={member._id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {member.name}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Annual insurance
                                            </p>
                                        </div>

                                        <Badge
                                            variant={
                                                member.insuranceStatus ===
                                                "Paid"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                        >
                                            {member.insuranceStatus}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Competition Participants */}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Participants</CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Latest competition registrations
                            </p>
                        </div>

                        <a
                            href="/competition-participants"
                            className="flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading participants...
                            </p>
                        ) : recentParticipants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No participants found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentParticipants.map((participant) => (
                                    <div
                                        key={participant._id}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {participant.member?.name || "Unknown"}
                                            </p>

                                            <p className="truncate text-xs text-muted-foreground">
                                                {participant.competition?.name || "Unknown competition"}
                                            </p>
                                        </div>

                                        <Badge
                                            variant={
                                                participant.competitionPayment ===
                                                "Paid"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                        >
                                            {participant.competitionPayment}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}