"use client"

import type React from "react"
<<<<<<< HEAD
=======

>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
import { useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { recognizeHandwriting } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PenTool, Upload, ImageIcon, Loader2, Copy, Save } from "lucide-react"
<<<<<<< HEAD
// import { addRecord } from "@/lib/record-service"
=======
import { addRecord } from "@/lib/record-service"
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
import { useRouter } from "next/navigation"

export default function HandwritingRecognitionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [recognizedText, setRecognizedText] = useState("")
<<<<<<< HEAD
  const [suggestedTitle, setSuggestedTitle] = useState("")
  const [suggestedProvider, setSuggestedProvider] = useState("")
=======
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
  const [loading, setLoading] = useState(false)
  const [savingRecord, setSavingRecord] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
<<<<<<< HEAD
      if (!selectedFile.type.startsWith("image/")) {
        alert("Please upload a valid image file.")
        return
      }
=======
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
      setFile(selectedFile)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setImage(event.target.result)
        }
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleRecognize = async () => {
<<<<<<< HEAD
    if (!image) {
      alert("Please upload an image first.")
      return
    }

    setLoading(true)
    try {
      const result = await recognizeHandwriting(image)
      setRecognizedText(result.text)
      
      // Set suggested values if available
      if (result.title) {
        setSuggestedTitle(result.title)
      }
      if (result.provider) {
        setSuggestedProvider(result.provider)
      }
=======
    if (!image) return

    setLoading(true)

    try {
      const text = await recognizeHandwriting(image)
      setRecognizedText(text)
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
    } catch (error) {
      console.error("Error recognizing handwriting:", error)
      alert("Failed to recognize handwriting. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyText = () => {
<<<<<<< HEAD
    if (recognizedText) {
      navigator.clipboard.writeText(recognizedText)
      alert("Text copied to clipboard!")
    }
=======
    navigator.clipboard.writeText(recognizedText)
    alert("Text copied to clipboard!")
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
  }

  const handleSaveAsRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
<<<<<<< HEAD
    if (!user || !recognizedText) {
      alert("Please recognize text before saving.")
      return
    }
=======
    if (!user || !recognizedText) return
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const provider = formData.get("provider") as string

    if (!title || !provider) {
<<<<<<< HEAD
      alert("Please fill in all required fields.")
=======
      alert("Please fill in all required fields")
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
      return
    }

    setSavingRecord(true)
<<<<<<< HEAD
    try {
      console.log("Starting to save record...")
      
      // Determine the record type based on content
      let recordType: "doctor_note" | "prescription" | "lab_result" | "imaging" | "other" = "doctor_note"
      if (recognizedText.toLowerCase().includes("prescription") || 
          recognizedText.toLowerCase().includes("medications:") ||
          recognizedText.toLowerCase().includes("diane") ||
          recognizedText.toLowerCase().includes("penicillin")) {
        recordType = "prescription"
      }
      
      console.log(`Saving record with type: ${recordType}`)

      // Create record data
      const recordData = {
        userId: user.uid,
        title,
        type: recordType,
        date: new Date(),
        provider,
        notes: recognizedText,
      }
      
      console.log("Record data prepared:", recordData)
      
      // Call addRecord with proper error handling
      let recordId
      try {
        // recordId = await addRecord(recordData, file || undefined)
        console.log("Record saved successfully with ID:", recordId)
      } catch (addRecordError) {
        console.error("Error in addRecord:", addRecordError)
        throw new Error(`Failed to add record: ${addRecordError}`)
      }
      
      // Check if we got a valid recordId back
      if (!recordId) {
        throw new Error("No record ID returned from addRecord")
      }
      
      console.log("Navigating to record page...")
      // Navigate to the record page after saving
      router.push(`/dashboard/records/${recordId}`)
    } catch (error) {
      console.error("Error saving record:", error)
      alert(`Failed to save record: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`)
      setSavingRecord(false) // Important: Reset saving state on error
=======

    try {
      const recordId = await addRecord(
        {
          userId: user.uid,
          title,
          type: "prescription",
          date: new Date(),
          provider,
          notes: recognizedText,
        },
        file || undefined,
      )

      router.push(`/dashboard/records/${recordId}`)
    } catch (error) {
      console.error("Error saving record:", error)
      alert("Failed to save record. Please try again.")
    } finally {
      setSavingRecord(false)
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
    }
  }

  return (
<<<<<<< HEAD
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Handwriting Recognition</h1>
=======
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Handwriting Recognition</h1>
      </div>
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Prescription & Handwriting Recognition
          </CardTitle>
          <CardDescription>
            Upload an image of handwritten medical notes or prescriptions to convert them to text
          </CardDescription>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <Tabs defaultValue="upload" className="w-full">
=======
          <Tabs defaultValue="upload">
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
            <TabsList className="mb-4">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="results" disabled={!recognizedText}>
                Results
              </TabsTrigger>
              <TabsTrigger value="save" disabled={!recognizedText}>
                Save as Record
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
<<<<<<< HEAD
=======

>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                  <div
                    className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {image ? (
<<<<<<< HEAD
                      <img
                        src={image}
                        alt="Uploaded prescription"
                        className="mx-auto h-full max-h-full object-contain"
                      />
=======
                      <div className="relative h-full w-full">
                        <img
                          src={image || "/placeholder.svg"}
                          alt="Uploaded prescription"
                          className="mx-auto h-full max-h-full object-contain"
                        />
                      </div>
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                    ) : (
                      <>
                        <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                        <p className="mb-1 text-lg font-medium">Upload an image</p>
                        <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
                      </>
                    )}
                  </div>
<<<<<<< HEAD
=======

>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                    <Button onClick={handleRecognize} disabled={!image || loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PenTool className="mr-2 h-4 w-4" />
                          Recognize Text
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Recognized Text</h3>
<<<<<<< HEAD
                  <Button variant="outline" size="sm" onClick={handleCopyText} disabled={!recognizedText}>
=======
                  <Button variant="outline" size="sm" onClick={handleCopyText}>
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </Button>
                </div>
                <div className="rounded-md bg-muted p-4">
<<<<<<< HEAD
                  <p className="whitespace-pre-line">{recognizedText || "No text recognized yet."}</p>
=======
                  <p className="whitespace-pre-line">{recognizedText}</p>
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                </div>
              </div>
            </TabsContent>

            <TabsContent value="save">
              <form onSubmit={handleSaveAsRecord} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Record Title</Label>
<<<<<<< HEAD
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Prescription from Dr. Smith" 
                    defaultValue={suggestedTitle}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Healthcare Provider</Label>
                  <Input 
                    id="provider" 
                    name="provider" 
                    placeholder="Dr. Smith / City Hospital" 
                    defaultValue={suggestedProvider}
                    required 
                  />
                </div>
=======
                  <Input id="title" name="title" placeholder="Prescription from Dr. Smith" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Healthcare Provider</Label>
                  <Input id="provider" name="provider" placeholder="Dr. Smith / City Hospital" required />
                </div>

>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                <div className="space-y-2">
                  <Label htmlFor="notes">Recognized Text</Label>
                  <Textarea
                    id="notes"
                    value={recognizedText}
                    onChange={(e) => setRecognizedText(e.target.value)}
                    className="min-h-32"
                    placeholder="The recognized text will appear here"
                  />
                </div>
<<<<<<< HEAD
=======

>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
                <Button type="submit" className="w-full" disabled={savingRecord}>
                  {savingRecord ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as Medical Record
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 8afcabb366ea21fa6b3d14acc5d5f4882f453888
