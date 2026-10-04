"use client";

import { useCallback, useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AddPaymentDialog from "@/components/payments/AddPaymentDialog";
import UpdatePaymentDialog from "@/components/payments/UpdatePaymentDialog";
import { formatDate } from "@/lib/utils";

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

type Member = {
    _id: string;
    name: string;
    phone: string;
    disciplines?: string[];
};

type Payment = {
    _id: string;
    member: Member;
    amount: number;
    paymentDate: string;
    month: string;
    status: "Paid" | "Unpaid";
};

export default function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatePayment, setUpdatePayment] = useState<Payment | null>(null);
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
    const pageSize = 10;

    const fetchPayments = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await apiFetch("/api/payments");

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch payments");
            }

            const data = await response.json();
            setPayments(data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        void Promise.resolve().then(fetchPayments);
    }, [fetchPayments]);

    async function handleDelete(payment: Payment) {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await apiFetch(`/api/payments/${payment._id}`, {
                method: "DELETE",
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete payment"
                );
            }

            setPayments((current) =>
                current.filter((item) => item._id !== payment._id)
            );

            setPaymentToDelete(null);
            toast.success("Payment deleted successfully!");
        } catch (error) {
            console.error("Error deleting payment:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        }
    }

    const filteredPayments = payments.filter((payment) =>
        payment.member?.name
            ?.toLowerCase()
            .includes(search.trim().toLowerCase())
    );
    const totalPages = Math.max(
        1,
        Math.ceil(filteredPayments.length / pageSize)
    );
    const page = Math.min(currentPage, totalPages);
    const paginatedPayments = filteredPayments.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Payments
                    </h1>

                    <p className="text-muted-foreground">
                        Manage gym members payments
                    </p>
                </div>

                <AddPaymentDialog onPaymentCreated={fetchPayments} />
            </div>

            <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search by member name..."
                    aria-label="Search payments by member name"
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <div className="rounded-lg border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    Member
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Discipline
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Month
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Amount
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Payment Date
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Status
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
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No payments found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedPayments.map((payment) => (
                                    <tr
                                        key={payment._id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {payment.member?.name || "Unknown"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {payment.member?.disciplines?.join(", ") || "-"}
                                        </td>

                                        <td className="px-4 py-3">
                                            {payment.month}
                                        </td>

                                        <td className="px-4 py-3">
                                            {payment.amount} DH
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatDate(payment.paymentDate)}
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    payment.status === "Paid"
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {payment.status}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Actions for ${payment.member?.name}`}
                                                        />
                                                    }
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setUpdatePayment(payment)
                                                        }
                                                    >
                                                        Update
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setPaymentToDelete(payment)
                                                        }
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredPayments.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * pageSize + 1}-
                        {Math.min(page * pageSize, filteredPayments.length)} of{" "}
                        {filteredPayments.length} payments
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Previous page"
                            disabled={page === 1}
                            onClick={() => setCurrentPage(page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Next page"
                            disabled={page === totalPages}
                            onClick={() => setCurrentPage(page + 1)}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <UpdatePaymentDialog
                payment={updatePayment}
                open={updatePayment !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUpdatePayment(null);
                    }
                }}
                onUpdated={(updatedPayment) => {
                    setPayments((current) =>
                        current.map((item) =>
                            item._id === updatedPayment._id
                                ? updatedPayment
                                : item
                        )
                    );

                    setUpdatePayment(null);
                }}
            />

            <AlertDialog
                open={!!paymentToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setPaymentToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete payment?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {paymentToDelete
                                ? `Are you sure you want to delete the payment for ${paymentToDelete.member.name}?`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                if (paymentToDelete) {
                                    handleDelete(paymentToDelete);
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