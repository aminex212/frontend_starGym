"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Member = {
    _id: string;
    name: string;
    phone: string;
};

type AddPaymentDialogProps = {
    onPaymentCreated: () => void;
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

export default function AddPaymentDialog({
    onPaymentCreated,
}: AddPaymentDialogProps) {
    const [open, setOpen] = useState(false);

    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const [member, setMember] = useState("");
    const [amount, setAmount] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState(String(new Date().getFullYear()));
    const [paymentDate, setPaymentDate] = useState("");
    const [status, setStatus] = useState<"Paid" | "Unpaid">("Paid");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        async function fetchMembers() {
            try {
                setLoadingMembers(true);

                const response = await apiFetch("/api/members");

                if (!response.ok) {
                    throw new Error("Failed to fetch members");
                }

                const data = await response.json();

                setMembers(data);
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setLoadingMembers(false);
            }
        }

        fetchMembers();
    }, [open]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!member || !amount || !month) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setLoading(true);

            const response = await apiFetch("/api/payments", {
                method: "POST",
                body: JSON.stringify({
                    member,
                    amount: Number(amount),
                    paymentDate: paymentDate || undefined,
                    month,
                    year: Number(year),
                    status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create payment"
                );
            }

            toast.success("Payment created successfully!");

            setMember("");
            setAmount("");
            setMonth("");
            setYear(String(new Date().getFullYear()));
            setPaymentDate("");
            setStatus("Paid");

            setOpen(false);

            onPaymentCreated();
        } catch (error) {
            console.error("Error creating payment:", error);

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
                        Add Payment
                    </Button>
                }
            />

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Payment</DialogTitle>

                    <DialogDescription>
                        Add a payment for a gym member.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Member */}
                    <div className="space-y-2">
                        <Label htmlFor="member">
                            Member
                        </Label>

                        <select
                            id="member"
                            value={member}
                            onChange={(event) =>
                                setMember(event.target.value)
                            }
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                            required
                        >
                            <option value="">
                                {loadingMembers
                                    ? "Loading members..."
                                    : "Select a member"}
                            </option>

                            {members
                                .filter(
                                    (item) =>
                                        item.name
                                )
                                .map((item) => (
                                    <option
                                        key={item._id}
                                        value={item._id}
                                    >
                                        {item.name} - {item.phone}
                                    </option>
                                ))}
                        </select>
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
                            placeholder="Example: 300"
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
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="year"
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
                                : "Create Payment"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
