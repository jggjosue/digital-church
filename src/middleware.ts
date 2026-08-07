import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

/** Rutas públicas; el resto del portal y sus APIs requieren una sesión de Clerk. */
const isPublicRoute = createRouteMatcher([
  '/',
  '/documentacion(.*)',
  '/privacidad(.*)',
  '/terminos(.*)',
  '/cookies(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/legal(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

/** Rutas públicas que no deben usar ni ser procesadas por el middleware de Clerk. */
const isClerkBypassRoute = createRouteMatcher([
  '/',
  '/documentacion(.*)',
  '/privacidad(.*)',
  '/terminos(.*)',
  '/cookies(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/legal(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isClerkBypassRoute(request)) {
    return NextResponse.next();
  }
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
