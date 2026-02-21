"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GraduationCap, Sparkles, BookOpen, Clock, Target, Briefcase } from "lucide-react"

interface CurriculumFormProps {
  onSubmit: (data: {
    programName: string
    domain: string
    duration: number
    industryFocus: string
  }) => void
  isLoading: boolean
}

const DOMAINS = [
  "Computer Science - Artificial Intelligence & Data Science",
  "Computer Science - Software Engineering",
  "Computer Science - Cybersecurity",
  "Computer Science - Cloud Computing & DevOps",
  "Computer Science - Full Stack Development",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Biotechnology",
  "Business Administration (MBA)",
  "Data Science & Analytics",
  "Robotics & Automation",
  "Biomedical Engineering",
]

export function CurriculumForm({ onSubmit, isLoading }: CurriculumFormProps) {
  const [programName, setProgramName] = useState("")
  const [domain, setDomain] = useState("")
  const [duration, setDuration] = useState("")
  const [industryFocus, setIndustryFocus] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!programName || !domain || !duration) return
    onSubmit({
      programName,
      domain,
      duration: parseInt(duration),
      industryFocus,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="programName"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <GraduationCap className="h-4 w-4 text-primary" />
          Degree / Program Name
        </Label>
        <Input
          id="programName"
          placeholder="e.g., Bachelor of Technology (B.Tech)"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          className="h-12 border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="domain"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <BookOpen className="h-4 w-4 text-primary" />
          Domain / Specialization
        </Label>
        <Select value={domain} onValueChange={setDomain} required>
          <SelectTrigger
            id="domain"
            className="h-12 border-border bg-card text-foreground"
          >
            <SelectValue placeholder="Select a domain..." />
          </SelectTrigger>
          <SelectContent>
            {DOMAINS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="duration"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Clock className="h-4 w-4 text-primary" />
          Duration
        </Label>
        <Select value={duration} onValueChange={setDuration} required>
          <SelectTrigger
            id="duration"
            className="h-12 border-border bg-card text-foreground"
          >
            <SelectValue placeholder="Select duration..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Years (4 Semesters)</SelectItem>
            <SelectItem value="3">3 Years (6 Semesters)</SelectItem>
            <SelectItem value="4">4 Years (8 Semesters)</SelectItem>
            <SelectItem value="5">5 Years (10 Semesters)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="industryFocus"
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Briefcase className="h-4 w-4 text-primary" />
          Industry Focus
          <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="industryFocus"
          placeholder="e.g., FinTech, Healthcare, E-commerce"
          value={industryFocus}
          onChange={(e) => setIndustryFocus(e.target.value)}
          className="h-12 border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !programName || !domain || !duration}
        className="mt-2 h-12 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Generating Curriculum...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Curriculum
          </>
        )}
      </Button>

      <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Our AI will generate a complete semester-wise curriculum with subjects,
          topics, course outcomes, and Bloom&apos;s taxonomy mapping tailored to your
          specifications.
        </p>
      </div>
    </form>
  )
}
