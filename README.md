# snpkg-graphql-scalar-unix-time-sec

A GraphQL scalar for representing unix time seconds

# Install

```typescript
npm i -D @social-native/snpkg-graphql-scalar-unix-time-sec
```

# Usage

1. Import

```typescript
import unixTimeSec from '@social-native/snpkg-graphql-scalar-unix-time-sec';
```

2. Use the scalar in the gql schema file

```typescript
const typeDefs = gql`
    type User {
        createdAt: ${unixTimeSec.type.name}
        input: ${unixTimeSec.type.name}
    }

    type Query {
        user(input: ${unixTimeSec.type.name}): User
    }
`;
```

or

```graphql
type User {
    createdAt: UnixTimeSec
    input: UnixTimeSec
}

type Query {
    user(input: UnixTimeSec): User
}
```

3. Add the resolver

```typescript
const resolvers = {
    ...unixTimeSec.resolver,
    Query: {
        async user(_, input: any) {
            return {...returnValues.user, ...input};
        }
    }
};
```

# API

This scalar will:

-   Accept inputs in either `string` or `number` format
-   Validate that the input type has 10 digits (aka is between the years ~1974 to ~2463)
-   Will coerce milliseconds to seconds if being sent from the server to client
