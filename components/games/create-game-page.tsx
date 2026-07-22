"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Wand2, ImageIcon } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { generateGameThumbnail } from "@/lib/actions"

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  rules: z.string().min(5, "Rules are required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  difficulty: z.coerce.number().min(1).max(10),
  type: z.enum(["Verbal", "Visual", "Acoustic", "Speech_Describe"]),
  code: z.string().optional(),
  theme: z.string().optional(),
})

type GameFormValues = z.infer<typeof formSchema>

export default function CreateGamePage() {
  const router = useRouter()
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")

  const form = useForm<GameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      rules: "",
      imageUrl: "",
      difficulty: 1,
      type: "Speech_Describe",
      code: "",
      theme: "",
    },
  })

const generateImage = async () => {
  if (!imagePrompt) return alert("Please enter an image prompt")
  setIsGeneratingImage(true)

  try {
    const result = await generateGameThumbnail(imagePrompt)

    if (!result.success) {
      throw new Error
    }

    form.setValue("imageUrl", result.imageUrl, { shouldValidate: true })
  } catch (error: any) {
    console.error("Failed to generate image", error)
    alert(error.message || "Failed to generate image")
  } finally {
    setIsGeneratingImage(false)
  }
}

  const onSubmit = async (values: GameFormValues) => {
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to create game")

      const newGame = await response.json()
      router.push(`/admin/games/generate`)
    } catch (error) {
      console.error(error)
      alert("Error creating game")
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Base Game</CardTitle>
          <CardDescription>
            Configure the core rules, engine type, and AI-generated artwork. Variations (languages) are added next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Game Title</FieldLabel>
                    <Input 
                      {...field} 
                      id={field.name} 
                      aria-invalid={fieldState.invalid} 
                      placeholder="e.g. Duck A Wear" 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Game Type */}
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-select-type">Game Type</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="form-select-type" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectItem value="Speech_Describe">Speech Describe</SelectItem>
                        <SelectItem value="Verbal">Verbal</SelectItem>
                        <SelectItem value="Visual">Visual</SelectItem>
                        <SelectItem value="Acoustic">Acoustic</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description <span className="text-muted-foreground font-normal italic">(Optional)</span></FieldLabel>
                  <Textarea 
                    {...field} 
                    id={field.name} 
                    aria-invalid={fieldState.invalid} 
                    placeholder="A fun game about..." 
                    className="resize-none" 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Rules */}
            <Controller
              name="rules"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Rules</FieldLabel>
                  <Textarea 
                    {...field} 
                    id={field.name} 
                    aria-invalid={fieldState.invalid} 
                    placeholder="1. Player must..." 
                    className="resize-none" 
                    rows={4} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Difficulty */}
            <Controller
              name="difficulty"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Difficulty (1-10)</FieldLabel>
                  <Input 
                    {...field} 
                    id={field.name} 
                    type="number" 
                    min="1" 
                    max="10" 
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* --- IMAGE GENERATION SECTION --- */}
            <div className="border rounded-md p-4 space-y-4 bg-muted/20">
              <FieldLabel>Game Thumbnail Generation</FieldLabel>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter prompt to generate cover art..." 
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={generateImage} disabled={isGeneratingImage}>
                  {isGeneratingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </div>
              
              {/* Hidden Input for Form State */}
              <Controller
                name="imageUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="hidden">
                    <Input {...field} id={field.name} type="hidden" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Image Preview */}
              {form.watch("imageUrl") ? (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-48 h-48 rounded-md overflow-hidden border">
                    <Image 
                      src={form.watch("imageUrl")!} 
                      alt="Generated Game Thumbnail" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">No image generated yet</span>
                </div>
              )}
              <FieldDescription>
                This temporary image will be permanently uploaded to S3 when you save the game.
              </FieldDescription>
            </div>

            {/* --- OPTIONAL FIELDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Engine Code <span className="text-muted-foreground italic font-normal">(Optional)</span></FieldLabel>
                    <Input 
                      {...field} 
                      id={field.name} 
                      aria-invalid={fieldState.invalid} 
                      placeholder="e.g. DUCK_A_WEAR" 
                    />
                    <FieldDescription>Used to map this DB entry to your frontend code registry.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="theme"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>UI Theme <span className="text-muted-foreground italic font-normal">(Optional)</span></FieldLabel>
                    <Input 
                      {...field} 
                      id={field.name} 
                      aria-invalid={fieldState.invalid} 
                      placeholder="e.g. Jungle, Dark Mode" 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving to S3 & Database...</>
                ) : (
                  "Save Game & Proceed"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}