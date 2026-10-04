"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

type TrainingGroup = {
    _id: string;
    name: string;
    discipline: string;
    days: string[];
    startTime: string;
    endTime: string;
    active: boolean;
};

type ShowTrainingGroupDialogProps = {
    group: TrainingGroup | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ShowTrainingGroupDialog({
    group,
    open,
    onOpenChange,
}: ShowTrainingGroupDialogProps) {
    if (!group) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Training Group Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Group Name
                        </p>

                        <p className="font-medium">
                            {group.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Discipline
                        </p>

                        <p className="font-medium">
                            {group.discipline}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Training Days
                        </p>

                        <p className="font-medium">
                            {group.days?.length
                                ? group.days.join(", ")
                                : "No days set"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Schedule
                        </p>

                        <p className="font-medium">
                            {group.startTime} →{" "}
                            {group.endTime}
                        </p>
                    </div>

                    <div>
                        <p className="mb-1 text-sm text-muted-foreground">
                            Status
                        </p>

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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}