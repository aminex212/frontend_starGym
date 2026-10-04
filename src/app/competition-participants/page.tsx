"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

import AddParticipantDialog from "@/components/competition-participants/AddParticipantDialog";
import ShowParticipantDialog from "@/components/competition-participants/ShowParticipantDialog";
import UpdateCompetitionParticipantDialog
    from "@/components/competition-participants/UpdateCompetitionParticipantDialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Participant } from "@/types/participant";

export default function CompetitionParticipantsPage() {
    const router = useRouter();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [updateParticipant, setUpdateParticipant] = useState<Participant | null>(null);
    const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);

    async function fetchParticipants() {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await apiFetch("/api/competition-participants");

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch participants");
            }

            const data = await response.json();

            setParticipants(data);
        } catch (error) {
            console.error("Error fetching participants:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchParticipants();
    }, [router]);

    async function handleDelete(participant: Participant) {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await apiFetch(`/api/competition-participants/${participant._id}`, {
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
                    data.message || "Failed to remove participant"
                );
            }

            setParticipants((current) =>
                current.filter(
                    (item) => item._id !== participant._id
                )
            );

            setParticipantToDelete(null);
            toast.success("Participant removed successfully!");
        } catch (error) {
            console.error("Error removing participant:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Competition Participants
                    </h1>

                    <p className="text-muted-foreground">
                        Manage members participating in competitions.
                    </p>
                </div>

                <AddParticipantDialog
                    onParticipantCreated={fetchParticipants}
                />
            </div>

            {/* Table */}
            <div className="rounded-lg border">
                {loading ? (
                    <div className="p-6 text-center text-muted-foreground">
                        Loading participants...
                    </div>
                ) : participants.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                        No competition participants found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Member
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Competition
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Payment
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Documents
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium">
                                        Missing Documents
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {participants.map((participant) => (
                                    <tr
                                        key={participant._id}
                                        className="border-b last:border-0"
                                    >
                                        {/* Member */}
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {participant.member?.name ||
                                                    "Unknown"}
                                            </div>

                                            <div className="text-muted-foreground">
                                                {participant.member?.phone ||
                                                    "-"}
                                            </div>
                                        </td>

                                        {/* Competition */}
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {participant.competition?.name ||
                                                    "Unknown"}
                                            </div>

                                            <div className="text-muted-foreground">
                                                {participant.competition?.location ||
                                                    "-"}
                                            </div>
                                        </td>

                                        {/* Payment */}
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    participant.competitionPayment ===
                                                        "Paid"
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {
                                                    participant.competitionPayment
                                                }
                                            </Badge>
                                        </td>

                                        {/* Documents */}
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    participant.documentsStatus ===
                                                        "Complete"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {
                                                    participant.documentsStatus
                                                }
                                            </Badge>
                                        </td>

                                        {/* Missing Documents */}
                                        <td className="px-4 py-3">
                                            {participant.incompleteDocuments
                                                ?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {participant.incompleteDocuments.map(
                                                        (document) => (
                                                            <Badge
                                                                key={document}
                                                                variant="outline"
                                                            >
                                                                {document}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    None
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Actions for ${participant.member
                                                                ?.name ||
                                                                "participant"
                                                                }`}
                                                        />
                                                    }
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setSelectedParticipant(participant)}
                                                    >
                                                        Show
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => setUpdateParticipant(participant)}
                                                    >
                                                        Update
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setParticipantToDelete(participant)
                                                        }
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ShowParticipantDialog
                participant={selectedParticipant}
                open={selectedParticipant !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedParticipant(null);
                    }
                }}
            />

            <UpdateCompetitionParticipantDialog
                participant={updateParticipant}
                open={updateParticipant !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUpdateParticipant(null);
                    }
                }}
                onUpdated={(updatedParticipant) => {
                    setParticipants((current) =>
                        current.map((participant) =>
                            participant._id === updatedParticipant._id
                                ? updatedParticipant
                                : participant
                        )
                    );
                }}
            />

            <AlertDialog
                open={!!participantToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setParticipantToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove participant?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {participantToDelete
                                ? `Are you sure you want to remove ${participantToDelete.member?.name}?`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                if (participantToDelete) {
                                    handleDelete(participantToDelete);
                                }
                            }}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}