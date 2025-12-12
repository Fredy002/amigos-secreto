"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Gift, ExternalLink, Pencil, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import type { Participant, GiftItem } from "@/app/page"

interface GiftsListProps {
  participants: Participant[]
  gifts: GiftItem[]
  onAddGift: (participantId: string, title: string, description: string, link: string) => void
  onUpdateGift: (id: string, title: string, description: string, link: string) => void
  onDeleteGift: (id: string) => void
}

export function GiftsList({ participants, gifts, onAddGift, onUpdateGift, onDeleteGift }: GiftsListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null)
  const [deletingGiftId, setDeletingGiftId] = useState<string | null>(null)

  const [selectedParticipant, setSelectedParticipant] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")

  const resetForm = () => {
    setSelectedParticipant("")
    setTitle("")
    setDescription("")
    setLink("")
  }

  const handleAdd = () => {
    if (!selectedParticipant || !title.trim()) return

    onAddGift(selectedParticipant, title.trim(), description.trim(), link.trim())
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleUpdate = () => {
    if (!editingGift || !title.trim()) return

    onUpdateGift(editingGift.id, title.trim(), description.trim(), link.trim())
    setEditingGift(null)
    resetForm()
  }

  const startEdit = (gift: GiftItem) => {
    setEditingGift(gift)
    setTitle(gift.title)
    setDescription(gift.description)
    setLink(gift.link)
  }

  const handleDelete = () => {
    if (deletingGiftId) {
      onDeleteGift(deletingGiftId)
      setDeletingGiftId(null)
    }
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Primero agrega participantes en la pestaña de Participantes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-lg sm:text-xl">Listas de Regalos</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Agrega regalos a la lista de cada participante</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto text-sm sm:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Regalo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Regalo</DialogTitle>
                  <DialogDescription>Añade un regalo a la lista de un participante</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Participante</Label>
                    <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Selecciona un participante" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Título del Regalo</Label>
                    <Input placeholder="Ej: Libro de cocina" value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm sm:text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Descripción (opcional)</Label>
                    <Textarea
                      placeholder="Detalles sobre el regalo..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Link de Compra (opcional)</Label>
                    <Input placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} className="text-sm sm:text-base" />
                  </div>
                  <Button onClick={handleAdd} className="w-full bg-rose-600 hover:bg-rose-700 text-sm sm:text-base">
                    Agregar Regalo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <Accordion type="single" collapsible className="w-full">
            {participants.map((participant) => {
              const participantGifts = gifts.filter((g) => g.participantId === participant.id)

              return (
                <AccordionItem key={participant.id} value={participant.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">{participant.name}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        ({participantGifts.length} regalo{participantGifts.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {participantGifts.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                        No hay regalos en esta lista todavía
                      </p>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {participantGifts.map((gift) => (
                          <div key={gift.id} className="p-3 sm:p-4 rounded-lg border bg-card space-y-2">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex-1 space-y-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base break-words">{gift.title}</h4>
                                {gift.description && (
                                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{gift.description}</p>
                                )}
                                {gift.link && (
                                  <a
                                    href={gift.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs sm:text-sm text-rose-600 hover:text-rose-700 hover:underline break-all"
                                  >
                                    Ver producto
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                                <Dialog
                                  open={editingGift?.id === gift.id}
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setEditingGift(null)
                                      resetForm()
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(gift)}>
                                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle className="text-base sm:text-lg">Editar Regalo</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label className="text-xs sm:text-sm">Título del Regalo</Label>
                                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm sm:text-base" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs sm:text-sm">Descripción</Label>
                                        <Textarea
                                          value={description}
                                          onChange={(e) => setDescription(e.target.value)}
                                          rows={3}
                                          className="text-sm sm:text-base"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs sm:text-sm">Link de Compra</Label>
                                        <Input value={link} onChange={(e) => setLink(e.target.value)} className="text-sm sm:text-base" />
                                      </div>
                                      <Button onClick={handleUpdate} className="w-full bg-rose-600 hover:bg-rose-700 text-sm sm:text-base">
                                        Guardar Cambios
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog open={deletingGiftId === gift.id} onOpenChange={(open) => !open && setDeletingGiftId(null)}>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" onClick={() => setDeletingGiftId(gift.id)}>
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-base sm:text-lg">¿Eliminar regalo?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-xs sm:text-sm">
                                        Esta acción no se puede deshacer. El regalo "{gift.title}" será eliminado permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                      <AlertDialogCancel className="w-full sm:w-auto text-sm sm:text-base">Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={handleDelete}
                                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm sm:text-base"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
