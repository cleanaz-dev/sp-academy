// components/courses/BasicInformationForm.jsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function BasicInformationForm({
  courseData,
  onUpdateCourseData,
}) {
  const handleInputChange = (field, value) => {
    onUpdateCourseData({
      ...courseData,
      basicInfo: {
        ...courseData.basicInfo,
        [field]: value,
      },
    });
  };

  const handleAddOutcome = () => {
    const newOutcome = "";
    onUpdateCourseData({
      ...courseData,
      basicInfo: {
        ...courseData.basicInfo,
        learningOutcomes: [
          ...courseData.basicInfo.learningOutcomes,
          newOutcome,
        ],
      },
    });
  };

  const handleRemoveOutcome = (index) => {
    const newOutcomes = courseData.basicInfo.learningOutcomes.filter(
      (_, i) => i !== index,
    );
    onUpdateCourseData({
      ...courseData,
      basicInfo: {
        ...courseData.basicInfo,
        learningOutcomes: newOutcomes,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Course Title</Label>
        <Input
          value={courseData.basicInfo.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Enter course title"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={courseData.basicInfo.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Enter course description"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Subject</Label>
          <Select
            value={courseData.basicInfo.subject}
            onValueChange={(value) => handleInputChange("subject", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Grade Level</Label>
          <Select
            value={courseData.basicInfo.gradeLevel}
            onValueChange={(value) => handleInputChange("gradeLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade level" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Grade {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Duration (in weeks)</Label>
        <Input
          type="number"
          value={courseData.basicInfo.duration}
          onChange={(e) => handleInputChange("duration", e.target.value)}
          placeholder="Enter course duration"
          min="1"
          max="52"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>Learning Outcomes</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOutcome}
          >
            Add Outcome
          </Button>
        </div>
        {courseData.basicInfo.learningOutcomes.map((outcome, index) => (
          <div key={index} className="mb-2 flex items-center gap-2">
            <Input
              value={outcome}
              onChange={(e) => {
                const newOutcomes = [...courseData.basicInfo.learningOutcomes];
                newOutcomes[index] = e.target.value;
                handleInputChange("learningOutcomes", newOutcomes);
              }}
              placeholder={`Learning outcome ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveOutcome(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
