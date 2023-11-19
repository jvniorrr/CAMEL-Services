import { createSupbaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Function to handling signing a user out. This will sign a user out of Supabase
 * account and redirect them to the login page.
 *
 * @returns Redirects to /login
 */
export async function GET(req: NextRequest) {
	const supabase = await createSupbaseServerClient();
	await supabase.auth.signOut();
	await supabase.auth.refreshSession();
	// get users last location
	const location = req.headers.get('referer') || '/login';

	return redirect(location);
}
