"use client"

import { useState, useCallback } from "react"
import { CurriculumForm } from "@/components/curriculum-form"
import { CurriculumDisplay } from "@/components/curriculum-display"
import type { Curriculum } from "@/lib/curriculum-schema"
import { GraduationCap, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Home() {
  const [curriculum, setCurriculum] = useState<Curriculum | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const [hasResult, setHasResult] = useState(false)

  const handleSubmit = useCallback(
    async (data: {
      programName: string
      domain: string
      duration: number
      industryFocus: string
    }) => {
      setIsLoading(true)
      setCurriculum(undefined)
      setHasResult(true)

      try {
        const response = await fetch("/api/generate-curriculum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        let responseData: unknown
        try {
          responseData = await response.json()
        } catch {
          throw new Error(
            response.ok
              ? "Invalid response from server"
              : `Failed to generate curriculum (${response.status})`
          )
        }

        if (!response.ok) {
          const errorMessage =
            (responseData as { error?: string })?.error ||
            `Failed to generate curriculum (${response.status})`
          throw new Error(errorMessage)
        }

        setCurriculum(responseData as Curriculum)
        toast.success("Curriculum generated successfully!")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate curriculum"
        toast.error(message)
        setHasResult(false)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const handleReset = () => {
    setCurriculum(undefined)
    setHasResult(false)
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-mono text-base font-bold text-foreground">
                CurriculumAI
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                AI-Powered Curriculum Generator
              </p>
            </div>
          </div>
          {hasResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              New Curriculum
            </Button>
          )}
        </div>
      </header>

      {!hasResult ? (
        /* Input Form View */
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 md:py-20">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
              Powered by AI
            </div>
            <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              Design Your Curriculum
              <br />
              <span className="text-primary">in Seconds</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg text-pretty">
              Generate complete academic curricula with semester-wise structure,
              learning outcomes, and Bloom&apos;s taxonomy mapping — all powered by
              artificial intelligence.
            </p>
          </div>

          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
            <CurriculumForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Feature chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              "Semester-wise Structure",
              "Subject & Topics",
              "Learning Outcomes",
              "Bloom's Taxonomy",
              "Credit Mapping",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          <CurriculumDisplay
            curriculum={curriculum}
            isStreaming={isLoading}
          />
        </div>
      )}
    </main>
  )
}
