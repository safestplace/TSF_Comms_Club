import Link from 'next/link'
import Image from 'next/image'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-900">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="group">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-16 h-16 mb-3 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 p-2 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="TSF Comms Club Logo"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TSF Comms Club</span>
              <div className="text-sm text-blue-300 font-medium">Excellence in Communication</div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-slate-300">Join the future of communication skills</p>
          </div>

          {/* Registration Card */}
          <Card variant="elevated" className="backdrop-blur-lg">
            <RegisterForm />
          </Card>

          {/* Footer Links */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
