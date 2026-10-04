"use client";

import { useEffect, useState } from "react";
import { Plus, Upload, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const disciplines = [
    "MMA",
    "Kick Boxing",
    "Boxing",
    "Jiu-Jitsu",
    "Wrestling",
];

type AddMemberDialogProps = {
    onMemberCreated?: () => void;
};

type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    startTime: string;
    endTime: String;
    active: Boolean;
}

export default function AddMemberDialog({
    onMemberCreated,
}: AddMemberDialogProps) {
    const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
    const [photo, setPhoto] = useState<File | null>(null);
    const [groups, setGroups] = useState<TrainingGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function fetchTrainingGroups() {
            const response = await apiFetch("/api/training-groups");

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch training groups"
                );
            }

            setGroups(data);
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

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (selectedDisciplines.length === 0) {
            toast.error("Please select at least one discipline.");
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        formData.set(
            "disciplines",
            JSON.stringify(selectedDisciplines)
        );

        if (photo) {
            formData.set("photo", photo);
        }

        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        if (selectedGroup) {
            formData.set("group", selectedGroup);
        } else {
            formData.set("group", "");
        }

        try {
            const response = await apiFetch("/api/members", {
                method: "POST",
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

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create member"
                );
            }

            console.log(
                "Member created:",
                data.member
            );

            form.reset();

            setPhoto(null);
            setSelectedDisciplines([]);

            toast.success("Member created successfully!");

            // Refresh parent list
            onMemberCreated?.();

        } catch (error) {
            console.error(
                "Error creating member:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        }
    }
    return (
        <Dialog>
            <DialogTrigger
                render={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                }
            />

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>

                    <DialogDescription>
                        Add a new member to StarGym.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Full name
                        </label>

                        <input
                            name="name"
                            type="text"
                            placeholder="Enter member name"
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
                            name="phone"
                            type="tel"
                            placeholder="06 12 34 56 78"
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
                            name="age"
                            type="number"
                            min="5"
                            max="100"
                            placeholder="Enter age"
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
                                    selectedDisciplines.includes(discipline);

                                return (
                                    <button
                                        key={discipline}
                                        type="button"
                                        onClick={() => toggleDiscipline(discipline)}
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
                                {selectedDisciplines.map((discipline) => (
                                    <Badge
                                        key={discipline}
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        {discipline}

                                        <button
                                            type="button"
                                            onClick={() => removeDiscipline(discipline)}
                                            className="rounded-full hover:bg-muted-foreground/20"
                                            aria-label={`Remove ${discipline}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {selectedDisciplines.length === 0 && (
                            <p className="text-xs text-destructive">
                                Select at least one discipline.
                            </p>
                        )}
                    </div>

                    {/* Training Group */}
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

                    {/* Insurance */}
                    <div className="space-y-2">
                        <Label htmlFor="insuranceStatus">
                            Insurance
                        </Label>

                        <select
                            id="insuranceStatus"
                            name="insuranceStatus"
                            defaultValue="Unpaid"
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
                            Member photo
                        </label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition hover:bg-muted/50">
                            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />

                            <span className="text-sm font-medium">
                                {photo ? photo.name : "Upload photo"}
                            </span>

                            <span className="mt-1 text-xs text-muted-foreground">
                                JPG, PNG or WEBP
                            </span>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    setPhoto(event.target.files?.[0] ?? null);
                                }}
                            />
                        </label>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={selectedDisciplines.length === 0}
                    >
                        Add Member
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}