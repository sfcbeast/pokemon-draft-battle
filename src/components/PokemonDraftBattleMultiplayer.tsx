import { useState, useEffect, useRef, useCallback } from "react";

/* ---------------- Design tokens ----------------
   bg indigo #12141C · panel cream #EFE6D0 · ink #262433
   accent red #D64545 · accent gold #E8B23D · accent teal #3FA796
   Display: "Press Start 2P" (headers/labels only) · Body: "Rubik"
--------------------------------------------------- */

const TYPE_COLORS = {
  normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F0C93C",
  grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#D9A441", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#8B7364",
  steel: "#9EA0B8", fairy: "#D685AD",
};

const TYPE_MOVES = {
  normal: [{ name: "Quick Attack", power: 40 }, { name: "Hyper Fang", power: 80 }],
  fire: [{ name: "Ember", power: 45 }, { name: "Flamethrower", power: 90 }],
  water: [{ name: "Water Gun", power: 45 }, { name: "Surf", power: 90 }],
  grass: [{ name: "Vine Whip", power: 45 }, { name: "Solar Beam", power: 100 }],
  electric: [{ name: "Spark", power: 45 }, { name: "Thunderbolt", power: 90 }],
  ice: [{ name: "Ice Shard", power: 45 }, { name: "Ice Beam", power: 90 }],
  fighting: [{ name: "Karate Chop", power: 50 }, { name: "Submission", power: 85 }],
  poison: [{ name: "Poison Sting", power: 40 }, { name: "Sludge Bomb", power: 80 }],
  ground: [{ name: "Mud Slap", power: 40 }, { name: "Earthquake", power: 100 }],
  flying: [{ name: "Gust", power: 45 }, { name: "Aerial Ace", power: 75 }],
  psychic: [{ name: "Confusion", power: 50 }, { name: "Psychic", power: 90 }],
  bug: [{ name: "Bug Bite", power: 50 }, { name: "Megahorn", power: 95 }],
  rock: [{ name: "Rock Throw", power: 50 }, { name: "Rock Slide", power: 80 }],
  ghost: [{ name: "Lick", power: 40 }, { name: "Shadow Ball", power: 85 }],
  dragon: [{ name: "Dragon Breath", power: 55 }, { name: "Dragon Claw", power: 85 }],
  dark: [{ name: "Bite", power: 55 }, { name: "Crunch", power: 85 }],
  steel: [{ name: "Metal Claw", power: 50 }, { name: "Iron Head", power: 85 }],
  fairy: [{ name: "Fairy Wind", power: 45 }, { name: "Moonblast", power: 90 }],
};

const CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const REGIONS = [
  { key: "kanto", label: "Kanto", gen: "I", range: [1, 151] },
  { key: "johto", label: "Johto", gen: "II", range: [152, 251] },
  { key: "hoenn", label: "Hoenn", gen: "III", range: [252, 386] },
  { key: "sinnoh", label: "Sinnoh", gen: "IV", range: [387, 493] },
  { key: "unova", label: "Unova", gen: "V", range: [494, 649] },
  { key: "kalos", label: "Kalos", gen: "VI", range: [650, 721] },
  { key: "alola", label: "Alola", gen: "VII", range: [722, 809] },
  { key: "galar", label: "Galar", gen: "VIII", range: [810, 905] },
  { key: "paldea", label: "Paldea", gen: "IX", range: [906, 1025] },
  { key: "all", label: "All Regions", gen: "I–IX", range: [1, 1025] },
];

function effectiveness(moveType, defTypes) {
  let m = 1;
  defTypes.forEach((dt) => {
    const v = CHART[moveType]?.[dt];
    if (v !== undefined) m *= v;
  });
  return m;
}

function prettyName(n) {
  return n.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function buildMoveset(types) {
  const pool = [{ name: "Tackle", power: 40, type: "normal" }];
  types.forEach((t) => (TYPE_MOVES[t] || []).forEach((m) => pool.push({ ...m, type: t })));
  const seen = new Set();
  const uniq = pool.filter((m) => (seen.has(m.name) ? false : (seen.add(m.name), true)));
  const rest = uniq.filter((m) => m.name !== "Tackle").sort(() => Math.random() - 0.5).slice(0, 3);
  return [uniq[0], ...rest];
}

async function fetchPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  const types = data.types.map((t) => t.type.name);
  const statMap = {};
  data.stats.forEach((s) => (statMap[s.stat.name] = s.base_stat));
  const maxHp = statMap.hp * 3;
  return {
    id: data.id,
    name: prettyName(data.name),
    types,
    stats: { hp: statMap.hp, attack: statMap.attack, defense: statMap.defense, speed: statMap.speed },
    sprites: { front: data.sprites.front_default, back: data.sprites.back_default || data.sprites.front_default },
    moves: buildMoveset(types),
    maxHp,
    currentHp: maxHp,
  };
}

function randUniqueIds(count, min, max) {
  const s = new Set();
  const span = max - min + 1;
  const target = Math.min(count, span);
  while (s.size < target) s.add(min + Math.floor(Math.random() * span));
  return [...s];
}

async function fetchPool(min, max, count) {
  const ids = randUniqueIds(Math.ceil(count * 1.4), min, max);
  let mons = (await Promise.all(ids.map((id) => fetchPokemon(id).catch(() => null)))).filter(Boolean);
  if (mons.length < count) {
    const more = randUniqueIds(count, min, max).filter((id) => !ids.includes(id));
    const extra = (await Promise.all(more.map((id) => fetchPokemon(id).catch(() => null)))).filter(Boolean);
    mons = [...mons, ...extra];
  }
  const seen = new Set();
  mons = mons.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
  return mons.slice(0, count);
}

function computeDamage(attacker, defender, move) {
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const eff = effectiveness(move.type, defender.types);
  const rand = 0.85 + Math.random() * 0.15;
  const base = ((2 * 50 / 5 + 2) * move.power * (attacker.stats.attack / defender.stats.defense)) / 50 + 2;
  return { dmg: Math.max(1, Math.round(base * stab * eff * rand)), eff };
}

function resolveBothMoves(room, hostMoveIdx, guestMoveIdx) {
  const hostId = room.hostId, guestId = room.guestId;
  const hostMon = room.teams[hostId][room.activeIdx[hostId]];
  const guestMon = room.teams[guestId][room.activeIdx[guestId]];
  const hostMove = hostMon.moves[hostMoveIdx];
  const guestMove = guestMon.moves[guestMoveIdx];
  const hostFirst = hostMon.stats.speed === guestMon.stats.speed ? Math.random() < 0.5 : hostMon.stats.speed > guestMon.stats.speed;
  let hHp = hostMon.currentHp, gHp = guestMon.currentHp;
  const newLog = [];
  const order = hostFirst
    ? [{ side: "host", move: hostMove }, { side: "guest", move: guestMove }]
    : [{ side: "guest", move: guestMove }, { side: "host", move: hostMove }];

  for (const step of order) {
    if (step.side === "host" && hHp <= 0) continue;
    if (step.side === "guest" && gHp <= 0) continue;
    const atk = step.side === "host" ? hostMon : guestMon;
    const def = step.side === "host" ? guestMon : hostMon;
    const { dmg, eff } = computeDamage(atk, def, step.move);
    const atkName = step.side === "host" ? room.hostName : room.guestName;
    newLog.push(`${atk.name} (${atkName}) used ${step.move.name}!`);
    if (eff === 0) newLog.push("It has no effect...");
    else if (eff > 1) newLog.push("It's super effective!");
    else if (eff < 1) newLog.push("It's not very effective...");
    if (step.side === "host") gHp = Math.max(0, gHp - dmg);
    else hHp = Math.max(0, hHp - dmg);
  }
  if (gHp <= 0) newLog.push(`${guestMon.name} fainted!`);
  if (hHp <= 0) newLog.push(`${hostMon.name} fainted!`);

  const newHostTeam = room.teams[hostId].map((m, i) => (i === room.activeIdx[hostId] ? { ...m, currentHp: hHp } : m));
  const newGuestTeam = room.teams[guestId].map((m, i) => (i === room.activeIdx[guestId] ? { ...m, currentHp: gHp } : m));
  const hostAlive = newHostTeam.some((m) => m.currentHp > 0);
  const guestAlive = newGuestTeam.some((m) => m.currentHp > 0);

  let status = room.status, winner = null, pendingSwitch = null;
  if (!hostAlive) { status = "over"; winner = guestId; }
  else if (!guestAlive) { status = "over"; winner = hostId; }
  else if (gHp <= 0) pendingSwitch = guestId;
  else if (hHp <= 0) pendingSwitch = hostId;

  return {
    ...room,
    teams: { ...room.teams, [hostId]: newHostTeam, [guestId]: newGuestTeam },
    log: [...room.log, ...newLog],
    status, winner, pendingSwitch,
    turnCounter: (room.turnCounter || 0) + 1,
  };
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

async function storageGet(key, shared = true) {
  try {
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}
async function storageSet(key, value, shared = true) {
  try {
    await window.storage.set(key, JSON.stringify(value), shared);
  } catch (e) {
    console.error("storage set failed", e);
  }
}
async function storageDelete(key, shared = true) {
  try {
    await window.storage.delete(key, shared);
  } catch {
    // key may not exist yet - fine to ignore
  }
}
const roomKey = (code) => `pkmn-room-${code}`;
// Each player writes to their OWN key (never a shared read-modify-write key).
// This avoids a last-write-wins race when both players submit a move at once.
const moveKeyFor = (code, playerId) => `pkmn-mv-${code}-${playerId}`;
// Personal (non-shared, per-user) keys used to survive a page refresh.
const PERSONAL_ID_KEY = "pkmn-my-player-id";
const ACTIVE_ROOM_KEY = "pkmn-active-room";

function TypeChip({ t }) {
  return (
    <span style={{ background: TYPE_COLORS[t] || "#888" }} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white tracking-wide">
      {t}
    </span>
  );
}
function HpBar({ hp, maxHp }) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  const color = pct > 50 ? "#3FA796" : pct > 20 ? "#E8B23D" : "#D64545";
  return (
    <div style={{ background: "#1c1e2a", border: "2px solid #262433" }} className="w-full h-3 rounded-full overflow-hidden">
      <div style={{ width: `${pct}%`, background: color, transition: "width 0.4s ease" }} className="h-full" />
    </div>
  );
}
function Sprite({ src, alt, flip }) {
  return src ? (
    <img src={src} alt={alt} style={{ imageRendering: "pixelated", transform: flip ? "scaleX(-1)" : "none" }} className="w-24 h-24 object-contain drop-shadow-lg" />
  ) : (
    <div className="w-24 h-24 flex items-center justify-center text-4xl">❓</div>
  );
}

export default function PokemonDraftBattleMultiplayer() {
  const [myId, setMyId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [myName, setMyName] = useState("");
  const [screen, setScreen] = useState("home"); // home, create, join, lobby, draft, battle, over
  const [selectedRegion, setSelectedRegion] = useState("kanto");
  const [joinCode, setJoinCode] = useState("");
  const [roomCodeState, setRoomCodeState] = useState("");
  const [room, setRoom] = useState(null);
  const [isHostFlag, setIsHostFlag] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mySubmitted, setMySubmitted] = useState(false);
  const [picking, setPicking] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy code");
  const turnCounterRef = useRef(0);
  const pickLockRef = useRef(false);
  const logEndRef = useRef(null);

  // Restore identity + rejoin an in-progress room after a page refresh.
  // Personal (non-shared) storage persists per-user across reloads, unlike
  // localStorage/sessionStorage which don't work inside artifacts.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let id = await storageGet(PERSONAL_ID_KEY, false);
      if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        await storageSet(PERSONAL_ID_KEY, id, false);
      }
      if (cancelled) return;
      setMyId(id);

      const active = await storageGet(ACTIVE_ROOM_KEY, false);
      if (active && active.code) {
        const r = await storageGet(roomKey(active.code), true);
        if (r && (r.hostId === id || r.guestId === id)) {
          setMyName(active.name || (r.hostId === id ? r.hostName : r.guestName) || "");
          setRoomCodeState(active.code);
          setIsHostFlag(r.hostId === id);
          setRoom(r);
          turnCounterRef.current = r.turnCounter || 0;
          if (r.status === "waiting-for-join") setScreen("lobby");
          else if (r.status === "drafting") setScreen("draft");
          else if (r.status === "battle") setScreen("battle");
          else if (r.status === "over") setScreen("over");
        } else {
          await storageDelete(ACTIVE_ROOM_KEY, false);
        }
      }
      if (!cancelled) setInitializing(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.log?.length]);

  // Unified poll loop
  useEffect(() => {
    if (!myId || !["lobby", "draft", "battle", "over"].includes(screen) || !roomCodeState) return;
    let cancelled = false;
    const tick = async () => {
      let fresh = await storageGet(roomKey(roomCodeState));
      if (!fresh || cancelled) return;

      if (isHostFlag && fresh.status === "battle") {
        const hostMove = await storageGet(moveKeyFor(roomCodeState, fresh.hostId));
        const guestMove = await storageGet(moveKeyFor(roomCodeState, fresh.guestId));
        if (fresh.pendingSwitch) {
          const need = fresh.pendingSwitch;
          const mv = need === fresh.hostId ? hostMove : guestMove;
          if (mv && typeof mv === "object" && "switchIdx" in mv) {
            const mon = fresh.teams[need][mv.switchIdx];
            const nameOf = need === fresh.hostId ? fresh.hostName : fresh.guestName;
            const updated = {
              ...fresh,
              activeIdx: { ...fresh.activeIdx, [need]: mv.switchIdx },
              pendingSwitch: null,
              log: [...fresh.log, `${nameOf} sends out ${mon.name}!`],
              turnCounter: (fresh.turnCounter || 0) + 1,
            };
            await storageSet(roomKey(roomCodeState), updated);
            await storageSet(moveKeyFor(roomCodeState, need), null);
            fresh = updated;
          }
        } else if (typeof hostMove === "number" && typeof guestMove === "number") {
          const updated = resolveBothMoves(fresh, hostMove, guestMove);
          await storageSet(roomKey(roomCodeState), updated);
          await storageSet(moveKeyFor(roomCodeState, fresh.hostId), null);
          await storageSet(moveKeyFor(roomCodeState, fresh.guestId), null);
          fresh = updated;
        }
      }

      if (cancelled) return;
      if (fresh.turnCounter !== turnCounterRef.current) {
        turnCounterRef.current = fresh.turnCounter;
        setMySubmitted(false);
      }
      setRoom(fresh);
      if (fresh.status === "waiting-for-join") setScreen("lobby");
      else if (fresh.status === "drafting") setScreen("draft");
      else if (fresh.status === "battle") setScreen("battle");
      else if (fresh.status === "over") setScreen("over");
    };
    tick();
    const id = setInterval(tick, 1800);
    return () => { cancelled = true; clearInterval(id); };
  }, [screen, roomCodeState, isHostFlag]);

  async function createRoom() {
    if (!myName.trim()) { setError("Enter your name first."); return; }
    setLoading(true); setError("");
    try {
      const code = genCode();
      const region = REGIONS.find((r) => r.key === selectedRegion) || REGIONS[0];
      const pool = await fetchPool(region.range[0], region.range[1], 16);
      const initial = {
        code, region: region.key, regionLabel: region.label,
        hostId: myId, hostName: myName.trim(), guestId: null, guestName: null,
        status: "waiting-for-join", teamSize: 4, pool,
        picks: { [myId]: [] }, draftStep: 0, draftTurn: myId,
        teams: null, activeIdx: null, log: [], phase: null, winner: null,
        pendingSwitch: null, turnCounter: 0, createdAt: Date.now(),
      };
      await storageSet(roomKey(code), initial);
      await storageSet(ACTIVE_ROOM_KEY, { code, name: myName.trim() }, false);
      setIsHostFlag(true);
      setRoomCodeState(code);
      setRoom(initial);
      setScreen("lobby");
    } catch {
      setError("Couldn't reach the Pokédex network. Try again.");
    }
    setLoading(false);
  }

  async function joinRoom() {
    if (!myName.trim() || !joinCode.trim()) { setError("Enter your name and a room code."); return; }
    setLoading(true); setError("");
    const code = joinCode.trim().toUpperCase();
    const existing = await storageGet(roomKey(code));
    if (!existing) { setError("Room not found. Double-check the code."); setLoading(false); return; }
    if (existing.guestId && existing.guestId !== myId) { setError("That room is already full."); setLoading(false); return; }
    const updated = {
      ...existing,
      guestId: myId, guestName: myName.trim(),
      status: "drafting", draftTurn: existing.hostId,
      picks: { ...existing.picks, [existing.hostId]: existing.picks[existing.hostId] || [], [myId]: [] },
    };
    await storageSet(roomKey(code), updated);
    // Two people can hit "join" on the same open room at nearly the same
    // time; storage has no compare-and-set, so the second write silently
    // wins. Re-read after a short settle window and confirm our write is
    // still the one standing before committing to this room — otherwise
    // we'd sit in a room as "guest" while the host reads someone else's
    // moves and we never do anything.
    await new Promise((r) => setTimeout(r, 500));
    const confirmed = await storageGet(roomKey(code));
    if (!confirmed || confirmed.guestId !== myId) {
      setError("Someone else just joined that room. Try another code.");
      setLoading(false);
      return;
    }
    await storageSet(ACTIVE_ROOM_KEY, { code, name: myName.trim() }, false);
    setIsHostFlag(false);
    setRoomCodeState(code);
    setRoom(confirmed);
    setScreen("draft");
    setLoading(false);
  }

  async function pickMon(mon) {
    if (!room || room.draftTurn !== myId) return;
    // Guard against a rapid double-click sending two overlapping picks:
    // without this, both calls can read the same stale room snapshot and
    // the second write silently clobbers the first, dropping a pick.
    if (pickLockRef.current) return;
    pickLockRef.current = true;
    setPicking(true);
    try {
      const latest = await storageGet(roomKey(roomCodeState));
      if (!latest || latest.draftTurn !== myId) return;
      const newPicks = { ...latest.picks, [myId]: [...(latest.picks[myId] || []), mon] };
      const newPool = latest.pool.filter((p) => p.id !== mon.id);
      const newStep = latest.draftStep + 1;
      const otherId = myId === latest.hostId ? latest.guestId : latest.hostId;
      let updated;
      if (newStep >= latest.teamSize * 2) {
        const hostTeam = newPicks[latest.hostId].map((m) => ({ ...m, currentHp: m.maxHp }));
        const guestTeam = newPicks[latest.guestId].map((m) => ({ ...m, currentHp: m.maxHp }));
        updated = {
          ...latest, picks: newPicks, pool: newPool, draftStep: newStep, status: "battle", phase: "battle",
          teams: { [latest.hostId]: hostTeam, [latest.guestId]: guestTeam },
          activeIdx: { [latest.hostId]: 0, [latest.guestId]: 0 },
          log: [`Draft complete!`, `${latest.hostName} sends out ${hostTeam[0].name}!`, `${latest.guestName} sends out ${guestTeam[0].name}!`],
          pendingSwitch: null, turnCounter: 0, winner: null,
        };
      } else {
        updated = { ...latest, picks: newPicks, pool: newPool, draftStep: newStep, draftTurn: otherId };
      }
      await storageSet(roomKey(roomCodeState), updated);
      setRoom(updated);
    } finally {
      pickLockRef.current = false;
      setPicking(false);
    }
  }

  async function submitAttack(moveIdx) {
    if (mySubmitted || !room || room.phase !== "battle" || room.pendingSwitch) return;
    setMySubmitted(true);
    await storageSet(moveKeyFor(roomCodeState, myId), moveIdx);
  }
  async function submitSwitch(idx) {
    if (mySubmitted || !room || room.pendingSwitch !== myId) return;
    setMySubmitted(true);
    await storageSet(moveKeyFor(roomCodeState, myId), { switchIdx: idx });
  }

  function leaveRoom() {
    storageDelete(ACTIVE_ROOM_KEY, false);
    setScreen("home"); setRoom(null); setRoomCodeState(""); setJoinCode(""); setError(""); setMySubmitted(false);
    turnCounterRef.current = 0;
  }

  function copyCode() {
    navigator.clipboard?.writeText(roomCodeState).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy code"), 1500);
    });
  }

  const bg = { background: "#12141C", minHeight: "100%", fontFamily: "Rubik, sans-serif" };
  const display = { fontFamily: "'Press Start 2P', monospace" };
  const panel = { background: "#EFE6D0", color: "#262433", border: "3px solid #262433" };

  const otherId = room ? (myId === room.hostId ? room.guestId : room.hostId) : null;
  const otherName = room ? (myId === room.hostId ? room.guestName : room.hostName) : "";
  const myTeam = room?.teams?.[myId];
  const oppTeam = room?.teams?.[otherId];
  const myActive = myTeam?.[room?.activeIdx?.[myId]];
  const oppActive = oppTeam?.[room?.activeIdx?.[otherId]];

  return (
    <div style={bg} className="w-full min-h-full flex flex-col items-center p-3 text-[#EFE6D0]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Rubik:wght@400;500;700;900&display=swap');`}</style>

      <h1 style={{ ...display, color: "#E8B23D", fontSize: "12px", lineHeight: 1.6 }} className="mt-2 mb-4 text-center">
        DRAFT &amp; BATTLE · ONLINE
      </h1>

      {initializing && (
        <div className="mt-16 text-center opacity-80 text-sm animate-pulse">Reconnecting…</div>
      )}

      {!initializing && screen === "home" && (
        <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-xs">
          <p className="text-sm opacity-80 text-center">Draft a team from any generation and battle a friend live. Share a room code to play.</p>
          <input
            value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Your trainer name"
            style={{ background: "#EFE6D0", color: "#262433" }} className="w-full rounded-lg px-3 py-2 text-sm"
          />
          {error && <div className="text-xs text-[#D64545]">{error}</div>}
          <button onClick={() => setScreen("create")} style={{ background: "#D64545", ...display, fontSize: "10px" }} className="w-full px-4 py-3 rounded-xl text-white active:scale-95 transition">
            HOST A ROOM
          </button>
          <button onClick={() => setScreen("join")} style={{ background: "#3FA796", ...display, fontSize: "10px" }} className="w-full px-4 py-3 rounded-xl text-white active:scale-95 transition">
            JOIN A ROOM
          </button>
        </div>
      )}

      {screen === "create" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <input
            value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Your trainer name"
            style={{ background: "#EFE6D0", color: "#262433" }} className="w-full rounded-lg px-3 py-2 text-sm"
          />
          <div style={{ ...display, fontSize: "10px" }} className="text-[#E8B23D]">CHOOSE A REGION</div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {REGIONS.map((r) => (
              <button
                key={r.key} onClick={() => setSelectedRegion(r.key)}
                style={{ background: selectedRegion === r.key ? "#E8B23D" : "#EFE6D0", color: "#262433", border: "3px solid #262433" }}
                className="rounded-xl p-2 text-left"
              >
                <div className="font-bold text-xs">{r.label}</div>
                <div className="text-[10px] opacity-70">Gen {r.gen}</div>
              </button>
            ))}
          </div>
          {error && <div className="text-xs text-[#D64545]">{error}</div>}
          <button onClick={createRoom} disabled={loading} style={{ background: "#D64545", ...display, fontSize: "10px" }} className="w-full px-4 py-3 rounded-xl text-white disabled:opacity-60">
            {loading ? "SUMMONING…" : "CREATE ROOM"}
          </button>
          <button onClick={() => setScreen("home")} className="text-xs opacity-60 underline">back</button>
        </div>
      )}

      {screen === "join" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <input
            value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Your trainer name"
            style={{ background: "#EFE6D0", color: "#262433" }} className="w-full rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE"
            style={{ background: "#EFE6D0", color: "#262433", ...display, fontSize: "11px", letterSpacing: "2px" }}
            className="w-full rounded-lg px-3 py-3 text-center"
          />
          {error && <div className="text-xs text-[#D64545]">{error}</div>}
          <button onClick={joinRoom} disabled={loading} style={{ background: "#3FA796", ...display, fontSize: "10px" }} className="w-full px-4 py-3 rounded-xl text-white disabled:opacity-60">
            {loading ? "JOINING…" : "JOIN ROOM"}
          </button>
          <button onClick={() => setScreen("home")} className="text-xs opacity-60 underline">back</button>
        </div>
      )}

      {screen === "lobby" && room && (
        <div className="flex flex-col items-center gap-4 mt-6 text-center">
          <div style={{ ...display, fontSize: "9px" }} className="text-[#3FA796]">ROOM CODE</div>
          <div style={{ ...display, fontSize: "22px", letterSpacing: "4px", color: "#E8B23D" }}>{roomCodeState}</div>
          <button onClick={copyCode} style={{ background: "#EFE6D0", color: "#262433" }} className="px-3 py-1 rounded-lg text-xs font-bold">{copyLabel}</button>
          <p className="text-xs opacity-70 max-w-xs">{room.regionLabel} draft · Share this code with a friend. Waiting for them to join…</p>
          <div className="animate-pulse text-xs opacity-60">●●●</div>
          <button onClick={leaveRoom} className="text-xs opacity-60 underline">cancel</button>
        </div>
      )}

      {screen === "draft" && room && (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div style={{ ...display, fontSize: "9px", color: room.draftTurn === myId ? "#3FA796" : "#D64545" }} className="text-center">
            {room.draftTurn === myId ? "YOUR PICK" : `${room.draftTurn === room.hostId ? room.hostName : room.guestName}'S PICK…`}
          </div>
          <div className="text-[10px] text-center opacity-60">{room.regionLabel} · Pick {room.draftStep + 1} of {room.teamSize * 2}</div>
          <div className="grid grid-cols-2 gap-2">
            {room.pool.map((mon) => (
              <button key={mon.id} onClick={() => pickMon(mon)} disabled={room.draftTurn !== myId || picking}
                style={panel} className="rounded-2xl p-2 flex flex-col items-center gap-1 active:scale-95 transition disabled:opacity-60">
                <Sprite src={mon.sprites.front} alt={mon.name} />
                <div className="font-bold text-xs">{mon.name}</div>
                <div className="flex gap-1">{mon.types.map((t) => <TypeChip key={t} t={t} />)}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-3 mt-1">
            <div className="flex-1">
              <div style={{ ...display, fontSize: "8px" }} className="text-[#3FA796] mb-1">{room.hostName}</div>
              <div className="flex gap-1 flex-wrap">{(room.picks[room.hostId] || []).map((m) => <img key={m.id} src={m.sprites.front} style={{ imageRendering: "pixelated" }} className="w-9 h-9" alt={m.name} />)}</div>
            </div>
            <div className="flex-1 text-right">
              <div style={{ ...display, fontSize: "8px" }} className="text-[#D64545] mb-1">{room.guestName || "…"}</div>
              <div className="flex gap-1 flex-wrap justify-end">{(room.picks[room.guestId] || []).map((m) => <img key={m.id} src={m.sprites.front} style={{ imageRendering: "pixelated" }} className="w-9 h-9" alt={m.name} />)}</div>
            </div>
          </div>
        </div>
      )}

      {screen === "battle" && room && myActive && oppActive && (
        <div className="w-full max-w-md flex flex-col gap-2">
          <div style={panel} className="rounded-2xl p-3 flex items-center justify-between">
            <div className="flex-1">
              <div className="font-bold text-sm">{oppActive.name} <span className="text-[10px] opacity-60">({otherName})</span></div>
              <div className="flex gap-1 my-1">{oppActive.types.map((t) => <TypeChip key={t} t={t} />)}</div>
              <HpBar hp={oppActive.currentHp} maxHp={oppActive.maxHp} />
            </div>
            <Sprite src={oppActive.sprites.front} alt="opponent" />
          </div>

          <div style={panel} className="rounded-2xl p-3 flex items-center justify-between">
            <Sprite src={myActive.sprites.back} alt="you" />
            <div className="flex-1 text-right">
              <div className="font-bold text-sm">{myActive.name} <span className="text-[10px] opacity-60">(You)</span></div>
              <div className="flex gap-1 my-1 justify-end">{myActive.types.map((t) => <TypeChip key={t} t={t} />)}</div>
              <HpBar hp={myActive.currentHp} maxHp={myActive.maxHp} />
            </div>
          </div>

          <div style={{ background: "#0d0e14", border: "3px solid #262433" }} className="rounded-xl p-3 h-24 overflow-y-auto text-xs leading-relaxed">
            {(room.log || []).slice(-6).map((l, i) => <div key={i}>{l}</div>)}
            <div ref={logEndRef} />
          </div>

          {room.pendingSwitch === myId && (
            mySubmitted ? (
              <div className="text-center text-xs opacity-70 py-2">Switch locked in — waiting for {otherName}…</div>
            ) : (
              <div className="flex flex-col gap-2">
                <div style={{ ...display, fontSize: "9px" }} className="text-center text-[#D64545]">CHOOSE YOUR NEXT POKÉMON</div>
                <div className="grid grid-cols-3 gap-2">
                  {myTeam.map((m, i) => (
                    <button key={m.id} disabled={m.currentHp <= 0} onClick={() => submitSwitch(i)} style={panel} className="rounded-xl p-2 flex flex-col items-center disabled:opacity-30">
                      <img src={m.sprites.front} style={{ imageRendering: "pixelated" }} className="w-12 h-12" alt={m.name} />
                      <div className="text-[10px] font-bold">{m.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {room.pendingSwitch && room.pendingSwitch !== myId && (
            <div className="text-center text-xs opacity-70 py-2">{otherName} is choosing their next Pokémon…</div>
          )}

          {!room.pendingSwitch && (
            mySubmitted ? (
              <div className="text-center text-xs opacity-70 py-2">Move locked in — waiting for {otherName}…</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {myActive.moves.map((m, i) => (
                  <button key={m.name} onClick={() => submitAttack(i)} style={{ background: TYPE_COLORS[m.type] || "#888" }} className="rounded-xl p-2 text-white text-left active:scale-95 transition">
                    <div className="font-bold text-xs">{m.name}</div>
                    <div className="text-[10px] opacity-90">{m.type.toUpperCase()} · PWR {m.power}</div>
                  </button>
                ))}
              </div>
            )
          )}

          <div className="flex gap-1 justify-center mt-1">
            {myTeam.map((m, i) => (
              <div key={m.id} style={{ opacity: m.currentHp <= 0 ? 0.3 : i === room.activeIdx[myId] ? 1 : 0.7, border: i === room.activeIdx[myId] ? "2px solid #E8B23D" : "2px solid transparent" }} className="rounded-lg p-0.5">
                <img src={m.sprites.front} style={{ imageRendering: "pixelated" }} className="w-8 h-8" alt={m.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "over" && room && (
        <div className="flex flex-col items-center gap-3 mt-10">
          <div style={{ ...display, fontSize: "13px", color: room.winner === myId ? "#3FA796" : "#D64545" }}>
            {room.winner === myId ? "VICTORY!" : "DEFEAT"}
          </div>
          <p className="text-xs opacity-70">{room.winner === room.hostId ? room.hostName : room.guestName} wins the battle!</p>
          <button onClick={leaveRoom} style={{ background: "#D64545", ...display, fontSize: "10px" }} className="px-4 py-2 rounded-lg text-white">
            NEW ROOM
          </button>
        </div>
      )}
    </div>
  );
}
