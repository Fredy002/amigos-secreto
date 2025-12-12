"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const CORRECT_PASSWORD = "Fredy002"

export function PasswordDialog({ open, onOpenChange, onConfirm }: PasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setPassword("")
      setError("")
      onConfirm()
    } else {
      setError("Contraseña incorrecta")
    }
  }

  const handleClose = () => {
    setPassword("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-600" />
            Acceso Administrativo
          </DialogTitle>
          <DialogDescription>Ingresa la contraseña para realizar acciones administrativas</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input
              type="password"
              placeholder="Ingresa la contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-rose-600 hover:bg-rose-700">
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
