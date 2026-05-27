import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Paths that don't require an admin session (client portal + barber-specific routes)
// Barber routes manage their own auth via +page.server.ts (barber_session_id cookie)
const UNGUARDED_PREFIXES = ['/client', '/barber-dashboard', '/barber-profile', '/api/book', '/api/barbers/login', '/api-docs', '/docs'];

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const sessionId = cookies.get('session_id');
	const path = url.pathname;
	const isLoginPage = path === '/login';

	const isUnguarded = UNGUARDED_PREFIXES.some(
		(prefix) => path === prefix || path.startsWith(prefix + '/')
	);

	if (isUnguarded) {
		return { isAuthenticated: !!sessionId };
	}

	if (!sessionId && !isLoginPage) {
		throw redirect(303, '/login');
	}

	if (sessionId && isLoginPage) {
		throw redirect(303, '/');
	}

	return { isAuthenticated: !!sessionId };
};
