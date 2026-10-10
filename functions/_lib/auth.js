const COOKIE = '__Host-bachpan_admin';
const enc = new TextEncoder();
function b64url(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64url(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(value))))}
function constantTime(a,b){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
export async function makeSession(env){const payload=b64url(enc.encode(JSON.stringify({exp:Date.now()+8*60*60*1000,nonce:crypto.randomUUID()})));return `${payload}.${await sign(payload,env.SESSION_SECRET)}`}
export async function isAdmin(request,env){if(!env.SESSION_SECRET)return false;const cookie=request.headers.get('Cookie')||'';const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token)return false;const [payload,sig,...rest]=token.split('.');if(!payload||!sig||rest.length)return false;try{if(!constantTime(sig,await sign(payload,env.SESSION_SECRET)))return false;const data=JSON.parse(new TextDecoder().decode(unb64url(payload)));return Number(data.exp)>Date.now()}catch{return false}}
export function sessionCookie(token){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`}
export function clearCookie(){return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`}
export function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}})}
export async function bodyJson(request){const len=Number(request.headers.get('Content-Length')||0);if(len>12000)throw new Error('Request too large');return await request.json()}
export function sameOrigin(request){const origin=request.headers.get('Origin');if(!origin)return true;try{return new URL(origin).host===new URL(request.url).host}catch{return false}}
export async function requireAdmin(request,env){if(!await isAdmin(request,env))return json({error:'Please sign in again.'},401);return null}
