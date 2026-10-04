"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import type { Participant } from "@/types/participant";
import { formatDate } from "@/lib/utils";

type ShowParticipantDialogProps = {
    participant: Participant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ShowParticipantDialog({
    participant,
    open,
    onOpenChange,
}: ShowParticipantDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Participant Details</DialogTitle>
                </DialogHeader>

                {participant && (
                    <div className="space-y-5">
                        {/* Member */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">
                                Member
                            </h3>

                            <div className="rounded-lg border p-3">
                                <p className="font-medium">
                                    {participant.member?.name || "Unknown"}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {participant.member?.phone || "-"}
                                </p>

                                {participant.member?.disciplines?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {participant.member.disciplines.map(
                                            (discipline) => (
                                                <Badge
                                                    key={discipline}
                                                    variant="outline"
                                                >
                                                    {discipline}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Competition */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">
                                Competition
                            </h3>

                            <div className="rounded-lg border p-3">
                                <p className="font-medium">
                                    {participant.competition?.name ||
                                        "Unknown"}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {participant.competition?.location ||
                                        "-"}
                                </p>

                                {participant.competition?.date && (
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(participant.competition.date)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">
                                Competition Payment
                            </h3>

                            <Badge
                                variant={
                                    participant.competitionPayment ===
                                    "Paid"
                                        ? "default"
                                        : "destructive"
                                }
                            >
                                {participant.competitionPayment}
                            </Badge>
                        </div>

                        {/* Documents */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">
                                Documents Status
                            </h3>

                            <Badge
                                variant={
                                    participant.documentsStatus ===
                                    "Complete"
                                        ? "default"
                                        : "secondary"
                                }
                            >
                                {participant.documentsStatus}
                            </Badge>
                        </div>

                        {/* Missing documents */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">
                                Missing Documents
                            </h3>

                            {participant.incompleteDocuments?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {participant.incompleteDocuments.map(
                                        (document) => (
                                            <Badge
                                                key={document}
                                                variant="outline"
                                            >
                                                {document}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No missing documents
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}