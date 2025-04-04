# Coding Standards

This document outlines the coding standards and best practices to follow in this project.

## TypeScript Guidelines

- Always use TypeScript for all files (`.ts`, `.vue`, `.tsx`)
- Avoid using `any` type - use proper typing or `unknown` if necessary
- Use interfaces for object shapes and types for unions/primitives
- Use type assertions sparingly and only when necessary
- Use meaningful variable and function names
- Add return types to functions when not obvious

```typescript
// ❌ Bad
const getData = async () => {
  const response = await fetch('/api/data')
  return await response.json()
}

// ✅ Good
interface DataResponse {
  id: number;
  name: string;
  value: number;
}

const getData = async (): Promise<DataResponse[]> => {
  const response = await fetch('/api/data');
  return await response.json() as DataResponse[];
};
```

## Vue Component Guidelines

- Use Single File Components (SFC) with the following structure:
  1. `<script setup lang="ts">` - Component logic
  2. `<template>` - Component template
  3. `<style lang="scss" scoped>` - Component styles
- Use PascalCase for component names and filenames
- Use kebab-case for props in templates
- Use composition API with `<script setup>`
- Use props validation with TypeScript
- Avoid direct DOM manipulation

```vue
<!-- ✅ Good Component Structure -->
<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  items: string[];
}

const props = defineProps<Props>();
const count = ref(0);

const increment = (): void => {
  count.value++;
};
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <ul>
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
      </li>
    </ul>
    <button @click="increment">
      Count: {{ count }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.component {
  @apply p-4 bg-white rounded-lg shadow;
  
  h2 {
    @apply text-xl font-bold mb-4;
  }
  
  ul {
    @apply space-y-2;
  }
}
</style>
```

## CSS/SCSS Guidelines

- Use Tailwind utility classes for common styling
- Use SCSS for custom components and complex styling
- Use scoped styles in Vue components
- Follow BEM naming convention for custom classes
- Leverage Tailwind's @apply for reusable patterns
- Avoid deeply nested selectors (max 3 levels)

## State Management (Pinia)

- Create stores for related data/functionality
- Use TypeScript interfaces for store state
- Define actions for async operations
- Define getters for derived state
- Keep store modules small and focused

## File Structure

- Keep related files close to each other
- Group files by feature rather than by type
- Use index files to simplify imports
- Use barrel exports where appropriate

## API Calls

- Create dedicated service files for API calls
- Use TypeScript interfaces for request/response data
- Handle errors consistently
- Use async/await instead of promises

## Testing

- Write unit tests for components and functions
- Write integration tests for critical user flows
- Mock external dependencies in tests
- Follow AAA pattern (Arrange, Act, Assert)

## Performance

- Avoid expensive operations in computed properties
- Use v-memo for expensive list rendering
- Lazy load components and routes
- Optimize images and assets

## Accessibility

- Use semantic HTML elements
- Add appropriate ARIA attributes
- Ensure keyboard navigation works
- Maintain sufficient color contrast 