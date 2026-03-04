import { DateTime } from "luxon";

/**
 * Backend-ից եկող datetime-ը ("YYYY-MM-DD HH:mm:ss" կամ "YYYY-MM-DD HH:mm") մենք ընկալում ենք որպես BUSINESS local time.
 * ISO դեպքում՝ պահում ենք zone-ը և փոխում business zone-ի։
 */
export function parseBizToJS(dt: string | null | undefined, timezone: string) {
    if (!dt) return null;

    if (dt.includes("T")) {
        const x = DateTime.fromISO(dt, { setZone: true }).setZone(timezone);
        return x.isValid ? x.toJSDate() : null;
    }

    const norm = dt.length === 16 ? `${dt}:00` : dt; // add seconds
    const x = DateTime.fromFormat(norm, "yyyy-MM-dd HH:mm:ss", { zone: timezone });
    return x.isValid ? x.toJSDate() : null;
}

export function fmtBizFromJS(date: Date, timezone: string) {
    return DateTime.fromJSDate(date).setZone(timezone).toFormat("yyyy-MM-dd HH:mm:ss");
}

export function fmtBizHMFromJS(date: Date, timezone: string) {
    return DateTime.fromJSDate(date).setZone(timezone).toFormat("HH:mm");
}

export function fmtBizYMDFromJS(date: Date, timezone: string) {
    return DateTime.fromJSDate(date).setZone(timezone).toFormat("yyyy-MM-dd");
}