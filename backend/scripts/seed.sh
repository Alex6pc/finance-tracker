#!/bin/bash

# Ensure we're in the correct directory
cd /app

# Run the seed script
echo "Running database seed script..."
npx ts-node -r tsconfig-paths/register src/transactions/migrations/seed.ts

echo "Seeding completed!" 