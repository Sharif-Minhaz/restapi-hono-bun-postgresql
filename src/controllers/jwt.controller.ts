import { sign } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

async function signJWT(payload: JWTPayload, ctx: Context) {
	try {
		const expiresIn = 60 * 60 * 6; // 6 hours in seconds
		const token = await sign(
			{ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn },
			Bun.env.JWT_SECRET as string
		);

		if (!token) return ctx.json({ message: "Token not generated" }, 400);

		setCookie(ctx, "auth", token, {
			path: "/",
			secure: true,
			domain: "localhost",
			httpOnly: true,
			maxAge: expiresIn, // Set maxAge to match JWT expiration
			sameSite: "Strict",
		});

		return token;
	} catch (error) {
		console.error(error);
		throw new HTTPException(500, { message: "Server error occurred", cause: error });
	}
}

export { signJWT };
