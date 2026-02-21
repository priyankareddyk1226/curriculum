export type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create"

export interface CourseOutcome {
  code: string
  description: string
  bloomLevel: BloomLevel
}

export interface Topic {
  name: string
  hours: number
  bloomLevel: BloomLevel
}

export interface Subject {
  code: string
  name: string
  credits: number
  type: "Core" | "Elective" | "Lab" | "Project"
  topics: Topic[]
  courseOutcomes: CourseOutcome[]
}

export interface Semester {
  semester: number
  subjects: Subject[]
  totalCredits: number
}

export interface Curriculum {
  programName: string
  domain: string
  totalSemesters: number
  totalCredits: number
  semesters: Semester[]
  programOutcomes: string[]
}

export const BLOOM_COLORS: Record<BloomLevel, { bg: string; text: string; border: string }> = {
  Remember: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Understand: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  Apply: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Analyze: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Evaluate: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Create: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
}

export const BLOOM_LEVELS: BloomLevel[] = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
]
