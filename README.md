This is a [Next.js](https://nextjs.org) project.

Prerequisites

- Node.js (LTS recommended, e.g. 18.x or 20.x)
- npm (comes with Node.js)

Quick start (Windows cmd)

1. Open Command Prompt and go to the project folder:

   ```
   cd ..\piasta-net-frontend-2
   ```

2. Install dependencies listed in package.json:

   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```
   Then open: http://localhost:3000

Build and run production locally

```
npm run build
npm run start
```

Environment variables

- If needed, create a .env.local file in the project root and restart the dev server after changes.

Troubleshooting (cmd)

- Remove node_modules and lock file, then reinstall:
  ```
  rmdir /s /q node_modules && del package-lock.json && npm install
  ```
- Clear npm cache if needed:
  ```
  npm cache clean --force
  ```

---

## Updating the API Spec & Generating Types

The backend API is defined by an OpenAPI (Swagger) spec. To keep your frontend in sync:

1. **Update the API spec:**
   - The current spec URL is stored in `openapi/swagger-link.txt`.
   - To fetch the latest spec, run:
     ```
     node update-openapi.js
     ```
   - This downloads the spec to `openapi/swagger.json`.

2. **Generate TypeScript types:**
   - Install the generator (if not already):
     ```
     npm install openapi-typescript --save-dev
     ```
   - Generate types from the spec:
     ```
     npx openapi-typescript openapi/swagger.json --output openapi/types.ts
     ```
   - Use these types in your code for API requests and responses.

See comments in service files for more info.
