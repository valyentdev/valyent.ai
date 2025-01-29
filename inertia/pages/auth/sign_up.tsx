import { AuthLayout } from '@/components/auth/auth_layout'
import { SignUpForm } from '@/components/auth/sign_up_form'
import { Head } from '@inertiajs/react'

export default function SignUpPage() {
  return (
    <>
      <Head title="Sign Up" />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  )
}
