import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/node'

const arcjetkey = process.env.ARCJET_KEY
const arcjetmode = process.env.ARCJET_MODE  === "DRY_RUN" ? "DRY_RUN" : "LIVE"

if(!arcjetkey) throw new Error('ARCJETKEY environment variable is missing');

export const httpArcjet = arcjetkey ? 
        arcjet({
            key: arcjetkey,
            rules: [
                shield({ mode: arcjetmode }),
                detectBot({ mode: arcjetmode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
                slidingWindow({ mode: arcjetmode, interval: '10s', max: 50 })
            ]
        }) : null;

export const wsArcjet = arcjetkey ? 
        arcjet({
            key: arcjetkey,
            rules: [
                shield({ mode: arcjetmode }),
                detectBot({ mode: arcjetmode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
                slidingWindow({ mode: arcjetmode, interval: '2s', max: 5 })
            ]
        }) : null;

export function securityMiddleware() {
    return async (req, res, next) => {
        if(!httpArcjet) return next();

        try {
            console.log(`[Arcjet] Protecting request: ${req.method} ${req.url}`);
            const decision = await httpArcjet.protect(req)
            console.log(`[Arcjet] Decision: ${decision.conclusion}`);

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: 'Too many request.' })
                }

                return res.status(403).json({ message: 'forbidden' })
            }
        } catch (error) {
            console.error('Arcjet middleware error: ', error);
            return res.status(503).json({ error: 'service unavailable' })            
        }

        next()
    }
}