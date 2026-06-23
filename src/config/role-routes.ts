// // Add new roles here in the future — nothing else needs to change

// export const ROLE_ROUTES: Record<number, {
//   allowed: RegExp[]
//   defaultRedirect: string
// }> = {
//   0: {
//     allowed: [/^\/user-side/],
//     defaultRedirect: '/user-side',
//   },
//   3: {
//     // admin — everything except /user-side
//     allowed: [/^\/(?!user-side)/],
//     defaultRedirect: '/',
//   },
//   4: {
//     allowed: [/^\/user-side/],
//     defaultRedirect: '/user-side',
//   },
// }


export const ROLE_ROUTES: Record<number, {
  allowed: RegExp[]
  defaultRedirect: string
}> = {
  0: {
    // Regular user — only /user-side
    allowed: [/^\/user-side/],
    defaultRedirect: '/user-side',
  },
  3: {
    // Admin — everything except /user-side
    allowed: [/^\/(?!user-side)/],
    defaultRedirect: '/',
  },
  4: {
    // Another user role — only /user-side
    allowed: [/^\/user-side/],
    defaultRedirect: '/user-side',
  },
  // Add new roles here in future
}