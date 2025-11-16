"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import { Input } from "@/components/old-ui/input";
import { Button } from "@/components/old-ui/button";
import { Label } from "@/components/old-ui/label";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { set } from "lodash";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/old-ui/select";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false },
);

const VARIABLES = [
  { name: "{{name}}", description: "User's full name" },
  { name: "{{email}}", description: "User's email address" },
  { name: "{{course}}", description: "Course title" },
  { name: "{{date}}", description: "Current date" },
];

export default function CreateEmailTemplatePage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [designHtml, setDesignHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [preview, setPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [handlebarsType, setHandlebarsType] = useState("");

  const validateTemplate = () => {
    if (!subject.trim()) return "Subject is required";
    if (!content.trim()) return "Content is required";
    if (!designHtml.includes("{{emailContent}}")) {
      return "Design HTML must include {{emailContent}} placeholder";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateTemplate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/email/template/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName,
          subject,
          content,
          designHtml,
          handlebarsType,
          version: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save template");
      }

      toast.success("Template saved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save template");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreview = () => {
    if (preview) {
      setPreview(false);
    } else {
      const sanitizedContent = DOMPurify.sanitize(content);
      const finalHtml = designHtml
        .replace("{{emailContent}}", sanitizedContent)
        .replace(/\{\{.*?\}\}/g, (match) => {
          const variable = match.slice(2, -2); // Remove the curly braces
          return `<span style="color: #dc2626; background: #fef2f2; padding: 2px 4px; border-radius: 4px;">${match}</span>`;
        });

      setPreviewHtml(finalHtml);
      setPreview(true);
    }
  };

  const handleSendTestEmail = async () => {
    const validationError = validateTemplate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid test email address");
      return;
    }

    setIsSending(true);
    try {
      // Find the content div in your design and replace its content
      const parser = new DOMParser();
      const doc = parser.parseFromString(designHtml, "text/html");
      const contentDiv = doc.querySelector(".content"); // Assuming you have a div with class 'content'
      if (contentDiv) {
        contentDiv.innerHTML = content; // Insert the email content
      }

      // Get the modified HTML
      const modifiedHtml = doc.documentElement.outerHTML;

      const response = await fetch("/api/email/send-test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content: modifiedHtml,
          testEmail,
        }),
      });

      if (!response.ok) throw new Error("Failed to send test email");

      toast.success("Test email sent successfully!");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setIsSending(false);
    }
  };

  const insertVariable = (variable) => {
    setContent((prev) => `${prev} ${variable}`);
  };

  const handleGenerateDesign = async () => {
    setGenerating(true);
    setDesignHtml("");
    setPreview("");
    try {
      const response = await fetch("/api/email/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, subject }),
      });
      const data = await response.json();
      setDesignHtml(data.design);
    } catch (error) {
      console.error("Error generating design:", error);
    } finally {
      setGenerating(false);
    }
  };
  const handleClearDesign = () => {
    setDesignHtml("");
    setPreview(false);
    setPreviewHtml("");
  };

  const handleHandlerChange = (value) => {
    setHandlebarsType(value);
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Create Email Template</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Content Section */}

          <div className="space-y-4">
            <div>
              <Label>Template Name *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter a template name"
                required
              />
            </div>

            <div>
              <Label>Subject *</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter a subject"
                required
              />
            </div>

            <div>
              <Label>Handlebar Type* *</Label>
              <Select
                value={handlebarsType}
                onValueChange={handleHandlerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    <SelectItem value="Lesson">Lesson</SelectItem>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Exercise">Exercise</SelectItem>
                    <SelectItem value="Course">Course</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email Content *</Label>
              <div className="overflow-hidden rounded-lg border">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  theme="snow"
                  placeholder="Hi {{name}}, welcome to our platform..."
                  className="bg-white"
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerateDesign}
                className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                {generating ? "Generating..." : "Generate Design"}
              </button>

              <button
                type="button"
                onClick={handleClearDesign}
                className="rounded-md bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
              >
                Clear Design
              </button>
            </div>

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((variable) => (
                  <button
                    key={variable.name}
                    type="button"
                    onClick={() => insertVariable(variable.name)}
                    className="rounded-md bg-gray-100 px-2 py-1 text-sm transition-colors hover:bg-gray-200"
                    title={variable.description}
                  >
                    {variable.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Design Section */}
          <div className="space-y-4">
            <div>
              <Label>Email Design (HTML) *</Label>
              <div className="overflow-hidden rounded-lg border">
                <CodeEditor
                  value={designHtml}
                  language="html"
                  onChange={(e) => setDesignHtml(e.target.value)}
                  padding={15}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    backgroundColor: "#f8fafc",
                    minHeight: "400px",
                    maxHeight: "50vh",
                    overflowY: "auto",
                  }}
                  placeholder="Enter your HTML design here..."
                />
              </div>
            </div>

            <div>
              <Label>Test Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 border-t pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
          <Button type="button" onClick={handleTogglePreview} variant="outline">
            {preview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button
            type="button"
            onClick={handleSendTestEmail}
            variant="secondary"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Test Email"}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      {preview && (
        <div className="mt-8 rounded-lg border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Email Preview</h2>
            <div className="text-sm text-gray-500">
              Subject: {subject || "(No subject)"}
            </div>
          </div>
          <iframe
            srcDoc={previewHtml}
            style={{
              width: "100%",
              height: "600px",
              border: "none",
              transformOrigin: "0 0",
            }}
            title="Email Preview"
          />
        </div>
      )}
    </div>
  );
}
