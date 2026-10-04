"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Member = {
    _id: string;
    name: string;
    phone: string;
};

type Competition = {
    _id: string;
    name: string;
    date: string;
    location: string;
};

type AddParticipantDialogProps = {
    onParticipantCreated: () => void;
};

const documentOptions = [
    "Medical Certificate",
    "ID Card Copy",
    "Insurance",
    "Photo",
    "Competition License",
    "Other",
];

export default function AddParticipantDialog({
    onParticipantCreated,
}: AddParticipantDialogProps) {
    const [open, setOpen] = useState(false);

    const [members, setMembers] = useState<Member[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);

    const [loadingData, setLoadingData] = useState(false);
    const [loading, setLoading] = useState(false);

    const [competition, setCompetition] = useState("");
    const [member, setMember] = useState("");

    const [competitionPayment, setCompetitionPayment] =
        useState<"Paid" | "Unpaid">("Unpaid");

    const [documentsStatus, setDocumentsStatus] =
        useState<"Complete" | "Incomplete">("Complete");

    const [incompleteDocuments, setIncompleteDocuments] = useState<string[]>(
        []
    );

    useEffect(() => {
        if (!open) return;

        async function fetchData() {
            try {
                setLoadingData(true);

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

                if (!membersResponse.ok) {
                    throw new Error("Failed to fetch members");
                }

                if (!competitionsResponse.ok) {
                    throw new Error("Failed to fetch competitions");
                }

                const membersData = await membersResponse.json();
                const competitionsData = await competitionsResponse.json();

                setMembers(membersData);
                setCompetitions(competitionsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to load data"
                );
            } finally {
                setLoadingData(false);
            }
        }

        fetchData();
    }, [open]);

    function toggleDocument(document: string) {
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

        if (!competition || !member) {
            toast.error("Please select a competition and a member.");
            return;
        }

        if (
            documentsStatus === "Incomplete" &&
            incompleteDocuments.length === 0
        ) {
            toast.error("Please select the incomplete documents.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await apiFetch("/api/competition-participants", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    competition,
                    member,
                    competitionPayment,
                    documentsStatus,
                    incompleteDocuments:
                        documentsStatus === "Incomplete"
                            ? incompleteDocuments
                            : [],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add participant"
                );
            }

            toast.success("Participant added successfully!");

            setCompetition("");
            setMember("");
            setCompetitionPayment("Unpaid");
            setDocumentsStatus("Complete");
            setIncompleteDocuments([]);

            setOpen(false);

            onParticipantCreated();
        } catch (error) {
            console.error("Error adding participant:", error);

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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Participant
                    </Button>
                }
            />

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Competition Participant</DialogTitle>

                    <DialogDescription>
                        Add a member to a competition.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Competition */}
                    <div className="space-y-2">
                        <Label htmlFor="competition">
                            Competition
                        </Label>

                        <select
                            id="competition"
                            value={competition}
                            onChange={(event) =>
                                setCompetition(event.target.value)
                            }
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                            required
                        >
                            <option value="">
                                {loadingData
                                    ? "Loading competitions..."
                                    : "Select competition"}
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

                    {/* Member */}
                    <div className="space-y-2">
                        <Label htmlFor="member">
                            Member
                        </Label>

                        <select
                            id="member"
                            value={member}
                            onChange={(event) =>
                                setMember(event.target.value)
                            }
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                            required
                        >
                            <option value="">
                                {loadingData
                                    ? "Loading members..."
                                    : "Select member"}
                            </option>

                            {members
                                .filter((item) => item.name)
                                .map((item) => (
                                    <option
                                        key={item._id}
                                        value={item._id}
                                    >
                                        {item.name} - {item.phone}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Competition Payment */}
                    <div className="space-y-2">
                        <Label htmlFor="competitionPayment">
                            Competition Payment
                        </Label>

                        <select
                            id="competitionPayment"
                            value={competitionPayment}
                            onChange={(event) =>
                                setCompetitionPayment(
                                    event.target.value as
                                        | "Paid"
                                        | "Unpaid"
                                )
                            }
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                        >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>

                    {/* Documents Status */}
                    <div className="space-y-2">
                        <Label htmlFor="documentsStatus">
                            Documents Status
                        </Label>

                        <select
                            id="documentsStatus"
                            value={documentsStatus}
                            onChange={(event) => {
                                const value =
                                    event.target.value as
                                        | "Complete"
                                        | "Incomplete";

                                setDocumentsStatus(value);

                                if (value === "Complete") {
                                    setIncompleteDocuments([]);
                                }
                            }}
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                        >
                            <option value="Incomplete">
                                Incomplete
                            </option>

                            <option value="Complete">
                                Complete
                            </option>
                        </select>
                    </div>

                    {/* Incomplete Documents */}
                    {documentsStatus === "Incomplete" && (
                        <div className="space-y-3">
                            <Label>
                                Incomplete Documents
                            </Label>

                            <div className="grid grid-cols-2 gap-2">
                                {documentOptions.map((document) => (
                                    <label
                                        key={document}
                                        className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={incompleteDocuments.includes(
                                                document
                                            )}
                                            onChange={() =>
                                                toggleDocument(
                                                    document
                                                )
                                            }
                                        />

                                        <span>{document}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Adding..."
                                : "Add Participant"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}