import {GraphQLScalarType, GraphQLError, Kind, ASTNode} from 'graphql';

const coerceValue = (value: any) => {
    if (typeof value === 'string') {
        return +value;
    } else if (typeof value === 'number') {
        return value;
        // Dont remove this null check. It checks if value is `undefined` or `null` but lets `0` through
        // tslint:disable-next-line
    } else if (value == null) {
        // allow undefined values to be sent
        return undefined;
    } else {
        throw new GraphQLError(
            'UnixTimeSec scalar must be seconds represented as a number or string'
        );
    }
};

const validateFromClient = (value?: number) => {
    // if value exists between the years ~1974 to ~2463
    if (value && value.toString().length === 10) {
        return value;
    } else {
        throw new GraphQLError(
            'UnixTimeSec scalar has invalid value. Must be seconds since Unix Epoch'
        );
    }
};

const validateFromServer = (value?: number) => {
    // Dont remove this null check. It checks if value is `undefined` or `null` but lets `0` through
    // tslint:disable-next-line
    if (value == null) {
        return undefined;
    }
    // if value exists between the years ~1974 to ~2463
    const length = value.toString().length;

    if (length <= 10) {
        return value;
        // if value is in milliseconds
    } else if (length === 13) {
        return Math.floor(value / 1000);
    } else {
        throw new GraphQLError('UnixTimeSec scalar has invalid value');
    }
};

const type = new GraphQLScalarType({
    name: `UnixTimeSec`,

    description: `The time since Unix Epoch in seconds`,

    serialize(value: any) {
        // will accept seconds in either string or number format
        return validateFromServer(coerceValue(value));
    },

    parseValue(value: any) {
        // accept seconds or milliseconds in either string or number format
        return validateFromClient(coerceValue(value));
    },

    parseLiteral(ast: ASTNode) {
        if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
            throw new GraphQLError(
                `UnixTimeSec scalar must in seconds, represented as a number or string, but got a: ${ast.kind}`
            );
        }
        return validateFromClient(coerceValue(ast.value));
    }
});

export default {
    typedef: `scalar UnixTimeSec`,
    resolver: {UnixTimeSec: type},
    type
};
