"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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

import AddTrainingGroupDialog from "@/components/training-groups/AddTrainingGroupDialog";
import ShowTrainingGroupDialog from "@/components/training-groups/ShowTrainingGroupDialog";
import UpdateTrainingGroupDialog from "@/components/training-groups/UpdateTrainingGroupDialog";

type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    days: string[];
    startTime: string;
    endTime: string;
    active: boolean;
};

export default function TrainingGroupsPage() {
    const [groups, setGroups] = useState<TrainingGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const [groupToDelete, setGroupToDelete] =
        useState<TrainingGroup | null>(null);

    const [selectedGroup, setSelectedGroup] =
        useState<TrainingGroup | null>(null);

    const [updateGroup, setUpdateGroup] =
        useState<TrainingGroup | null>(null);

    async function fetchGroups() {
        try {
            setLoading(true);

            const response = await apiFetch(
                "/api/training-groups"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch training groups"
                );
            }

            setGroups(data);
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

    useEffect(() => {
        fetchGroups();
    }, []);

    async function handleDelete(group: TrainingGroup) {
        try {
            const response = await apiFetch(
                `/api/training-groups/${group._id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete training group"
                );
            }

            setGroups((current) =>
                current.filter(
                    (item) => item._id !== group._id
                )
            );

            setGroupToDelete(null);

            toast.success(
                "Training group deleted successfully"
            );
        } catch (error) {
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Training Groups
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage training groups, disciplines and
                        schedules.
                    </p>
                </div>

                <AddTrainingGroupDialog
                    onGroupCreated={fetchGroups}
                />
            </div>

            {/* Content */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        All Training Groups
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Loading training groups...
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No training groups found.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Group
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Discipline
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Schedule
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Days
                                        </th>

                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {groups.map((group) => (
                                        <tr
                                            key={group._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-4 font-medium">
                                                {group.name}
                                            </td>

                                            <td className="px-4 py-4">
                                                {group.discipline}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            group.startTime
                                                        }{" "}
                                                        →{" "}
                                                        {
                                                            group.endTime
                                                        }
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                {group.days?.length
                                                    ? group.days.join(", ")
                                                    : "No days set"}
                                            </td>

                                            <td className="px-4 py-4">
                                                <Badge
                                                    variant={
                                                        group.active
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {group.active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`Actions for ${group.name}`}
                                                            />
                                                        }
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => setSelectedGroup(group)}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Show
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => setUpdateGroup(group)}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Update
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setGroupToDelete(
                                                                    group
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
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
                </CardContent>
            </Card>

            <ShowTrainingGroupDialog
                group={selectedGroup}
                open={!!selectedGroup}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedGroup(null);
                    }
                }}
            />

            <UpdateTrainingGroupDialog
                group={updateGroup}
                open={!!updateGroup}
                onOpenChange={(open) => {
                    if (!open) {
                        setUpdateGroup(null);
                    }
                }}
                onUpdated={(updatedGroup) => {
                    setGroups((current) =>
                        current.map((item) =>
                            item._id === updatedGroup._id
                                ? updatedGroup
                                : item
                        )
                    );

                    setUpdateGroup(null);
                }}
            />

            {/* Delete confirmation */}
            <AlertDialog
                open={!!groupToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setGroupToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete training group?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {groupToDelete
                                ? `Are you sure you want to delete ${groupToDelete.name}?`
                                : "This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                if (groupToDelete) {
                                    handleDelete(
                                        groupToDelete
                                    );
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