"use client"

import type { Curriculum } from "@/lib/curriculum-schema"
import { BLOOM_LEVELS, BLOOM_COLORS } from "@/lib/curriculum-schema"
import { SemesterCard } from "@/components/semester-card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Target,
  BarChart3,
} from "lucide-react"

interface CurriculumDisplayProps {
  curriculum: Curriculum | undefined
  isStreaming: boolean
}

export function CurriculumDisplay({
  curriculum,
  isStreaming,
}: CurriculumDisplayProps) {
  if (!curriculum) return null

  const bloomCounts = getBloomDistribution(curriculum)
  const totalSubjects = curriculum.semesters?.reduce(
    (acc, s) => acc + (s.subjects?.length || 0),
    0
  ) || 0

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {isStreaming && (
            <Badge className="animate-pulse bg-accent text-accent-foreground border-0">
              Generating...
            </Badge>
          )}
        </div>
        <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
          {curriculum.programName || "Loading..."}
        </h2>
        <p className="text-muted-foreground">
          {curriculum.domain}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<Calendar className="h-4 w-4" />}
            label="Semesters"
            value={curriculum.totalSemesters || 0}
          />
          <StatCard
            icon={<GraduationCap className="h-4 w-4" />}
            label="Total Credits"
            value={curriculum.totalCredits || 0}
          />
          <StatCard
            icon={<BookOpen className="h-4 w-4" />}
            label="Subjects"
            value={totalSubjects}
          />
          <StatCard
            icon={<Award className="h-4 w-4" />}
            label="Program Outcomes"
            value={curriculum.programOutcomes?.length || 0}
          />
        </div>
      </div>

      {/* Bloom's Taxonomy Distribution */}
      {Object.keys(bloomCounts).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            {"Bloom's Taxonomy Distribution"}
          </h3>
          <div className="flex flex-col gap-2">
            {BLOOM_LEVELS.map((level) => {
              const count = bloomCounts[level] || 0
              const total = Object.values(bloomCounts).reduce((a, b) => a + b, 0)
              const percent = total > 0 ? (count / total) * 100 : 0
              const colors = BLOOM_COLORS[level]

              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-medium text-muted-foreground">
                    {level}
                  </span>
                  <div className="flex-1">
                    <div className="h-6 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colors.bg} flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(percent, 2)}%` }}
                      >
                        {percent > 10 && (
                          <span className={`text-[10px] font-semibold ${colors.text}`}>
                            {Math.round(percent)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-muted-foreground">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Program Outcomes */}
      {curriculum.programOutcomes && curriculum.programOutcomes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Program Outcomes (POs)
          </h3>
          <div className="flex flex-col gap-2">
            {curriculum.programOutcomes.map((po, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg bg-secondary/50 px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-foreground">{po}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semester List */}
      {curriculum.semesters && curriculum.semesters.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Semester-wise Course Structure
          </h3>
          <div className="flex flex-col gap-3">
            {curriculum.semesters.map((semester, i) => (
              <SemesterCard key={i} semester={semester} />
            ))}
          </div>
        </div>
      )}

      {isStreaming && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Still generating curriculum data...
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-foreground font-mono">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function getBloomDistribution(curriculum: Curriculum): Record<string, number> {
  const counts: Record<string, number> = {}
  if (!curriculum.semesters) return counts

  for (const semester of curriculum.semesters) {
    if (!semester.subjects) continue
    for (const subject of semester.subjects) {
      if (subject.topics) {
        for (const topic of subject.topics) {
          if (topic.bloomLevel) {
            counts[topic.bloomLevel] = (counts[topic.bloomLevel] || 0) + 1
          }
        }
      }
      if (subject.courseOutcomes) {
        for (const co of subject.courseOutcomes) {
          if (co.bloomLevel) {
            counts[co.bloomLevel] = (counts[co.bloomLevel] || 0) + 1
          }
        }
      }
    }
  }
  return counts
}
