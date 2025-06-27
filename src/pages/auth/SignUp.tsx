
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/use-toast'
import { Building, TrendingUp, Users, User } from 'lucide-react'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'entrepreneur' | 'investor' | 'service_provider'>('entrepreneur')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuthStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !fullName || !role) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
        role: role
      })

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully. Please check your email to confirm your account.",
        })
        navigate('/login')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'entrepreneur':
        return <Building className="h-5 w-5" />
      case 'investor':
        return <TrendingUp className="h-5 w-5" />
      case 'service_provider':
        return <Users className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getRoleDescription = (roleType: string) => {
    switch (roleType) {
      case 'entrepreneur':
        return 'Raise funds for your business ventures'
      case 'investor':
        return 'Discover and invest in promising opportunities'
      case 'service_provider':
        return 'Offer professional services to entrepreneurs'
      default:
        return 'Select your role'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <CardDescription>
            Join Abathwa Capital and start your investment journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={(value: 'entrepreneur' | 'investor' | 'service_provider') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrepreneur">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon('entrepreneur')}
                      <div>
                        <div className="font-medium">Entrepreneur</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription('entrepreneur')}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="investor">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon('investor')}
                      <div>
                        <div className="font-medium">Investor</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription('investor')}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="service_provider">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon('service_provider')}
                      <div>
                        <div className="font-medium">Service Provider</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription('service_provider')}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp
