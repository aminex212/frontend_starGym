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
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Member = {
    _id: string;
    name: string;
    phone: string;
};

type Payment = {
    _id: string;
    member: Member;
    amount: number;
    paymentDate: string;
    month: string;
    year: number;
    status: "Paid" | "Unpaid";
};

type UpdatePaymentDialogProps = {
    payment: Payment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (payment: Payment) => void;
};

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function UpdatePaymentDialog({
    payment,
    open,
    onOpenChange,
    onUpdated,
}: UpdatePaymentDialogProps) {
    const [amount, setAmount] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [paymentDate, setPaymentDate] = useState("");
    const [status, setStatus] = useState<"Paid" | "Unpaid">("Unpaid");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!payment) return;

        void Promise.resolve().then(() => {
            setAmount(String(payment.amount));
            setMonth(payment.month);
            setYear(String(payment.year || new Date().getFullYear()));
            setStatus(payment.status);

            if (payment.paymentDate) {
                setPaymentDate(
                    new Date(payment.paymentDate)
                        .toISOString()
                        .split("T")[0]
                );
            } else {
                setPaymentDate("");
            }
        });
    }, [payment]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!payment) return;

        try {
            setLoading(true);

            const response = await apiFetch(`/api/payments/${payment._id}`, {
                method: "PUT",
                body: JSON.stringify({
                    amount: Number(amount),
                    month,
                    year: Number(year),
                    paymentDate,
                    status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update payment"
                );
            }

            toast.success("Payment updated successfully!");

            onUpdated(data.payment);
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating payment:", error);

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
                        Update Payment
                    </DialogTitle>

                    <DialogDescription>
                        Update payment information.
                    </DialogDescription>
                </DialogHeader>

                {payment && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Member */}
                        <div className="space-y-2">
                            <Label>Member</Label>

                            <Input
                                value={payment.member?.name || "Unknown"}
                                disabled
                            />
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">
                                Amount (DH)
                            </Label>

                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                                required
                            />
                        </div>

                        {/* Month */}
                        <div className="space-y-2">
                            <Label htmlFor="month">
                                Month
                            </Label>

                            <select
                                id="month"
                                value={month}
                                onChange={(event) =>
                                    setMonth(event.target.value)
                                }
                                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                                required
                            >
                                <option value="">
                                    Select month
                                </option>

                                {months.map((item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="space-y-2">
                            <Label htmlFor="update-year">Year</Label>
                            <Input
                                id="update-year"
                                type="number"
                                min="2000"
                                max="2100"
                                value={year}
                                onChange={(event) => setYear(event.target.value)}
                                required
                            />
                        </div>

                        {/* Payment Date */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentDate">
                                Payment Date
                            </Label>

                            <Input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(event) =>
                                    setPaymentDate(event.target.value)
                                }
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Status
                            </Label>

                            <select
                                id="status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as
                                            | "Paid"
                                            | "Unpaid"
                                    )
                                }
                                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                            >
                                <option value="Paid">
                                    Paid
                                </option>

                                <option value="Unpaid">
                                    Unpaid
                                </option>
                            </select>
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
                                    : "Update Payment"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
