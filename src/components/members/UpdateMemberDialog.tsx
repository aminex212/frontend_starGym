"use client";

import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const disciplines = [
    "MMA",
    "Kick Boxing",
    "Boxing",
    "Jiu-Jitsu",
    "Wrestling",
];

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

type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    startTime: string;
    endTime: string;
    active: boolean;
};


type UpdateMemberDialogProps = {
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (member: Member) => void;
};

export default function UpdateMemberDialog({
    member,
    open,
    onOpenChange,
    onUpdated,
}: UpdateMemberDialogProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
    const [status, setStatus] = useState<"Active" | "Out">("Active");
    const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Unpaid">("Unpaid");
    const [insuranceStatus, setInsuranceStatus] = useState<"Paid" | "Unpaid">("Unpaid");
    const [groups, setGroups] = useState<TrainingGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");

    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (member) {
            setName(member.name);
            setPhone(member.phone);
            setAge(String(member.age));
            setSelectedDisciplines(member.disciplines ?? []);
            setStatus(member.status);
            setPaymentStatus(member.paymentStatus);
            setInsuranceStatus(member.insuranceStatus);
            setSelectedGroup(member.group?._id || "");
            setPhoto(null);
        }
    }, [member]);

    useEffect(() => {
        async function fetchTrainingGroups() {
            const groupsResponse = await apiFetch(
                "/api/training-groups"
            );

            const groupsData = await groupsResponse.json();

            if (!groupsResponse.ok) {
                throw new Error(
                    groupsData.message || "Failed to fetch training groups"
                );
            }

            setGroups(groupsData);
        }

        fetchTrainingGroups();
    }, []);

    function toggleDiscipline(discipline: string) {
        setSelectedDisciplines((current) =>
            current.includes(discipline)
                ? current.filter((item) => item !== discipline)
                : [...current, discipline]
        );
    }

    function removeDiscipline(discipline: string) {
        setSelectedDisciplines((current) =>
            current.filter((item) => item !== discipline)
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!member) return;

        if (selectedDisciplines.length === 0) {
            toast.error("Select at least one discipline.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.set("name", name);
            formData.set("phone", phone);
            formData.set("age", age);
            formData.set(
                "disciplines",
                JSON.stringify(selectedDisciplines)
            );
            formData.set("group", selectedGroup);
            formData.set("status", status);
            formData.set("paymentStatus", paymentStatus);
            formData.set("insuranceStatus", insuranceStatus);

            if (photo) {
                formData.set("photo", photo);
            }

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await apiFetch(`/api/members/${member._id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    `Server returned non-JSON response: ${text}`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update member"
                );
            }

            onUpdated(data.member);

            onOpenChange(false);

            toast.success("Member updated successfully!");
        } catch (error) {
            console.error("Error updating member:", error);

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Member</DialogTitle>

                    <DialogDescription>
                        Update member information.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Full name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Phone
                        </label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(event) =>
                                setPhone(event.target.value)
                            }
                            required
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Age
                        </label>

                        <input
                            type="number"
                            min="5"
                            max="100"
                            value={age}
                            onChange={(event) =>
                                setAge(event.target.value)
                            }
                            required
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {/* Disciplines */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">
                                Disciplines
                            </label>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Select one or more disciplines.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {disciplines.map((discipline) => {
                                const selected =
                                    selectedDisciplines.includes(
                                        discipline
                                    );

                                return (
                                    <button
                                        key={discipline}
                                        type="button"
                                        onClick={() =>
                                            toggleDiscipline(
                                                discipline
                                            )
                                        }
                                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${selected
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        {discipline}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedDisciplines.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedDisciplines.map(
                                    (discipline) => (
                                        <Badge
                                            key={discipline}
                                            variant="secondary"
                                            className="gap-1"
                                        >
                                            {discipline}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeDiscipline(
                                                        discipline
                                                    )
                                                }
                                                className="rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Group */}
                    <div className="space-y-2">
                        <Label htmlFor="group">
                            Training Group
                        </Label>

                        <select
                            id="group"
                            value={selectedGroup}
                            onChange={(event) =>
                                setSelectedGroup(event.target.value)
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                            <option value="">
                                No group
                            </option>

                            {groups
                                .filter((group) => group.active)
                                .map((group) => (
                                    <option
                                        key={group._id}
                                        value={group._id}
                                    >
                                        {group.name} — {group.discipline} —{" "}
                                        {group.startTime} → {group.endTime}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                    | "Active"
                                    | "Out"
                                )
                            }
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                        >
                            <option value="Active">
                                Active
                            </option>

                            <option value="Out">
                                Out
                            </option>
                        </select>
                    </div>

                    {/* Insurance */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Insurance
                        </label>

                        <select
                            value={insuranceStatus}
                            onChange={(event) =>
                                setInsuranceStatus(
                                    event.target.value as
                                    | "Paid"
                                    | "Unpaid"
                                )
                            }
                            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                        >
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>

                        <p className="text-xs text-muted-foreground">
                            Insurance renews every year.
                        </p>
                    </div>

                    {/* Photo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            New member photo
                        </label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition hover:bg-muted/50">
                            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />

                            <span className="text-sm font-medium">
                                {photo
                                    ? photo.name
                                    : "Upload new photo"}
                            </span>

                            <span className="mt-1 text-xs text-muted-foreground">
                                JPG, PNG or WEBP
                            </span>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    setPhoto(
                                        event.target.files?.[0] ??
                                        null
                                    );
                                }}
                            />
                        </label>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            loading ||
                            selectedDisciplines.length === 0
                        }
                    >
                        {loading
                            ? "Updating..."
                            : "Update Member"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}