export interface LogSchema {
    timestamp: Date;
    metadata: {
        url: string;
        user : string;
    };
    cacheHit: boolean;
    roundTripTime: number;
    responseStatusCode: number;
    httpMethod: string;
}

export interface UserSchema {
    _id: string;
    email: string;
    api_key: string;
    config: {
        ttl: number;
        autoEviction: boolean;
    };
}