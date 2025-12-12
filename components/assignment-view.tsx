import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, ArrowRight } from "lucide-react"
import type { Participant, GiftItem } from "@/app/page"

interface AssignmentViewProps {
  participants: Participant[]
  assignments: Record<string, string>
  gifts: GiftItem[]
}

export function AssignmentView({ participants, assignments, gifts }: AssignmentViewProps) {
  const getParticipantName = (id: string) => {
    return participants.find((p) => p.id === id)?.name || "Desconocido"
  }

  const getReceiverGifts = (receiverId: string) => {
    return gifts.filter((g) => g.participantId === receiverId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignaciones del Amigo Secreto</CardTitle>
        <CardDescription>
          ¡Las asignaciones han sido generadas! Cada persona debe ver solo su asignación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.map((participant) => {
          const receiverId = assignments[participant.id]
          const receiverName = getParticipantName(receiverId)
          const receiverGifts = getReceiverGifts(receiverId)

          return (
            <Card key={participant.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950 dark:to-red-950">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{participant.name}</span>
                  <ArrowRight className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-600">{receiverName}</span>
                </CardTitle>
                <CardDescription>
                  {participant.name} le dará un regalo a {receiverName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {receiverGifts.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Lista de regalos de {receiverName}:</p>
                    <ul className="space-y-2">
                      {receiverGifts.map((gift) => (
                        <li key={gift.id} className="flex items-start gap-2 text-sm">
                          <Gift className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium">{gift.title}</p>
                            {gift.description && <p className="text-muted-foreground">{gift.description}</p>}
                            {gift.link && (
                              <a
                                href={gift.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-rose-600 hover:underline"
                              >
                                Ver enlace
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {receiverName} no ha agregado regalos a su lista todavía
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}
