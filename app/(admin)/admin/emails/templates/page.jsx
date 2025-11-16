import { Button } from "@/components/old-ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/old-ui/card";

export default async function EmailTemplatesPage() {
  // Fetch email templates from your database or Resend API
  const templates = await fetchEmailTemplates();

  return (
    <div className="space-y-6">
      <h1 className="mb-6 text-2xl font-bold">Email Templates</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <h2 className="text-xl font-semibold">{template.name}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="link" asChild>
                <a href={`/admin/emails/${template.id}`}>Edit</a>
              </Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Button asChild>
          <a href="/admin/emails/create">Create New Template</a>
        </Button>
      </div>
    </div>
  );
}

async function fetchEmailTemplates() {
  // Replace this with your actual data fetching logic
  return [
    {
      id: 1,
      name: "Welcome Email",
      description: "Sent to new users upon registration.",
    },
    {
      id: 2,
      name: "Course Completion Email",
      description: "Sent when a user completes a course.",
    },
  ];
}
