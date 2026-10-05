"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UpdateCompetitionDialog from "@/components/competitions/UpdateCompetitionDialog";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";

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

import AddCompetitionDialog from "@/components/competitions/AddCompetitionDialog";

type Competition = {
    _id: string;
    name: string;
    date: string;
    location: string;
    description?: string;
};

export default function CompetitionsPage() {
    const router = useRouter();
    const [competitions, setCompetitions] = useState<Competition[]>(
        []
    );

    const [loading, setLoading] = useState(true);
    const [updateCompetition, setUpdateCompetition] = useState<Competition | null>(null);
    const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);

    const fetchCompetitions = useCallback(async () => {
        try {
            setLoading(true);

            const response = await apiFetch("/api/competitions");

            if (response.status === 401) {
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch competitions"
                );
            }

            const data = await response.json();

            setCompetitions(data);
        } catch (error) {
            console.error(
                "Error fetching competitions:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        void Promise.resolve().then(fetchCompetitions);
    }, [fetchCompetitions]);

    async function handleDelete(
        competition: Competition
    ) {
        try {
            const response = await apiFetch(`/api/competitions/${competition._id}`, {
                method: "DELETE",
            });

            if (response.status === 401) {
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete competition"
                );
            }

            setCompetitions((current) =>
                current.filter(
                    (item) =>
                        item._id !== competition._id
                )
            );

            setCompetitionToDelete(null);
            toast.success("Competition deleted successfully!");
        } catch (error) {
            console.error(
                "Error deleting competition:",
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
        <div className="space-y-6">
            {/* Header */}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Competitions
                    </h1>

                    <p className="text-muted-foreground">
                        Manage gym competitions
                    </p>
                </div>

                <AddCompetitionDialog
                    onCompetitionCreated={
                        fetchCompetitions
                    }
                />
            </div>

            {/* Table */}

            <div className="rounded-lg border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    Name
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Date
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Location
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Description
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Loading competitions...
                                    </td>
                                </tr>
                            ) : competitions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No competitions found.
                                    </td>
                                </tr>
                            ) : (
                                competitions.map(
                                    (competition) => (
                                        <tr
                                            key={
                                                competition._id
                                            }
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {
                                                    competition.name
                                                }
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatDate(competition.date)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {
                                                    competition.location
                                                }
                                            </td>

                                            <td className="max-w-xs px-4 py-3">
                                                <span className="line-clamp-2">
                                                    {competition.description ||
                                                        "—"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`Actions for ${competition.name}`}
                                                            />
                                                        }
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => setUpdateCompetition(competition)}
                                                        >
                                                            Update
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setCompetitionToDelete(competition)
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
            </div>

            <UpdateCompetitionDialog
                competition={updateCompetition}
                open={updateCompetition !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUpdateCompetition(null);
                    }
                }}
                onUpdated={(updatedCompetition) => {
                    setCompetitions((current) =>
                        current.map((item) =>
                            item._id === updatedCompetition._id
                                ? updatedCompetition
                                : item
                        )
                    );

                    setUpdateCompetition(null);
                }}
            />

            <AlertDialog
                open={!!competitionToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setCompetitionToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete competition?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {competitionToDelete
                                ? `Are you sure you want to delete ${competitionToDelete.name}?`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                if (competitionToDelete) {
                                    handleDelete(competitionToDelete);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
