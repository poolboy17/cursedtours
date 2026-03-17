declare module 'https://edge.netlify.com' {
  export interface Context {
    next(): Response | Promise<Response>;
  }
}
