import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { jsonrepair } from "jsonrepair"
import { z } from "zod"

const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const
const BLOOM_MAP: Record<string, (typeof BLOOM_LEVELS)[number]> = {
  Plan: "Apply",
  Communicate: "Create",
  Design: "Create",
  Implement: "Apply",
  Demonstrate: "Apply",
  Identify: "Remember",
  Describe: "Understand",
  Explain: "Understand",
  Outline: "Understand",
  Use: "Apply",
  Select: "Analyze",
  Assess: "Evaluate",
  Construct: "Create",
  Develop: "Create",
  Produce: "Create",
  Configure: "Apply",
  Conduct: "Apply",
  Measure: "Analyze",
  Reflect: "Evaluate",
}

function extractCurriculum(text: string): unknown {
  let trimmed = text.trim()
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) trimmed = codeBlockMatch[1].trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error("No JSON found")
  const raw = jsonMatch[0]
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    try {
      parsed = JSON.parse(jsonrepair(raw))
    } catch (e) {
      throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : "parse failed"}`)
    }
  }
  return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed
}

export const maxDuration = 60

const SUBJECT_TYPES = ["Core", "Elective", "Lab", "Project"] as const

function normalizeBloom(v: unknown): (typeof BLOOM_LEVELS)[number] {
  const s = String(v ?? "")
  if (BLOOM_LEVELS.includes(s as (typeof BLOOM_LEVELS)[number])) return s as (typeof BLOOM_LEVELS)[number]
  return BLOOM_MAP[s] ?? "Understand"
}

function toNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v
  const n = parseInt(String(v ?? "0"), 10)
  return Number.isNaN(n) ? 0 : n
}

function toString(v: unknown): string {
  if (typeof v === "string") return v
  return String(v ?? "")
}

const bloomLevel = z.unknown().transform(normalizeBloom)
const subjectType = z.unknown().transform((v) => (SUBJECT_TYPES.includes(String(v ?? "") as (typeof SUBJECT_TYPES)[number]) ? (String(v) as (typeof SUBJECT_TYPES)[number]) : "Core"))

const courseOutcomeSchema = z.object({
  code: z.unknown().transform(toString).pipe(z.string()).catch("CO1"),
  description: z.unknown().transform(toString).pipe(z.string()).catch(""),
  bloomLevel,
}).passthrough()

const topicSchema = z.object({
  name: z.unknown().transform(toString).pipe(z.string()).catch(""),
  hours: z.unknown().transform(toNumber),
  bloomLevel,
}).passthrough()

const subjectSchema = z.object({
  code: z.unknown().transform(toString).pipe(z.string()).catch(""),
  name: z.unknown().transform(toString).pipe(z.string()).catch(""),
  credits: z.unknown().transform(toNumber),
  type: subjectType,
  topics: z.array(z.unknown()).transform((arr) => (Array.isArray(arr) ? arr.map((t) => topicSchema.safeParse(t).success ? topicSchema.parse(t) : { name: "", hours: 0, bloomLevel: "Understand" as const }) : [])),
  courseOutcomes: z.array(z.unknown()).transform((arr) => (Array.isArray(arr) ? arr.map((c) => courseOutcomeSchema.safeParse(c).success ? courseOutcomeSchema.parse(c) : { code: "CO1", description: "", bloomLevel: "Understand" as const }) : [])),
}).passthrough()

const semesterSchema = z.object({
  semester: z.unknown().transform(toNumber),
  subjects: z.array(z.unknown()).transform((arr) => (Array.isArray(arr) ? arr.map((s) => subjectSchema.safeParse(s).success ? subjectSchema.parse(s) : subjectSchema.parse({})) : [])),
  totalCredits: z.unknown().transform(toNumber),
}).passthrough()

const curriculumSchema = z.object({
  programName: z.unknown().transform(toString).pipe(z.string()).catch(""),
  domain: z.unknown().transform(toString).pipe(z.string()).catch(""),
  totalSemesters: z.unknown().transform(toNumber),
  totalCredits: z.unknown().transform(toNumber),
  semesters: z.array(z.unknown()).transform((arr) => (Array.isArray(arr) ? arr.map((s) => semesterSchema.safeParse(s).success ? semesterSchema.parse(s) : semesterSchema.parse({ semester: 0, subjects: [], totalCredits: 0 })) : [])),
  programOutcomes: z.array(z.unknown()).transform((arr) => (Array.isArray(arr) ? arr.map((p) => (typeof p === "string" ? p : String((p as Record<string, unknown>)?.description ?? (p as Record<string, unknown>)?.text ?? p ?? ""))) : [])),
}).passthrough()

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "Groq API key is not configured. Add GROQ_API_KEY to your .env.local file." },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { programName, domain, duration, industryFocus } = body

    if (!programName || !domain || !duration) {
      return Response.json(
        { error: "Missing required fields: programName, domain, and duration are required." },
        { status: 400 }
      )
    }

    const totalSemesters = duration * 2

    const prompt = `You are an expert academic curriculum designer. Generate a complete, detailed curriculum for the following program:

Program: ${programName}
Domain: ${domain}
Duration: ${duration} years (${totalSemesters} semesters)
${industryFocus ? `Industry Focus: ${industryFocus}` : ""}

Requirements:
1. Create a semester-wise course structure for all ${totalSemesters} semesters
2. Each semester: 5-6 subjects (Core, Elective, Lab, Project types)
3. Each subject: 3-5 topics with hours; 3-4 Course Outcomes (COs)
5. Map each topic and CO to the appropriate Bloom's taxonomy level (Remember, Understand, Apply, Analyze, Evaluate, Create)
6. Progress from foundational courses in early semesters to advanced/specialized courses in later semesters
7. Include practical labs, projects, and industry-relevant electives
8. Total credits per semester should be 20-24
9. Generate 8-10 high-level Program Outcomes (POs)
10. Ensure the curriculum is modern, industry-aligned, and follows best practices in education

Be thorough and realistic - this should resemble an actual university curriculum.

IMPORTANT: Respond with ONLY valid JSON - a single object (not array). No markdown, no code blocks. Structure: {"programName":"...","domain":"...","totalSemesters":N,"totalCredits":N,"semesters":[...],"programOutcomes":[...]}. Use ONLY these Bloom levels: Remember, Understand, Apply, Analyze, Evaluate, Create.`

    const { text } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      prompt,
      maxOutputTokens: 16000,
    })

    const raw = extractCurriculum(text)
    let parsed = curriculumSchema.safeParse(raw)

    if (!parsed.success) {
      console.error("Curriculum parse error:", JSON.stringify(parsed.error.flatten(), null, 2))
      const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
      const fallback = curriculumSchema.safeParse({
        programName: toString(obj.programName) || "Curriculum",
        domain: toString(obj.domain) || "",
        totalSemesters: toNumber(obj.totalSemesters) || totalSemesters,
        totalCredits: toNumber(obj.totalCredits) || totalSemesters * 22,
        semesters: Array.isArray(obj.semesters) ? obj.semesters : [],
        programOutcomes: Array.isArray(obj.programOutcomes) ? obj.programOutcomes.map((p) => typeof p === "string" ? p : String(p)) : [],
      })
      if (fallback.success) {
        parsed = fallback
      } else {
        return Response.json(
          { error: "Generated curriculum did not match expected format. Please try again." },
          { status: 500 }
        )
      }
    }

    return Response.json(parsed.data)
  } catch (error) {
    console.error("Curriculum generation error:", error)
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return Response.json(
      { error: message },
      { status: 500 }
    )
  }
}
