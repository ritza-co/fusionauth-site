import multipart, { type FastifyMultipartOptions } from "@fastify/multipart";
import fp from "fastify-plugin";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<FastifyMultipartOptions>(async (fastify) => {
	fastify.register(multipart);
});
