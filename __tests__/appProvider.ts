import Koa from 'koa';
import {ApolloServer, gql, IResolvers} from 'apollo-server-koa';
import unixTimeSec from '../src/index';
import {SuperAgentRequest} from 'superagent';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type User {
        createdAt: ${unixTimeSec.type.name}
        input: ${unixTimeSec.type.name}
    }

    type Query {
        user(input: ${unixTimeSec.type.name}): User
    }
`;

interface IUserResult {
    createdAt: any;
    input?: any;
}

// Provide resolver functions for your schema fields
const createResolvers = (returnValues: {user: IUserResult}) =>
    ({
        ...unixTimeSec.resolver,
        Query: {
            async user(_, input: any) {
                return {...returnValues.user, ...input};
            }
        }
    } as IResolvers);

const appProvider = ({user: userReturnValue}: {user: IUserResult}) => {
    const allTypeDefs = gql`
        ${typeDefs}
        ${unixTimeSec.typedef}
    `;
    const server = new ApolloServer({
        typeDefs: allTypeDefs,
        resolvers: createResolvers({user: userReturnValue})
    });
    const app = new Koa();
    server.applyMiddleware({app});
    return app;
};

const createGQLRequest = (query: string, variables?: any) => {
    return (request: SuperAgentRequest) => {
        return request.set('Content-Type', 'application/json').send({query, variables});
    };
};

export {appProvider, createGQLRequest};
