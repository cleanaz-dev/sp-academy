// components/courses/CourseMaterialsForm.jsx
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Link, FileText, Video, Image } from "lucide-react";

export default function CourseMaterialsForm({ courseData, onUpdateCourseData }) {
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newResourceType, setNewResourceType] = useState("link");

  const handleOverviewChange = (value) => {
    onUpdateCourseData({
      ...courseData,
      materials: {
        ...courseData.materials,
        overview: value,
      },
    });
  };

  const addResource = () => {
    if (newResourceUrl.trim()) {
      const newResource = {
        id: Date.now(),
        url: newResourceUrl,
        type: newResourceType,
        title: newResourceUrl.split("/").pop() || "Resource",
      };

      onUpdateCourseData({
        ...courseData,
        materials: {
          ...courseData.materials,
          resources: [...courseData.materials.resources, newResource],
        },
      });

      setNewResourceUrl("");
      setNewResourceType("link");
    }
  };

  const removeResource = (resourceId) => {
    onUpdateCourseData({
      ...courseData,
      materials: {
        ...courseData.materials,
        resources: courseData.materials.resources.filter(
          (resource) => resource.id !== resourceId
        ),
      },
    });
  };

  const updateResourceTitle = (resourceId, newTitle) => {
    onUpdateCourseData({
      ...courseData,
      materials: {
        ...courseData.materials,
        resources: courseData.materials.resources.map((resource) =>
          resource.id === resourceId
            ? { ...resource, title: newTitle }
            : resource
        ),
      },
    });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Course Overview</Label>
        <Textarea
          value={courseData.materials.overview}
          onChange={(e) => handleOverviewChange(e.target.value)}
          placeholder="Provide a detailed overview of the course materials and how they should be used..."
          rows={6}
        />
      </div>

      <div>
        <Label>Course Resources</Label>
        <Card className="p-6 mt-2">
          <div className="space-y-4">
            {/* Add new resource */}
            <div className="flex gap-2">
              <Select
                value={newResourceType}
                onValueChange={setNewResourceType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                placeholder="Enter resource URL"
                className="flex-1"
              />
              <Button onClick={addResource} disabled={!newResourceUrl.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Resource list */}
            <div className="space-y-2">
              {courseData.materials.resources.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No resources added yet
                </div>
              ) : (
                courseData.materials.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-2 bg-gray-50 p-3 rounded-md"
                  >
                    {getResourceIcon(resource.type)}
                    <Input
                      value={resource.title}
                      onChange={(e) =>
                        updateResourceTitle(resource.id, e.target.value)
                      }
                      className="flex-1"
                    />
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {resource.url}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(resource.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Materials Section */}
      <div>
        <Label>Additional Notes</Label>
        <Textarea
          value={courseData.materials.additionalNotes || ""}
          onChange={(e) =>
            onUpdateCourseData({
              ...courseData,
              materials: {
                ...courseData.materials,
                additionalNotes: e.target.value,
              },
            })
          }
          placeholder="Any additional notes or instructions for the course materials..."
          rows={4}
        />
      </div>
    </div>
  );
}