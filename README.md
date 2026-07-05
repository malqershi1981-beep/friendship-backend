
  # Company Website Design Document

  This is a code bundle for Company Website Design Document. The original project is available at https://www.figma.com/design/vgofIsX1GpT2Vagij1tfdd/Company-Website-Design-Document.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server at http://localhost:5173.

  Run `npm run api` to start the database API server at http://localhost:4000.

  ## Build for production

  Run `npm run build` to create the production package in the `dist` folder.

  Run `npm run preview` to preview the built app locally at http://localhost:5173.

  ## Deployment

  1. Build the project: `npm run build`
  2. Upload the contents of the `dist` folder to your web server.
  3. Configure the server to serve `dist/index.html` for the application root.

  ### Recommended hosting options

  - Static file hosting: Netlify, Vercel, GitHub Pages, Cloudflare Pages
  - Any web server: Apache, Nginx, IIS
  - If using a Node.js server, you can serve `dist` as static assets.
  
