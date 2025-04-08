import resend from "@/lib/resend";
export default async function EditEmailTemplatePage({ params }) {
  const template = await fetchEmailTemplateById(params.templateId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Email Template</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={template.name}
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={template.description}
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            name="content"
            defaultValue={template.content}
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
            rows="6"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

async function fetchEmailTemplateById(id) {
  // Replace this with your actual data fetching logic
  return {
    id: 1,
    name: "Welcome Email",
    description: "Sent to new users upon registration.",
    content: "<p>Welcome to our platform!</p>",
  };
}
