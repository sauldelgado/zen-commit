# Zen Commit Examples

This directory contains examples demonstrating various components and features of Zen Commit.

## Running the Examples

To run these examples, you'll need to have the project dependencies installed:

```bash
npm install
```

Then you can run the examples using one of these methods:

### TypeScript Examples

For TypeScript examples:

```bash
# Using ts-node (recommended)
npx ts-node src/examples/confirmation-dialog-demo.tsx

# Or compile first
npm run build
node dist/examples/confirmation-dialog-demo.js
```

### JavaScript Examples

For JavaScript examples:

```bash
node src/examples/commit-screen-demo.js
```

## Available Examples

- **confirmation-dialog-demo.tsx**: Demonstrates the confirmation dialog used before making commits
- **commit-screen-demo.js**: Shows the complete commit screen workflow