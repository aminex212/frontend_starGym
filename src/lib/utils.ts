export { cn } from "cn";

export function getCurrentMonth() {
	return new Date().toISOString().slice(0, 7);
}

export const month = getCurrentMonth();

export function formatDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
	}).format(new Date(value));
}
