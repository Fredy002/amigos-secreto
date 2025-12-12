"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { useState } from "react"
import type { Participant } from "@/app/page"

interface ParticipantsListProps {
  participants: Participant[]
  onDelete: (id: string) => void
  onUpdate: (id: string, name: string) => void
}

export function ParticipantsList({ participants, onDelete, onUpdate }: ParticipantsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const startEdit = (participant: Participant) => {
    setEditingId(participant.id)
    setEditName(participant.name)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, editName.trim())
      setEditingId(null)
      setEditName("")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No hay participantes. ¡Agrega el primero!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Lista de Participantes ({participants.length})</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Gestiona todos los participantes del amigo secreto</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {editingId === participant.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit()
                      if (e.key === "Escape") cancelEdit()
                    }}
                    className="flex-1 text-sm sm:text-base"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={saveEdit} className="shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit} className="shrink-0">
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-sm sm:text-base break-words">{participant.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(participant)} className="shrink-0">
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(participant.id)} className="shrink-0">
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
