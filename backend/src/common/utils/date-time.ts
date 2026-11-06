import { AppError } from "../errors/app-error.js";
import { env } from "../../config/env.js";
const VIETNAM_OFFSET = "+07:00";
export const combineDateAndTime = (date: string, time: Date) => {
  const hours = String(time.getUTCHours()).padStart(2, "0");
  const minutes = String(time.getUTCMinutes()).padStart(2, "0");
  return new Date(`${date}T${hours}:${minutes}:00${VIETNAM_OFFSET}`);
};
export const localDateString = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: env.APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export const validateBookingDate = (date: string) => {
  const selected = new Date(`${date}T00:00:00${VIETNAM_OFFSET}`);
  const today = new Date(`${localDateString()}T00:00:00${VIETNAM_OFFSET}`);
  if (Number.isNaN(selected.getTime()))
    throw new AppError(422, "INVALID_DATE", "Ngày đặt lịch không hợp lệ");
  if (selected < today)
    throw new AppError(
      422,
      "BOOKING_IN_PAST",
      "Không thể đặt lịch trong quá khứ",
    );
  const max = new Date(today);
  max.setDate(max.getDate() + env.MAX_BOOKING_DAYS_AHEAD);
  if (selected > max)
    throw new AppError(
      422,
      "BOOKING_TOO_FAR",
      `Chỉ được đặt lịch trước tối đa ${env.MAX_BOOKING_DAYS_AHEAD} ngày`,
    );
  return selected;
};
export const formatVietnamDateTime = (date: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: env.APP_TIMEZONE,
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
export const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000);
export const intervalsOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => startA < endB && endA > startB;
