import {clearCookie,json,sameOrigin} from '../_lib/auth.js';
export async function onRequestPost({request}){if(!sameOrigin(request))return json({error:'Invalid request origin.'},403);return json({ok:true},200,{'Set-Cookie':clearCookie()})}
