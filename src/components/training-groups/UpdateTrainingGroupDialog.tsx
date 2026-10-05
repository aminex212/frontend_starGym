"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    startTime: string;
    endTime: string;
    days: string[];
    active: boolean;
};

type UpdateTrainingGroupDialogProps = {
    group: TrainingGroup | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated?: (group: TrainingGroup) => void;
};

const disciplines = [
    "MMA",
    "Kick Boxing",
    "Boxing",
    "Jiu-Jitsu",
    "Wrestling",
];

const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function UpdateTrainingGroupDialog({
    group,
    open,
    onOpenChange,
    onUpdated,
}: UpdateTrainingGroupDialogProps) {
    const [name, setName] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [days, setDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!group) {
            return;
        }

        void Promise.resolve().then(() => {
            setName(group.name);
            setDiscipline(group.discipline);
            setStartTime(group.startTime);
            setEndTime(group.endTime);
            setDays(group.days || []);
            setActive(group.active);
        });
    }, [group]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!group) {
            return;
        }

        if (
            !name ||
            !discipline ||
            days.length === 0 ||
            !startTime ||
            !endTime
        ) {
            toast.error(
                "Please fill in all required fields."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch(
                `/api/training-groups/${group._id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        name,
                        discipline,
                        days,
                        startTime,
                        endTime,
                        active,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update training group"
                );
            }

            toast.success(
                "Training group updated successfully!"
            );

            onUpdated?.(data.group);
            onOpenChange(false);
        } catch (error) {
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Update Training Group
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="update-group-name">
                            Group Name
                        </Label>

                        <Input
                            id="update-group-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="update-discipline">
                            Discipline
                        </Label>

                        <select
                            id="update-discipline"
                            value={discipline}
                            onChange={(event) =>
                                setDiscipline(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            required
                        >
                            <option value="">
                                Select discipline
                            </option>

                            {disciplines.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Training Days</Label>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {weekDays.map((day) => (
                                <label
                                    key={day}
                                    className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={days.includes(day)}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                setDays((current) => [...current, day]);
                                            } else {
                                                setDays((current) =>
                                                    current.filter((item) => item !== day)
                                                );
                                            }
                                        }}
                                        className="h-4 w-4"
                                    />

                                    <span>{day}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="update-start-time">
                            Start Time
                        </Label>

                        <Input
                            id="update-start-time"
                            type="time"
                            value={startTime}
                            onChange={(event) =>
                                setStartTime(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="update-end-time">
                            End Time
                        </Label>

                        <Input
                            id="update-end-time"
                            type="time"
                            value={endTime}
                            onChange={(event) =>
                                setEndTime(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="update-active"
                            type="checkbox"
                            checked={active}
                            onChange={(event) =>
                                setActive(
                                    event.target.checked
                                )
                            }
                            className="h-4 w-4"
                        />

                        <Label htmlFor="update-active">
                            Active
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                onOpenChange(false)
                            }
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating..."
                                : "Update Group"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
