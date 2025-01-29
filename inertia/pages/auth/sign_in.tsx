import { AuthLayout } from '@/components/auth/auth_layout'
import { SignInForm } from '@/components/auth/sign_in_form'
import { Head } from '@inertiajs/react'

export default function SignInPage() {
  return (
    <>
      <Head title="Sign In" />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  )
}
