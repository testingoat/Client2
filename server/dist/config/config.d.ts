export declare const PORT: string | number;
export declare const COOKIE_PASSWORD: string | undefined;
declare let sessionStore: any;
export { sessionStore as sessionStore };
export declare const authenticate: (email: string, password: string) => Promise<{
    email: string;
    password: string;
    name: string | undefined;
    role: "Admin";
    id: string;
} | null>;
//# sourceMappingURL=config.d.ts.map