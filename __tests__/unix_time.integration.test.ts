import {appProvider, createGQLRequest} from './app_provider';
import request from 'supertest';

const TIME_IN_MS = 1557174755010;
const TIME_IN_SECS = 1557174755;

describe('GQL Scalars', () => {
    describe('UnixTimeSec scalar', () => {
        describe('validate time constants', () => {
            it('seconds', () => {
                expect(TIME_IN_SECS.toString().length).toBe(10);
            });
            it('milliseconds', () => {
                expect(TIME_IN_MS.toString().length).toBe(13);
            });
        });
        describe('sent client to server', () => {
            describe('with wrong type', () => {
                it('throws error if ms is used as an input variable', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query($input: UnixTimeSec) {
                        user(input: $input) {
                            createdAt
                            input
                        }
                    }
                `;
                    const variables = {input: TIME_IN_MS};
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery, variables));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBeGreaterThan(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(400);
                });

                it('throws error if ms is used as an input inline in the query', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query {
                        user(input: ${TIME_IN_MS}) {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBeGreaterThan(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(400);
                });

                it('throws error if a wrong type is used as an input variable', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query($input: UnixTimeSec) {
                        user(input: $input) {
                            createdAt
                        }
                    }
                `;

                    const variables = {input: {wat: TIME_IN_MS}};
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery, variables));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBeGreaterThan(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(400);
                });
            });
            describe('with correct type', () => {
                it('allows using seconds in query variable', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query($input: UnixTimeSec) {
                        user(input: $input) {
                            createdAt
                            input
                        }
                    }
                `;
                    const variables = {input: TIME_IN_SECS};
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery, variables));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(200);
                });

                it('allows using seconds in inline query', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query {
                        user(input: ${TIME_IN_SECS}) {
                            createdAt
                            input
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(200);
                });

                it('allows strings to be sent as input type directly inline of query', async () => {
                    const app = appProvider({user: {createdAt: '10000101'}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));
                    expect(response.text).toMatchSnapshot();
                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(response.status).toBe(200);
                });

                it('allows strings to be sent as input type via variables', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query($input: UnixTimeSec) {
                        user(input: $input) {
                            createdAt
                        }
                    }
                `;
                    const variables = {input: `${TIME_IN_SECS}`};
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery, variables));
                    expect(response.text).toMatchSnapshot();
                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(response.status).toBe(200);
                });
            });
        });
        describe('sent server to client', () => {
            describe('correctly', () => {
                it('allows returning undefined values', async () => {
                    const app = appProvider({user: {createdAt: undefined}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(JSON.parse(response.text)).toEqual({
                        data: {user: {createdAt: null}}
                    });
                    expect(response.status).toBe(200);
                });

                it('allows returning null values', async () => {
                    const app = appProvider({user: {createdAt: null}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(JSON.parse(response.text)).toEqual({
                        data: {user: {createdAt: null}}
                    });
                    expect(response.status).toBe(200);
                });

                it('allows returning 0 as a value', async () => {
                    const app = appProvider({user: {createdAt: 0}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(JSON.parse(response.text)).toEqual({
                        data: {user: {createdAt: 0}}
                    });
                    expect(errorsLength).toBe(0);
                    expect(response.status).toBe(200);
                });

                it('coerces ms to secs', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_MS}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(JSON.parse(response.text)).toEqual({
                        data: {user: {createdAt: Math.floor(TIME_IN_MS / 1000)}}
                    });
                    expect(response.status).toBe(200);
                });

                it('coerces string to int', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_MS}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(JSON.parse(response.text)).toEqual({
                        data: {user: {createdAt: Math.floor(+TIME_IN_MS / 1000)}}
                    });
                    expect(response.status).toBe(200);
                });

                it('allows seconds to be returned', async () => {
                    const app = appProvider({user: {createdAt: TIME_IN_SECS}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBe(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(200);
                });
            });

            describe('with wrong type', () => {
                it('throws an error if there are more than 13 digits', async () => {
                    const TIME_IN_MICROSECONDS = 15571747512395;

                    const app = appProvider({user: {createdAt: TIME_IN_MICROSECONDS}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    expect(TIME_IN_MICROSECONDS.toString().length).toBe(14);
                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBeGreaterThan(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(200);
                });

                it('throws an error if time is in the wrong type', async () => {
                    const WRONG_TIME = {wrong: 15571747512395};

                    const app = appProvider({user: {createdAt: WRONG_TIME}});
                    const gqlQuery = `
                    query {
                        user {
                            createdAt
                        }
                    }
                `;
                    const response = await request(app.callback())
                        .post('/graphql')
                        .use(createGQLRequest(gqlQuery));

                    const errorsLength = (JSON.parse(response.text).errors || []).length;
                    expect(errorsLength).toBeGreaterThan(0);
                    expect(response.text).toMatchSnapshot();
                    expect(response.status).toBe(200);
                });
            });
        });
    });
});
