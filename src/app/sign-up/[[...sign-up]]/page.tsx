import { SignUp } from '@clerk/nextjs';

const AFTER_AUTH_PATH = '/dashboard';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl={AFTER_AUTH_PATH}
        signInFallbackRedirectUrl={AFTER_AUTH_PATH}
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-[26rem]',
            card: 'border bg-card shadow-lg',
          },
        }}
      />
    </div>
  );
}
