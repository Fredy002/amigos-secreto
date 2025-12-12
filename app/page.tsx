"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Users, Shuffle, Plus } from "lucide-react"
import { ParticipantsList } from "@/components/participants-list"
import { GiftsList } from "@/components/gifts-list"
import { AssignmentView } from "@/components/assignment-view"
import { PasswordDialog } from "@/components/password-dialog"
import { FloatingHearts } from "@/components/floating-hearts"

export interface Participant {
  id: string
  name: string
  assignedTo?: string
}

export interface GiftItem {
  id: string
  participantId: string
  title: string
  description: string
  link: string
}

export interface AppData {
  participants: Participant[]
  gifts: GiftItem[]
  assignments: Record<string, string>
  isAssignmentGenerated: boolean
}

export default function Home() {
  const [data, setData] = useState<AppData>({
    participants: [],
    gifts: [],
    assignments: {},
    isAssignmentGenerated: false,
  })
  const [newParticipantName, setNewParticipantName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"add-participant" | "generate-assignment" | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("regalitos-data")
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (e) {
        console.error("[v0] Error loading data:", e)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("regalitos-data", JSON.stringify(data))
    }
  }, [data, isLoading])

  const handleAddParticipant = () => {
    setPendingAction("add-participant")
    setShowPasswordDialog(true)
  }

  const addParticipant = () => {
    if (!newParticipantName.trim()) return

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
    }

    setData((prev) => ({
      ...prev,
      participants: [...prev.participants, newParticipant],
      isAssignmentGenerated: false,
    }))
    setNewParticipantName("")
  }

  const deleteParticipant = (id: string) => {
    setData((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
      gifts: prev.gifts.filter((g) => g.participantId !== id),
      isAssignmentGenerated: false,
    }))
  }

  const updateParticipant = (id: string, name: string) => {
    setData((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === id ? { ...p, name } : p)),
    }))
  }

  const handleGenerateSecretSanta = () => {
    setPendingAction("generate-assignment")
    setShowPasswordDialog(true)
  }

  const generateSecretSanta = () => {
    if (data.participants.length < 2) {
      alert("Se necesitan al menos 2 participantes para generar el amigo secreto")
      return
    }

    const participants = [...data.participants]
    const assignments: Record<string, string> = {}
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      const shuffled = [...participants].sort(() => Math.random() - 0.5)
      let valid = true

      for (let i = 0; i < participants.length; i++) {
        const giver = participants[i]
        const receiver = shuffled[i]

        if (giver.id === receiver.id) {
          valid = false
          break
        }
      }

      if (valid) {
        for (let i = 0; i < participants.length; i++) {
          assignments[participants[i].id] = shuffled[i].id
        }
        break
      }

      attempts++
    }

    if (Object.keys(assignments).length === 0) {
      alert("No se pudo generar una asignación válida. Por favor, intenta de nuevo.")
      return
    }

    setData((prev) => ({
      ...prev,
      assignments,
      isAssignmentGenerated: true,
    }))
  }

  const addGift = (participantId: string, title: string, description: string, link: string) => {
    const newGift: GiftItem = {
      id: Date.now().toString(),
      participantId,
      title,
      description,
      link,
    }

    setData((prev) => ({
      ...prev,
      gifts: [...prev.gifts, newGift],
    }))
  }

  const updateGift = (id: string, title: string, description: string, link: string) => {
    setData((prev) => ({
      ...prev,
      gifts: prev.gifts.map((g) => (g.id === id ? { ...g, title, description, link } : g)),
    }))
  }

  const deleteGift = (id: string) => {
    setData((prev) => ({
      ...prev,
      gifts: prev.gifts.filter((g) => g.id !== id),
    }))
  }

  const handlePasswordConfirm = () => {
    if (pendingAction === "add-participant") {
      addParticipant()
    } else if (pendingAction === "generate-assignment") {
      generateSecretSanta()
    }
    setPendingAction(null)
    setShowPasswordDialog(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-red-50">
        <p className="text-lg text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-red-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4 lg:px-6">
      <FloatingHearts />

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-rose-600" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              Regalitos con la Rory
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-2">
            Organiza tu amigo secreto de forma fácil y divertida. Gestiona participantes, asigna amigos secretos y lleva
            un registro de las listas de regalos.
          </p>
        </div>

        <Tabs defaultValue="gifts" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="participants" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Participantes</span>
              <span className="sm:hidden">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Listas de Regalos</span>
              <span className="sm:hidden">Regalos</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Asignaciones</span>
              <span className="sm:hidden">Amigo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Agregar Participante</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Añade los nombres de todos los participantes del amigo secreto</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Nombre del participante"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <Button onClick={handleAddParticipant} className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ParticipantsList
              participants={data.participants}
              onDelete={deleteParticipant}
              onUpdate={updateParticipant}
            />
          </TabsContent>

          <TabsContent value="gifts" className="space-y-4 sm:space-y-6">
            <GiftsList
              participants={data.participants}
              gifts={data.gifts}
              onAddGift={addGift}
              onUpdateGift={updateGift}
              onDeleteGift={deleteGift}
            />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Generar Amigo Secreto</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Asigna de forma aleatoria a cada participante su amigo secreto</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Button
                  onClick={handleGenerateSecretSanta}
                  disabled={data.participants.length < 2}
                  className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-sm sm:text-base"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {data.isAssignmentGenerated ? "Regenerar Asignaciones" : "Generar Asignaciones"}
                </Button>
                {data.participants.length < 2 && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">Necesitas al menos 2 participantes</p>
                )}
              </CardContent>
            </Card>

            {data.isAssignmentGenerated && (
              <AssignmentView participants={data.participants} assignments={data.assignments} gifts={data.gifts} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  )
}
