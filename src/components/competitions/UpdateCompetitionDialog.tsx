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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Competition = {
    _id: string;
    name: string;
    date: string;
    location: string;
    description?: string;
};

type UpdateCompetitionDialogProps = {
    competition: Competition | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (competition: Competition) => void;
};

export default function UpdateCompetitionDialog({
    competition,
    open,
    onOpenChange,
    onUpdated,
}: UpdateCompetitionDialogProps) {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!competition) return;

        void Promise.resolve().then(() => {
            setName(competition.name);
            setLocation(competition.location);
            setDescription(competition.description || "");
            setDate(
                competition.date
                    ? new Date(competition.date).toISOString().split("T")[0]
                    : ""
            );
        });
    }, [competition]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!competition) return;

        try {
            setLoading(true);

            const response = await apiFetch(`/api/competitions/${competition._id}`, {
                method: "PUT",
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
                    data.message ||
                        "Failed to update competition"
                );
            }

            toast.success("Competition updated successfully!");

            onUpdated(data.competition);
            onOpenChange(false);
        } catch (error) {
            console.error(
                "Error updating competition:",
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Update Competition
                    </DialogTitle>

                    <DialogDescription>
                        Update competition information.
                    </DialogDescription>
                </DialogHeader>

                {competition && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="competition-name">
                                Competition Name
                            </Label>

                            <Input
                                id="competition-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="competition-date">
                                Date
                            </Label>

                            <Input
                                id="competition-date"
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
                            <Label htmlFor="competition-location">
                                Location
                            </Label>

                            <Input
                                id="competition-location"
                                value={location}
                                onChange={(event) =>
                                    setLocation(event.target.value)
                                }
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="competition-description">
                                Description
                            </Label>

                            <Textarea
                                id="competition-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    onOpenChange(false)
                                }
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Updating..."
                                    : "Update Competition"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
