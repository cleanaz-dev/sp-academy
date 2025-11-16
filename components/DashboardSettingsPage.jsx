"use client";

import { useState } from "react";
import { Button } from "@/components/old-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/old-ui/card";
import { Input } from "@/components/old-ui/input";
import { Label } from "@/components/old-ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/old-ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/old-ui/select";
import { Switch } from "@/components/old-ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/old-ui/tabs";
import { BookOpen, Bell, Lock, Palette, User, Save } from "lucide-react";
import Link from "next/link";

export default function SPAcademySettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between bg-white p-4 py-6">
        <h1 className="text-3xl font-bold text-blue-500">Settings</h1>
      </header>

      <main className="bg-white px-4">
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="preferences">Learning Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="bg-gradient-to-b from-indigo-200/25 to-yellow-100/25">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    defaultValue="John Doe"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    defaultValue="john@example.com"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Your username"
                    defaultValue="johndoe123"
                    className="bg-white"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-gradient-to-br from-blue-600 to-violet-600 hover:animate-pulse">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-gradient-to-b from-indigo-200/25 to-yellow-100/25">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="notifications"
                    className="flex items-center space-x-2"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Enable Notifications</span>
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                {notificationsEnabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="email-notifications"
                        className="flex items-center space-x-2"
                      >
                        <span>Email Notifications</span>
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="push-notifications"
                        className="flex items-center space-x-2"
                      >
                        <span>Push Notifications</span>
                      </Label>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="bg-gradient-to-b from-indigo-200/25 to-yellow-100/25">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <RadioGroup defaultValue="private">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="friends" />
                      <Label htmlFor="friends">Friends Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="data-sharing"
                    className="flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Allow Data Sharing for Personalized Learning</span>
                  </Label>
                  <Switch id="data-sharing" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-gradient-to-b from-indigo-200/25 to-yellow-100/25">
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>
                  Customize your learning experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select>
                    <SelectTrigger id="language" className="bg-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Default Difficulty Level</Label>
                  <Select>
                    <SelectTrigger id="difficulty" className="bg-white">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="flex items-center space-x-2">
                    <Palette className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </Label>
                  <Switch id="dark-mode" />
                </div> */}
              </CardContent>
              <CardFooter>
                <Button className="bg-gradient-to-br from-blue-600 to-violet-600 hover:animate-pulse">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
