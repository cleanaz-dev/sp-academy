// app/emails/page.jsx
"use client";

import EmailSchedule from "@/components/email/admin/EmailSchedule";
import EmailUserTable from "@/components/email/admin/EmailUserTable";
import {
  getUsersWithEmailShare,
  getEmailTemplates,
  getEmailSchedules,
} from "@/lib/actions";
import { useState, useEffect } from "react";
import { FileText, Mail, Users } from "lucide-react";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EmailManager() {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [scheduledTime, setScheduledTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userData, templateData, schedules] = await Promise.all([
          getUsersWithEmailShare(),
          getEmailTemplates(),
          getEmailSchedules(),
        ]);
        setUsers(userData);
        setTemplates(templateData);
        setSchedules(schedules);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handlers
  const handleScheduleSave = async (schedule) => {
    if (!selectedTemplate) {
      toast.error("Please select an email template");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    try {
      const scheduleData = {
        scheduleName: schedule.scheduleName,
        templateId: selectedTemplate.id,
        frequency: schedule.frequency,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        timeOfDay: schedule.timeOfDay,
        daysOfWeek: schedule.daysOfWeek,
        timeZone: schedule.timeZone,
        recipients: selectedUsers.map((user) => ({
          id: user.id,
        })),
      };

      const response = await fetch("/api/email/schedules/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create schedule");
      }

      toast.success("Email schedule created successfully");
      setSelectedTemplate(null);
      setSelectedUsers([]);

      // Optionally reset other form fields or refresh the page
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSelectionChange = (selectedUserIds) => {
    setSelectedUsers(selectedUserIds);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate((prev) => (prev?.id === template.id ? null : template));
  };

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule((prev) => (prev?.id === schedule.id ? null : schedule));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <header className="border-b pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          Email Manager <MailCheck strokeWidth={1.5} />
        </h1>
        <p className="text-gray-600">Create and schedule email campaigns</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Templates + Schedules */}
        <div className="space-y-8 lg:col-span-1">
          {/* Email Templates */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">Email Templates</h2>
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border p-4">
              {templates && templates.length > 0 ? (
                templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-medium">{template.templateName}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {template.subject}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2">No Email Templates...</p>
                  <Link href={`/admin/emails/templates`}>
                    <Button>Create New Template</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Email Schedules */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">Email Schedules</h2>
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border p-4">
              {schedules && schedules.length > 0 ? (
                schedules.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSchedule(s)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedSchedule?.id === s.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-medium">{s.scheduleName}</h3>
                    <p className="mt-1 text-sm text-gray-500">{s.status}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-2">No Email Schedules...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Email Schedule Configuration */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold">Schedule Configuration</h2>
          </div>

          <EmailSchedule
            onSave={handleScheduleSave}
            disabled={!selectedTemplate || selectedUsers.length === 0}
            recipients={selectedUsers}
          />
        </div>
      </div>

      {/* Recipients Section - Full Width */}
      <div className="mt-8">
        <div className="mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">Recipients</h2>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-md border p-2"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <EmailUserTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>

      {/* Summary Panel */}
      {(selectedTemplate || selectedUsers.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedTemplate && (
                <span className="text-sm">
                  Template: <strong>{selectedTemplate.templateName}</strong>
                </span>
              )}
              <span className="text-sm">
                Recipients: <strong>{selectedUsers.length}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
