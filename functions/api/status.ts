// GET /api/status — live homelab health for the ~/ panel (D25–D28). Logic: src/homelab/status.ts.
import { handleStatus, type StatusEnv } from '../../src/homelab/status.ts';

export const onRequest = ({ request, env }: { request: Request; env: StatusEnv }) => handleStatus(request, env);
