# Dataweave CLI Setup & Publishing Guide

## Project Structure

```
dataweave/
├── src/
│   └── cli.ts          # Main CLI entry point
├── dist/               # (generated) Compiled JavaScript
├── package.json        # npm package configuration
├── tsconfig.json       # TypeScript configuration
├── README.md          # Package documentation
├── LICENSE            # MIT license file
├── .gitignore         # Git ignore rules
├── .npmignore         # npm publish ignore rules
└── SETUP.md           # This file
```

## Initial Setup

1. **Create the project directory:**
   ```bash
   mkdir dataweave
   cd dataweave
   ```

2. **Initialize git (optional but recommended):**
   ```bash
   git init
   ```

3. **Create the files from the artifacts above:**
   - Create `package.json`, `tsconfig.json`, `README.md`, `.gitignore`
   - Create `src/` directory and add `cli.ts`

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Build the project:**
   ```bash
   npm run build
   ```

6. **Test locally:**
   ```bash
   npm run dev info
   # or after building:
   node dist/cli.js info
   ```

## Publishing to npm

### First-time setup:

1. **Create an npm account** (if you don't have one):
   - Go to https://www.npmjs.com/signup
   - Verify your email

2. **Login to npm:**
   ```bash
   npm login
   ```

3. **Update package.json:**
   - Replace `"yourusername"` with your GitHub username
   - Replace `"Your Name <your.email@example.com>"` with your details
   - Consider updating the homepage/repository URLs

4. **Create a LICENSE file:**
   ```bash
   echo "MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE." > LICENSE
   ```

### Publishing:

1. **Check if the name is available:**
   ```bash
   npm view dataweave
   ```
   If it returns "404 Not Found", the name is available!

2. **Do a dry run first:**
   ```bash
   npm publish --dry-run
   ```

3. **Publish the package:**
   ```bash
   npm publish
   ```

4. **Verify the publication:**
   - Go to https://www.npmjs.com/package/dataweave
   - Try installing it: `npm install -g dataweave`

## Important Notes

### Version Management:
- Start with `0.0.1` for the placeholder
- Use semantic versioning: `major.minor.patch`
- Update version before each publish: `npm version patch`

### npm Namespace:
- Once published, you have 24 hours to unpublish without restrictions
- After 24 hours, the name is permanently claimed (with some exceptions)
- You can continue updating the package with new versions

### Security:
- Enable 2FA on your npm account
- Consider using `npm publish --access=public` explicitly
- Use `.npmignore` to exclude development files

### Quick Commands:
```bash
# Build and test locally
npm run build && npm run dev info

# Publish a new version
npm version patch
npm publish

# View package info
npm info dataweave
```

## Next Steps

After claiming the namespace:

1. Set up GitHub repository
2. Add GitHub Actions for CI/CD
3. Create a development branch
4. Start implementing real functionality
5. Update README with actual features as they're built
6. Consider creating a documentation site

## Troubleshooting

If `dataweave` is already taken, consider alternatives:
- `@yourscope/dataweave` (scoped package)
- `dataweave-cli`
- `dweave`
- `data-weave-cli`

To check availability:
```bash
npm view [package-name]
```

Good luck with your data pipeline CLI! 🚀