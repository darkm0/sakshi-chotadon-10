const jwt=require('jsonwebtoken');
const SECRET=process.env.JWT_SECRET||'ashasetu-development-secret';
function auth(req,res,next){try{const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');if(!token)throw new Error();req.user=jwt.verify(token,SECRET);next();}catch(e){res.status(401).json({message:'Authentication required.'});}}
function adminOnly(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({message:'Administrator access required.'});next();}
module.exports={auth,adminOnly};
