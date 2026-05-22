import { GameCode } from "@prisma/client";

export type UidValidationInput = {
  gameCode: GameCode;
  uid: string;
  zoneId?: string;
};

export type UidValidationResult = {
  ok: boolean;
  errors?: string[];
  username?: string | null;
  // echoed back for the client to attach to order
  normalized: { gameCode: GameCode; uid: string; zoneId?: string };
};

/**
 * Per-game format rules.
 * Username lookup is best-effort; vendor APIs are not always available so we
 * return null when no integration is wired. Admin can override later.
 */
export function validateUid(input: UidValidationInput): UidValidationResult {
  const errors: string[] = [];
  const uid = input.uid?.trim() ?? "";
  const zoneId = input.zoneId?.trim() || undefined;

  switch (input.gameCode) {
    case "FREE_FIRE": {
      if (!/^\d{6,12}$/.test(uid)) errors.push("Free Fire UID must be 6–12 digits");
      break;
    }
    case "PUBG": {
      if (!/^\d{8,16}$/.test(uid)) errors.push("PUBG UID must be 8–16 digits");
      break;
    }
    case "MOBILE_LEGENDS": {
      if (!/^\d{6,12}$/.test(uid)) errors.push("Mobile Legends UID must be 6–12 digits");
      if (!zoneId || !/^\d{3,6}$/.test(zoneId)) errors.push("Mobile Legends Zone ID is required (3–6 digits)");
      break;
    }
    case "VALORANT": {
      if (!/^[\w. -]{3,24}#\w{3,5}$/.test(uid)) errors.push("Valorant Riot ID must look like Name#TAG");
      break;
    }
  }

  if (errors.length) {
    return {
      ok: false,
      errors,
      username: null,
      normalized: { gameCode: input.gameCode, uid, zoneId },
    };
  }

  return {
    ok: true,
    username: null, // hook real vendor lookup here later
    normalized: { gameCode: input.gameCode, uid, zoneId },
  };
}
