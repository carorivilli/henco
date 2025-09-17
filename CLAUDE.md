# Shadcn UI - components


# How to deal with tRPC Endpoints

## Creating tRPC Endpoints

### Basic Endpoint Definition

First, define your tRPC procedures in your router:

```typescript
// src/trpc/routers/example.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}!`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // Simulate database operation
      return {
        id: Math.random(),
        name: input.name,
        createdAt: new Date(),
      };
    }),
});
```

### Adding to Main Router

Include your router in the main app router:

```typescript
// src/trpc/routers/_app.ts
import { createTRPCRouter } from "../init";
import { exampleRouter } from "./example";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;
```

## Consuming Endpoints

### Method 1: Direct Server Component Usage (Recommended)

When you need data directly in a server component without client-side hydration:

```typescript
// app/page.tsx
import { api } from '~/trpc/server';

export default async function Home() {
  // Direct server-side call - not cached for client
  const greeting = await api.example.hello({ text: "tRPC" });
  
  return (
    <div>
      <h1>Server Rendered</h1>
      <p>{greeting.greeting}</p>
    </div>
  );
}
```

### Method 2: Prefetch + Client Hooks

This approach implements "render as you fetch" pattern by prefetching data in server components and consuming it in client components.

**Server Component (Prefetching):**

```typescript
// app/page.tsx
import { api } from "@/trpc/server";
import { HydrateClient } from "@/trpc/server";
import { ClientGreeting } from "./client-greeting";

export default async function Home() {
  // Prefetch the query - starts the request early
  void api.example.hello.prefetch({ text: "tRPC" });

  return (
    <HydrateClient>
      <div>
        <h1>My App</h1>
        <ClientGreeting />
      </div>
    </HydrateClient>
  );
}
```

**Client Component (Consuming):**

```typescript
// app/client-greeting.tsx
'use client';
import { api } from '~/trpc/client';

export function ClientGreeting() {
  const greeting = api.example.hello.useQuery({ text: "tRPC" });

  if (greeting.isLoading) return <div>Loading...</div>;
  if (greeting.error) return <div>Error: {greeting.error.message}</div>;

  return <div>{greeting.data?.greeting}</div>;
}
```

### Method 3: Using Suspense and Error Boundaries

For a more declarative approach to handling loading and error states:

**Server Component:**

```typescript
// app/page.tsx
import { api } from '~/trpc/server';
import { HydrateClient } from '~/trpc/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ClientGreeting } from './client-greeting';

export default async function Home() {
  void api.example.hello.prefetch({ text: "tRPC" });

  return (
    <HydrateClient>
      <div>
        <h1>My App</h1>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientGreeting />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
```

**Client Component:**

```typescript
// app/client-greeting.tsx
'use client';
import { api } from '~/trpc/client';

export function ClientGreeting() {
  // useSuspenseQuery throws promises for Suspense to catch
  const [data] = api.example.hello.useSuspenseQuery({ text: "tRPC" });
  
  return <div>{data.greeting}</div>;
}
```



**Important:** This method doesn't store data in the query cache, so the data won't be available to client components.

## Advanced Patterns

### Handling Mutations

**Client Component with Mutation:**

```typescript
'use client';
import { api } from '~/trpc/client';
import { useState } from 'react';

export function CreateItemForm() {
  const [name, setName] = useState('');
  
  const createItem = api.example.create.useMutation({
    onSuccess: (data) => {
      console.log('Created:', data);
      setName(''); // Reset form
    },
    onError: (error) => {
      console.error('Error:', error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItem.mutate({ name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        disabled={createItem.isLoading}
      />
      <button type="submit" disabled={createItem.isLoading}>
        {createItem.isLoading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Parallel Queries

```typescript
'use client';
import { api } from '~/trpc/client';

export function ParallelQueriesExample() {
  const greeting = api.example.hello.useQuery({ text: "World" });
  const items = api.example.getAll.useQuery();
  const userProfile = api.user.getProfile.useQuery();

  const isLoading = greeting.isLoading || items.isLoading || userProfile.isLoading;
  const hasError = greeting.error || items.error || userProfile.error;

  if (isLoading) return <div>Loading...</div>;
  if (hasError) return <div>Error occurred</div>;

  return (
    <div>
      <h1>{greeting.data?.greeting}</h1>
      <p>Items: {items.data?.length}</p>
      <p>User: {userProfile.data?.name}</p>
    </div>
  );
}
```
