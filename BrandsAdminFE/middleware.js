import { NextResponse } from 'next/server';

//Middleware only runs on the server
export function middleware(request) {
         // we are getting the authToken from the cookie
         const authToken = request.cookies.get("authToken")?.value;

         // we are checking if the user is trying to access a protected page
         const protectedPages = [
                  '/home',
                  '/profile',
                  '/profile/edit_profile',
                  '/subscription',
                  '/offers/new_offers',
                  '/offers/live_offers',
                  '/offers/live_offers/live_edit',
                  '/offers/past_offers',
         ];

         // Check if the current route is the login page
         const isLoginPage = request.nextUrl.pathname === '/login';

         // Check if the current route is a protected page
         const isProtectedPage = protectedPages.some((page) =>
                  request.nextUrl.pathname.startsWith(page)
         );

         // Case 1: User is logged in (authToken exists)
         if (authToken) {
                  // Redirect logged-in users away from the login page to the home page
                  if (isLoginPage) {
                           return NextResponse.redirect(new URL('/home', request.url));
                  }

                  // Allow access to both protected and public pages
                  return NextResponse.next();
         }

         // Case 2: User is not logged in (authToken does not exist)
         if (!authToken) {
                  // Redirect unauthenticated users trying to access protected pages to the login page
                  if (isProtectedPage) {
                           return NextResponse.redirect(new URL('/login', request.url));
                  }

                  // Allow unauthenticated users to access the login page
                  if (isLoginPage) {
                           return NextResponse.next();
                  }

                  // Redirect unauthenticated users trying to access any other route to the login page
                  return NextResponse.redirect(new URL('/login', request.url));
         }
}

// Middleware configuration: specify which routes should trigger the middleware
export const config = {
         matcher: [
                  '/',
                  '/login',
                  '/home',
                  '/profile',
                  '/profile/edit_profile',
                  '/subscription',
                  '/offers/new_offers',
                  '/offers/live_offers',
                  '/offers/live_offers/live_edit',
                  '/offers/past_offers',
         ],
};
