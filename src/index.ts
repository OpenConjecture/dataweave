// Main entry point for the dataweave package
// This file is referenced in package.json as "main"

export const version = '0.0.1';

// Placeholder for future API exports
export const dataweave = {
  version,
  // Future exports will go here:
  // init: async (options) => { ... },
  // scaffold: async (type, options) => { ... },
  // ai: async (prompt, context) => { ... },
};

// Placeholder message for programmatic usage
if (require.main === module) {
  console.log('Dataweave CLI - Use the "dataweave" command instead of running this file directly.');
  console.log('Install globally: npm install -g dataweave');
  console.log('Then run: dataweave --help');
}