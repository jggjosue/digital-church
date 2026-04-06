import { SignIn } from '@clerk/nextjs';

/** Destino tras iniciar sesión cuando no hay `redirect_url` en la petición (p. ej. acceso directo a /sign-in). */
const AFTER_AUTH_PATH = '/dashboard';

/**
 * Pantalla de acceso con el componente oficial `<SignIn />` de Clerk.
 * El middleware impide usar el resto de la app sin sesión válida.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={AFTER_AUTH_PATH}
        signUpFallbackRedirectUrl={AFTER_AUTH_PATH}
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
