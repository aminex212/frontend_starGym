"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
    ChevronLeft,
    ChevronRight,
    Search,
    MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import AddMemberDialog from "@/components/members/AddMemberDialog";
import UpdateMemberDialog from "@/components/members/UpdateMemberDialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    startTime: string;
    endTime: string;
    active: boolean;
};

type Member = {
    _id: string;
    name: string;
    phone: string;
    age: number;
    disciplines: string[];
    group?: TrainingGroup | null;
    status: "Active" | "Out";
    paymentStatus: "Paid" | "Unpaid";
    insuranceStatus: "Paid" | "Unpaid";
    photo: string | null;
};

type MemberFilter = "all" | "active" | "out" | "group" | "payment";

const disciplines = [
    "MMA",
    "Kick Boxing",
    "Boxing",
    "Wrestling",
    "Jiu-Jitsu",
];

export default function MembersPage() {
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
    const [disciplineFilter, setDisciplineFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const [updateMember, setUpdateMember] = useState<Member | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const pageSize = 10;

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        apiFetch("/api/members")
            .then((response) => {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    router.push("/login");
                    throw new Error("Session expired");
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch members");
                }

                return response.json();
            })
            .then((data) => {
                setMembers(data);
            })
            .catch((error) => {
                if (error instanceof Error && error.message === "Session expired") {
                    return;
                }

                console.error("Error fetching members:", error);
            })
            .finally(() => {
            setLoading(false);
            });
    }, [router]);

    async function handleMemberCreated() {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await apiFetch("/api/members");

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to refresh members");
            }

            setMembers(await response.json());
            setCurrentPage(1);
        } catch (error) {
            console.error("Error refreshing members:", error);
        }
    }

    async function handleDelete(member: Member) {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await apiFetch(`/api/members/${member._id}`, {
                method: "DELETE",
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                router.push("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to mark member as Out"
                );
            }

            setMembers((current) =>
                current.map((item) =>
                    item._id === member._id
                        ? {
                            ...item,
                            status: "Out",
                        }
                        : item
                )
            );

            setMemberToDelete(null);
            toast.success("Member marked as Out successfully!");
        } catch (error) {
            console.error(
                "Error marking member as Out:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        }
    }

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            member.name.toLowerCase().includes(normalizedSearchQuery) ||
            member.group?.name.toLowerCase().includes(normalizedSearchQuery);

        if (!matchesSearch) {
            return false;
        }

        if (
            disciplineFilter !== "all" &&
            !member.disciplines.includes(disciplineFilter)
        ) {
            return false;
        }

        switch (memberFilter) {
            case "active":
                return member.status === "Active";
            case "out":
                return member.status === "Out";
            case "group":
                return Boolean(member.group);
            case "payment":
                return member.paymentStatus === "Paid";
            default:
                return true;
        }
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredMembers.length / pageSize)
    );
    const page = Math.min(currentPage, totalPages);
    const paginatedMembers = filteredMembers.slice(
        (page - 1) * pageSize,
        page * pageSize
    );
    
    return (
        <div className="space-y-6">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Members
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your StarGym members
                    </p>
                </div>

                <AddMemberDialog onMemberCreated={handleMemberCreated} />
            </div>

            {/* Search + Filter */}

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                placeholder="Search by name or group..."
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <select
                            value={memberFilter}
                            onChange={(event) => {
                                setMemberFilter(
                                    event.target.value as MemberFilter
                                );
                                setCurrentPage(1);
                            }}
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">
                                All members
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="out">
                                Out
                            </option>

                            <option value="group">
                                With group
                            </option>

                            <option value="payment">
                                Paid
                            </option>
                        </select>

                        <select
                            value={disciplineFilter}
                            onChange={(event) => {
                                setDisciplineFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">
                                All disciplines
                            </option>

                            {disciplines.map((discipline) => (
                                <option key={discipline} value={discipline}>
                                    {discipline}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Members table */}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Member
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Phone
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Age
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Discipline
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Training Group
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Payment
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Insurance
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-6 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            Loading members...
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-6 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            No members found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedMembers.map(
                                        (member) => (
                                            <tr
                                                key={member._id}
                                                className="border-b last:border-0 hover:bg-muted/20"
                                            >
                                                {/* Member + Photo */}

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                                                            {member.photo ? (
                                                                <Image
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${member.photo}`}
                                                                    alt={
                                                                        member.name
                                                                    }
                                                                    fill
                                                                    sizes="40px"
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center font-semibold">
                                                                    {member.name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <span className="font-medium">
                                                            {
                                                                member.name
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Phone */}

                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {
                                                        member.phone
                                                    }
                                                </td>

                                                {/* Age */}

                                                <td className="px-6 py-4 text-sm">
                                                    {member.age}
                                                </td>

                                                {/* Disciplines */}

                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {member.disciplines?.map(
                                                            (
                                                                discipline
                                                            ) => (
                                                                <Badge
                                                                    key={
                                                                        discipline
                                                                    }
                                                                    variant="outline"
                                                                    className="font-normal"
                                                                >
                                                                    {
                                                                        discipline
                                                                    }
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Training Group */}

                                                <td className="px-6 py-4">
                                                    {member.group ? (
                                                        <div>
                                                            <p className="font-medium">
                                                                {member.group.name}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {member.group.discipline}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {member.group.startTime} →{" "}
                                                                {member.group.endTime}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            No group
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}

                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant={
                                                            member.status ===
                                                                "Active"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {
                                                            member.status
                                                        }
                                                    </Badge>
                                                </td>

                                                {/* Payment */}

                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant={
                                                            member.paymentStatus ===
                                                                "Paid"
                                                                ? "default"
                                                                : "destructive"
                                                        }
                                                    >
                                                        {
                                                            member.paymentStatus
                                                        }
                                                    </Badge>
                                                </td>

                                                {/* Insurance */}

                                                <td className="px-6 py-4">
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
                                                </td>

                                                {/* Actions */}

                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            render={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={`Actions for ${member.name}`}
                                                                />
                                                            }
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setSelectedMember(
                                                                        member
                                                                    )
                                                                }
                                                            >
                                                                Show
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setUpdateMember(
                                                                        member
                                                                    )
                                                                }
                                                            >
                                                                Update
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setMemberToDelete(member)
                                                                }
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {filteredMembers.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1}-
                        {Math.min(page * pageSize, filteredMembers.length)} of{" "}
                        {filteredMembers.length} members
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Previous page"
                            disabled={page === 1}
                            onClick={() => setCurrentPage(page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Next page"
                            disabled={page === totalPages}
                            onClick={() => setCurrentPage(page + 1)}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Show Member Dialog */}

            <Dialog
                open={selectedMember !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMember(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Member Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedMember && (
                        <div className="space-y-4">
                            {/* Photo + Name */}

                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                                    {selectedMember.photo ? (
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedMember.photo}`}
                                            alt={
                                                selectedMember.name
                                            }
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-lg font-bold">
                                            {selectedMember.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        {
                                            selectedMember.name
                                        }
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        {
                                            selectedMember.phone
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Age
                                    </p>

                                    <p className="font-medium">
                                        {
                                            selectedMember.age
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Status
                                    </p>

                                    <Badge
                                        variant={
                                            selectedMember.status ===
                                                "Active"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {
                                            selectedMember.status
                                        }
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Payment
                                    </p>

                                    <Badge
                                        variant={
                                            selectedMember.paymentStatus ===
                                                "Paid"
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {
                                            selectedMember.paymentStatus
                                        }
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Insurance
                                    </p>

                                    <Badge
                                        variant={
                                            selectedMember.insuranceStatus ===
                                                "Paid"
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {selectedMember.insuranceStatus}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Disciplines
                                    </p>

                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        {selectedMember.disciplines?.map(
                                            (
                                                discipline
                                            ) => (
                                                <Badge
                                                    key={
                                                        discipline
                                                    }
                                                    variant="outline"
                                                >
                                                    {
                                                        discipline
                                                    }
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Training Group
                                    </p>

                                    {selectedMember.group ? (
                                        <div className="text-sm text-muted-foreground">
                                            <p>
                                                {selectedMember.group.name}
                                            </p>

                                            <p>
                                                {selectedMember.group.discipline}
                                            </p>

                                            <p>
                                                {selectedMember.group.startTime} →{" "}
                                                {selectedMember.group.endTime}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No group assigned
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Member Dialog */}

            <UpdateMemberDialog
                member={updateMember}
                open={updateMember !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUpdateMember(null);
                    }
                }}
                onUpdated={(updatedMember) => {
                    setMembers((current) =>
                        current.map((member) =>
                            member._id ===
                                updatedMember._id
                                ? updatedMember
                                : member
                        )
                    );
                }}
            />

            <AlertDialog
                open={!!memberToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setMemberToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Mark member as Out?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {memberToDelete
                                ? `Are you sure you want to mark ${memberToDelete.name} as Out?`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                if (memberToDelete) {
                                    handleDelete(memberToDelete);
                                }
                            }}
                        >
                            Mark as Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}