"use client"

import { useState } from "react"
import type { Semester, Subject } from "@/lib/curriculum-schema"
import { BloomBadge } from "@/components/bloom-badge"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  BookOpen,
  Target,
  Clock,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SemesterCardProps {
  semester: Semester
}

const TYPE_STYLES: Record<string, string> = {
  Core: "bg-primary/10 text-primary border-primary/20",
  Elective: "bg-accent/10 text-accent border-accent/20",
  Lab: "bg-amber-50 text-amber-700 border-amber-200",
  Project: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

function SubjectDetail({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {subject.code}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  TYPE_STYLES[subject.type] || TYPE_STYLES.Core
                )}
              >
                {subject.type}
              </span>
            </div>
            <h4 className="font-medium text-foreground text-sm">
              {subject.name}
            </h4>
            <span className="text-xs text-muted-foreground">
              {subject.credits} Credits
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-1">
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex flex-col gap-4">
            {/* Topics */}
            {subject.topics && subject.topics.length > 0 && (
              <div>
                <h5 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Topics
                </h5>
                <div className="flex flex-col gap-2">
                  {subject.topics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md bg-card px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground">
                          {topic.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {topic.hours}h
                        </span>
                        <BloomBadge level={topic.bloomLevel} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Outcomes */}
            {subject.courseOutcomes && subject.courseOutcomes.length > 0 && (
              <div>
                <h5 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Course Outcomes
                </h5>
                <div className="flex flex-col gap-2">
                  {subject.courseOutcomes.map((co, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-md bg-card px-3 py-2"
                    >
                      <Badge
                        variant="outline"
                        className="mt-0.5 shrink-0 font-mono text-xs"
                      >
                        {co.code}
                      </Badge>
                      <p className="flex-1 text-sm leading-relaxed text-foreground">
                        {co.description}
                      </p>
                      <BloomBadge
                        level={co.bloomLevel}
                        className="mt-0.5 shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function SemesterCard({ semester }: SemesterCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-lg font-bold">
            {semester.semester}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Semester {semester.semester}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {semester.subjects?.length || 0} subjects
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {semester.totalCredits} credits
              </span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="flex flex-col gap-2 pl-2">
          {semester.subjects?.map((subject, i) => (
            <SubjectDetail key={i} subject={subject} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
