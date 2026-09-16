import fastifyView, { type FastifyViewOptions } from "@fastify/view";
import fp from "fastify-plugin";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<FastifyViewOptions>(async (fastify) => {
	fastify.register(fastifyView, {
		engine: {
			ejs: require("ejs"),
		},
		root: "./templates",
		layout: "_layout.ejs",
	});
});
