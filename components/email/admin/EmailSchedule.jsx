"use client";
import { useState } from "react";
import { Clock, Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import {
  addDays,
  addWeeks,
  addMonths,
  setHours,
  setMinutes,
  isFuture,
  parseISO,
  format,
} from "date-fns";
import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Pacific/Auckland",
];

const EmailSchedule = ({ templateId, recipients, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [schedule, setSchedule] = useState({
    scheduleName: "",
    frequency: "WEEKLY",
    timeOfDay: format(new Date(), "HH:mm"),
    daysOfWeek: [],
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    status: "ACTIVE",
  });

  const calculateNextSendTime = (schedule) => {
    try {
      if (!schedule.timeOfDay || !schedule.startDate) return null;

      const [hours, minutes] = schedule.timeOfDay.split(":");
      if (!hours || !minutes) return null; // Ensure valid time format

      let baseDate = parseISO(schedule.startDate);
      if (isNaN(baseDate)) return null; // Invalid startDate

      if (!isFuture(baseDate)) baseDate = new Date();

      let nextDate = setHours(
        setMinutes(baseDate, parseInt(minutes)),
        parseInt(hours),
      );
      const now = new Date();

      const dayToNumber = {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      };
      const currentDayNum = now.getDay();

      switch (schedule.frequency) {
        case "DAILY": {
          if (schedule.daysOfWeek.length === 0) {
            if (nextDate < now) nextDate = addDays(nextDate, 1);
            break;
          }
          const selectedDayNums = schedule.daysOfWeek.map(
            (day) => dayToNumber[day],
          );
          let daysToAdd = 0;
          if (selectedDayNums.includes(currentDayNum) && nextDate > now) {
            // Use today
          } else {
            do {
              daysToAdd++;
              nextDate = addDays(nextDate, 1);
            } while (!selectedDayNums.includes(nextDate.getDay()));
          }
          break;
        }
        case "WEEKLY": {
          if (schedule.daysOfWeek.length !== 1) return null;
          const targetDayNum = dayToNumber[schedule.daysOfWeek[0]];
          const daysUntilNext = (targetDayNum - currentDayNum + 7) % 7 || 7;
          nextDate = addDays(nextDate, daysUntilNext);
          if (nextDate < now) nextDate = addWeeks(nextDate, 1);
          break;
        }
        case "MULTI_DAY_WEEKLY": {
          if (schedule.daysOfWeek.length === 0) return null;
          const selectedDayNums = schedule.daysOfWeek.map(
            (day) => dayToNumber[day],
          );
          let daysToAdd = 0;
          if (selectedDayNums.includes(currentDayNum) && nextDate > now) {
            // Use today
          } else {
            do {
              daysToAdd++;
              nextDate = addDays(nextDate, 1);
            } while (!selectedDayNums.includes(nextDate.getDay()));
          }
          break;
        }
        case "MONTHLY": {
          const targetDay = parseISO(schedule.startDate).getDate();
          nextDate.setDate(targetDay);
          if (nextDate < now) nextDate = addMonths(nextDate, 1);
          const lastDay = new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + 1,
            0,
          ).getDate();
          if (targetDay > lastDay) nextDate.setDate(lastDay);
          break;
        }
        default:
          return null;
      }

      return formatInTimeZone(
        nextDate,
        schedule.timeZone,
        "yyyy-MM-dd'T'HH:mm:ssXXX",
      );
    } catch (error) {
      console.error("Error in calculateNextSendTime:", error);
      return null;
    }
  };

  const days = [
    { name: "Monday", short: "MON" },
    { name: "Tuesday", short: "TUE" },
    { name: "Wednesday", short: "WED" },
    { name: "Thursday", short: "THU" },
    { name: "Friday", short: "FRI" },
    { name: "Saturday", short: "SAT" },
    { name: "Sunday", short: "SUN" },
  ];

  const toggleDay = (day) => {
    setSchedule((prev) => {
      if (prev.frequency === "WEEKLY") {
        return {
          ...prev,
          daysOfWeek: prev.daysOfWeek.includes(day.short) ? [] : [day.short],
        };
      }
      return {
        ...prev,
        daysOfWeek: prev.daysOfWeek.includes(day.short)
          ? prev.daysOfWeek.filter((d) => d !== day.short)
          : [...prev.daysOfWeek, day.short],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "frequency" &&
      value === "WEEKLY" &&
      prev.daysOfWeek.length > 1
        ? { daysOfWeek: [prev.daysOfWeek[0]] }
        : {}),
    }));
  };

  const formatTimeForDisplay = (time, timezone) => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":");
      const today = new Date();
      today.setHours(parseInt(hours), parseInt(minutes));
      return formatInTimeZone(today, timezone, "HH:mm");
    } catch (error) {
      return time;
    }
  };

  const validateSchedule = () => {
    if (!schedule.scheduleName.trim()) {
      toast.error("Please enter a schedule name");
      return false;
    }
    if (schedule.frequency === "WEEKLY" && schedule.daysOfWeek.length !== 1) {
      toast.error("Please select exactly one day for Weekly schedule");
      return false;
    }
    if (
      schedule.frequency === "MULTI_DAY_WEEKLY" &&
      schedule.daysOfWeek.length === 0
    ) {
      toast.error(
        "Please select at least one day for Multi-Day Weekly schedule",
      );
      return false;
    }
    if (!schedule.timeOfDay) {
      toast.error("Please select a time");
      return false;
    }
    if (!schedule.startDate) {
      toast.error("Please select a start date");
      return false;
    }
    return true;
  };

  const handleSaveClick = async () => {
    if (!validateSchedule()) return;
    setIsSaving(true);
    try {
      const [hours, minutes] = schedule.timeOfDay.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes));
      const tzOffset = getTimezoneOffset(schedule.timeZone);
      const utcTime = new Date(timeDate.getTime() - tzOffset);

      const scheduleData = {
        ...schedule,
        templateId,
        recipients,
        timeOfDay: format(utcTime, "HH:mm"),
        daysOfWeek: schedule.daysOfWeek.join(","),
        startDate: format(parseISO(schedule.startDate), "yyyy-MM-dd"),
        endDate: schedule.endDate
          ? format(parseISO(schedule.endDate), "yyyy-MM-dd")
          : null,
      };

      onSave(scheduleData);
      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Error saving schedule");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white p-6">
      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Schedule Name
        </label>
        <input
          type="text"
          name="scheduleName"
          value={schedule.scheduleName}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 p-2"
          placeholder="Enter schedule name"
        />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Frequency
          </label>
          <select
            name="frequency"
            value={schedule.frequency}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 p-2"
          >
            <option value="DAILY">Daily (Any Days)</option>
            <option value="WEEKLY">Weekly (One Day)</option>
            <option value="MULTI_DAY_WEEKLY">Multi-Day Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
          <div className="mt-2 text-sm text-gray-500">
            {schedule.frequency === "DAILY" && "Send daily or on selected days"}
            {schedule.frequency === "WEEKLY" && "Send once per week on one day"}
            {schedule.frequency === "MULTI_DAY_WEEKLY" &&
              "Send on multiple days per week"}
            {schedule.frequency === "MONTHLY" &&
              "Send once per month on the same date"}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <select
            name="timeZone"
            value={schedule.timeZone}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 p-2"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(schedule.frequency === "DAILY" ||
        schedule.frequency === "WEEKLY" ||
        schedule.frequency === "MULTI_DAY_WEEKLY") && (
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {schedule.frequency === "WEEKLY" ? "Select Day" : "Select Days"}
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {days.map((day) => (
              <button
                key={day.short}
                onClick={() => toggleDay(day)}
                className={`rounded-lg p-2 text-sm font-medium transition-all duration-200 ${
                  schedule.daysOfWeek.includes(day.short)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } `}
              >
                <span className="hidden md:block">{day.name}</span>
                <span className="block md:hidden">{day.short}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {schedule.frequency === "WEEKLY"
              ? "Select one day"
              : "Select one or more days"}
          </p>
        </div>
      )}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="time"
              name="timeOfDay"
              value={schedule.timeOfDay}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={schedule.startDate}
            onChange={handleChange}
            min={format(new Date(), "yyyy-MM-dd")}
            className="block w-full rounded-lg border border-gray-300 p-2"
          />
        </div>
      </div>
      <div className="mb-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            End Date (Optional)
          </label>
          <input
            type="date"
            name="endDate"
            value={schedule.endDate}
            onChange={handleChange}
            min={schedule.startDate}
            className="block w-full rounded-lg border border-gray-300 p-2"
          />
        </div>
      </div>
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Summary</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Name: {schedule.scheduleName}</p>
          <p>Frequency: {schedule.frequency.replace("_", " ")}</p>
          {(schedule.frequency === "DAILY" ||
            schedule.frequency === "WEEKLY" ||
            schedule.frequency === "MULTI_DAY_WEEKLY") &&
            schedule.daysOfWeek.length > 0 && (
              <p>
                Days:{" "}
                {schedule.daysOfWeek
                  .map((day) => days.find((d) => d.short === day)?.name)
                  .join(", ")}
              </p>
            )}
          <p>
            Time: {formatTimeForDisplay(schedule.timeOfDay, schedule.timeZone)}{" "}
            ({schedule.timeZone})
          </p>
          <p>Start Date: {format(parseISO(schedule.startDate), "PP")}</p>
          {schedule.endDate && (
            <p>End Date: {format(parseISO(schedule.endDate), "PP")}</p>
          )}
          {schedule.timeOfDay &&
            schedule.startDate &&
            (() => {
              const nextSendTime = calculateNextSendTime(schedule);
              if (!nextSendTime) return null;
              return (
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="font-medium text-blue-700">
                    Next email will be sent on:
                  </p>
                  <p className="text-blue-600">
                    {formatInTimeZone(
                      parseISO(nextSendTime),
                      schedule.timeZone,
                      "PPpp (z)",
                    )}
                  </p>
                </div>
              );
            })()}
        </div>
      </div>
      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600 disabled:bg-gray-400"
      >
        <Save className="h-5 w-5" />
        <span>{isSaving ? "Saving..." : "Save Schedule"}</span>
      </button>
    </div>
  );
};

export default EmailSchedule;
