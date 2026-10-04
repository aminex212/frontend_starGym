"use client";

import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddTrainingGroupDialogProps = {
    onGroupCreated?: () => void;
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

export default function AddTrainingGroupDialog({
    onGroupCreated,
}: AddTrainingGroupDialogProps) {
    const [open, setOpen] = useState(false);

    const [name, setName] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [days, setDays] = useState<string[]>([]);
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(false);

    function resetForm() {
        setName("");
        setDiscipline("");
        setStartTime("");
        setEndTime("");
        setDays([]);
        setActive(true);
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!name || !discipline || days.length === 0 || !startTime || !endTime) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch(
                "/api/training-groups",
                {
                    method: "POST",
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
                    "Failed to create training group"
                );
            }

            toast.success(
                "Training group created successfully!"
            );

            resetForm();
            setOpen(false);

            onGroupCreated?.();
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button>
                        Add Training Group
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add Training Group
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="group-name">
                            Group Name
                        </Label>

                        <Input
                            id="group-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Group 1"
                            required
                        />
                    </div>

                    {/* Discipline */}
                    <div className="space-y-2">
                        <Label htmlFor="discipline">
                            Discipline
                        </Label>

                        <select
                            id="discipline"
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

                    {/* Days */}
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

                    {/* Start Time */}
                    <div className="space-y-2">
                        <Label htmlFor="start-time">
                            Start Time
                        </Label>

                        <Input
                            id="start-time"
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

                    {/* End Time */}
                    <div className="space-y-2">
                        <Label htmlFor="end-time">
                            End Time
                        </Label>

                        <Input
                            id="end-time"
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

                    {/* Active */}
                    <div className="flex items-center gap-3">
                        <input
                            id="active"
                            type="checkbox"
                            checked={active}
                            onChange={(event) =>
                                setActive(
                                    event.target.checked
                                )
                            }
                            className="h-4 w-4"
                        />

                        <Label htmlFor="active">
                            Active
                        </Label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setOpen(false)
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
                                ? "Creating..."
                                : "Create Group"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}