"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Competition, Member, Participant } from "@/types/participant";

type Props = {
    participant: Participant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (participant: Participant) => void;
};

const documentOptions = [
    "Medical Certificate",
    "ID Card Copy",
    "Insurance",
    "Photo",
    "Competition License",
    "Other",
];

export default function UpdateCompetitionParticipantDialog({
    participant,
    open,
    onOpenChange,
    onUpdated,
}: Props) {
    const [members, setMembers] = useState<Member[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);

    const [member, setMember] = useState("");
    const [competition, setCompetition] = useState("");

    const [competitionPayment, setCompetitionPayment] =
        useState<"Paid" | "Unpaid">("Unpaid");

    const [documentsStatus, setDocumentsStatus] =
        useState<"Complete" | "Incomplete">("Incomplete");

    const [incompleteDocuments, setIncompleteDocuments] =
        useState<string[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        async function fetchData() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    throw new Error("Your session has expired. Please log in again.");
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [membersResponse, competitionsResponse] =
                    await Promise.all([
                        apiFetch("/api/members"),
                        apiFetch("/api/competitions"),
                    ]);

                const membersData = await membersResponse.json();
                const competitionsData =
                    await competitionsResponse.json();

                setMembers(membersData);
                setCompetitions(competitionsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, [open]);

    useEffect(() => {
        if (participant) {
            setMember(participant.member?._id || "");
            setCompetition(participant.competition?._id || "");

            setCompetitionPayment(
                participant.competitionPayment
            );

            setDocumentsStatus(
                participant.documentsStatus
            );

            setIncompleteDocuments(
                participant.incompleteDocuments || []
            );
        }
    }, [participant]);

    function handleDocumentChange(document: string) {
        setIncompleteDocuments((current) =>
            current.includes(document)
                ? current.filter((item) => item !== document)
                : [...current, document]
        );
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!participant) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await apiFetch(`/api/competition-participants/${participant._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    member,
                    competition,
                    competitionPayment,
                    documentsStatus,
                    incompleteDocuments,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update participant"
                );
            }

            onUpdated(data.participant);

            onOpenChange(false);

            toast.success("Participant updated successfully!");
        } catch (error) {
            console.error(
                "Error updating participant:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Update Competition Participant
                    </DialogTitle>

                    <DialogDescription>
                        Update participant information.
                    </DialogDescription>
                </DialogHeader>

                {participant && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Member */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Member
                            </label>

                            <select
                                value={member}
                                onChange={(event) =>
                                    setMember(event.target.value)
                                }
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                                required
                            >
                                <option value="">
                                    Select member
                                </option>

                                {members.map((item) => (
                                    <option
                                        key={item._id}
                                        value={item._id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Competition */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Competition
                            </label>

                            <select
                                value={competition}
                                onChange={(event) =>
                                    setCompetition(
                                        event.target.value
                                    )
                                }
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                                required
                            >
                                <option value="">
                                    Select competition
                                </option>

                                {competitions.map((item) => (
                                    <option
                                        key={item._id}
                                        value={item._id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Competition Payment */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Competition Payment
                            </label>

                            <select
                                value={competitionPayment}
                                onChange={(event) =>
                                    setCompetitionPayment(
                                        event.target.value as
                                            | "Paid"
                                            | "Unpaid"
                                    )
                                }
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                            >
                                <option value="Paid">
                                    Paid
                                </option>

                                <option value="Unpaid">
                                    Unpaid
                                </option>
                            </select>
                        </div>

                        {/* Documents Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Documents Status
                            </label>

                            <select
                                value={documentsStatus}
                                onChange={(event) =>
                                    setDocumentsStatus(
                                        event.target.value as
                                            | "Complete"
                                            | "Incomplete"
                                    )
                                }
                                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                            >
                                <option value="Complete">
                                    Complete
                                </option>

                                <option value="Incomplete">
                                    Incomplete
                                </option>
                            </select>
                        </div>

                        {/* Incomplete Documents */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Incomplete Documents
                            </label>

                            <div className="grid grid-cols-1 gap-2">
                                {documentOptions.map(
                                    (document) => (
                                        <label
                                            key={document}
                                            className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={incompleteDocuments.includes(
                                                    document
                                                )}
                                                onChange={() =>
                                                    handleDocumentChange(
                                                        document
                                                    )
                                                }
                                            />

                                            {document}
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating..."
                                : "Update Participant"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}