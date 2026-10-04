"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type AddCompetitionDialogProps = {
    onCompetitionCreated: () => void;
};

export default function AddCompetitionDialog({
    onCompetitionCreated,
}: AddCompetitionDialogProps) {
    const [open, setOpen] = useState(false);

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!name || !date || !location) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const response = await apiFetch("/api/competitions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    date,
                    location,
                    description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create competition"
                );
            }

            toast.success("Competition created successfully!");

            setName("");
            setDate("");
            setLocation("");
            setDescription("");

            setOpen(false);

            onCompetitionCreated();
        } catch (error) {
            console.error(
                "Error creating competition:",
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Competition
                    </Button>
                }
            />

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Add Competition
                    </DialogTitle>

                    <DialogDescription>
                        Create a new gym competition.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Competition Name
                        </Label>

                        <Input
                            id="name"
                            placeholder="Example: Morocco Boxing Championship"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">
                            Date
                        </Label>

                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">
                            Location
                        </Label>

                        <Input
                            id="location"
                            placeholder="Example: Rabat"
                            value={location}
                            onChange={(event) =>
                                setLocation(event.target.value)
                            }
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description
                        </Label>

                        <Textarea
                            id="description"
                            placeholder="Competition description..."
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        />
                    </div>

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
                                ? "Creating..."
                                : "Create Competition"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}