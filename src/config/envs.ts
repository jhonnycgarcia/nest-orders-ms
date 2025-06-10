import 'dotenv/config';
import * as joi from 'joi';

interface EnvConfig {
    PORT: number;
    // PRODUCTS_MS_HOST: string;
    // PRODUCTS_MS_PORT: number;
    /**
     * URLs de los servidores NATS.
     * Para un único servidor: NATS_SERVERS="nats://localhost:4222"
     * Para múltiples servidores, separar con punto y coma: NATS_SERVERS="nats://server1:4222;nats://server2:4222"
     */
    NATS_SERVERS: string[];
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    // PRODUCTS_MS_HOST: joi.string().required(),
    // PRODUCTS_MS_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
}).unknown(true);

const { value: envConfig, error } = envSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(';'),
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvConfig = envConfig;

export const envs = {
    PORT: envVars.PORT,
    // PRODUCTS_MS_HOST: envVars.PRODUCTS_MS_HOST,
    // PRODUCTS_MS_PORT: envVars.PRODUCTS_MS_PORT,
    NATS_SERVERS: envVars.NATS_SERVERS,
}