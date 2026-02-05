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
