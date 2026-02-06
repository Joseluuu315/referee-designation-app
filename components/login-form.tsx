"use client"

import { useActionState } from "react"
import { Shield, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState } from "react"

export function LoginForm({
  error,
  loginAction,
}: {
  error?: string
  loginAction: (formData: FormData) => Promise<void>
}) {
  const [, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await loginAction(formData)
    },
    null
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(153,40%,12%)] p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(153,60%,28%)]">
            <Shield className="h-8 w-8 text-[hsl(0,0%,100%)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(0,0%,100%)]">
            RFAF Arbitros
          </h1>
          <p className="text-sm text-[hsl(153,10%,65%)]">
            Sistema de Designaciones
          </p>
        </div>

        <Card className="w-full border-[hsl(153,25%,22%)] bg-[hsl(153,30%,16%)]">
          <CardHeader className="pb-4">
            <h2 className="text-center text-lg font-semibold text-[hsl(0,0%,100%)]">
              Acceso al Panel
            </h2>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-[hsl(0,60%,40%)] bg-[hsl(0,60%,20%)] p-3 text-center text-sm text-[hsl(0,80%,75%)]">
                Usuario o contrasena incorrectos
              </div>
            )}
            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username" className="text-sm text-[hsl(153,10%,75%)]">
                  Usuario
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Introduce tu usuario"
                  className="border-[hsl(153,25%,25%)] bg-[hsl(153,30%,12%)] text-[hsl(0,0%,100%)] placeholder:text-[hsl(153,10%,45%)] focus-visible:ring-[hsl(153,60%,28%)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm text-[hsl(153,10%,75%)]">
                  Contrasena
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Introduce tu contrasena"
                    className="border-[hsl(153,25%,25%)] bg-[hsl(153,30%,12%)] pr-10 text-[hsl(0,0%,100%)] placeholder:text-[hsl(153,10%,45%)] focus-visible:ring-[hsl(153,60%,28%)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(153,10%,45%)] hover:text-[hsl(153,10%,65%)]"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full bg-[hsl(153,60%,28%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(153,60%,34%)]"
              >
                {isPending ? "Accediendo..." : "Acceder"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-[hsl(153,10%,40%)]">
          Real Federacion Andaluza de Futbol
        </p>
      </div>
    </main>
  )
}
