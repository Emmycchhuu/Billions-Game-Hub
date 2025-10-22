import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
      <div className="w-full max-w-sm relative z-10">
        <Card className="border-green-500/20 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-400">Welcome to Billions!</CardTitle>
            <CardDescription className="text-slate-400">Check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 text-center leading-relaxed">
              {
                "We've sent you a verification email. Please check your inbox and click the link to activate your agent account."
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
