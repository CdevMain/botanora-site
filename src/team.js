'use strict';
// Equipe do painel: usuários, permissões, histórico de alterações e backups.
//
// - O dono é o usuário do .env (ADMIN_USER / ADMIN_PASSWORD): tem todas as permissões e não pode ser removido.
// - Outros usuários ficam em db.admins, com senha em scrypt (sal próprio) e uma lista de permissões.
// - Toda ação que muda algo no painel entra no histórico (db.audit): quem, o quê, quando.
// - Backups: cópia diária do banco em data/backups (mantém os 14 mais recentes) e backup manual pelo painel.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const store = require('./store');

// Permissões (chave -> rótulo exibido no painel)
const PERMS = {
  stats: 'Ver visão geral e métricas',
  sales: 'Pedidos, clientes e compras de teste',
  catalog: 'Catálogo: guias, PDFs e recomendações',
  content: 'Conteúdo diário e banco de receitas (editar)',
  'content.publish': 'Publicar receitas no site',
  community: 'Moderar avaliações e perguntas (aprovar, recusar)',
  'community.answer': 'Responder perguntas como Botânora',
  campaigns: 'Ver campanhas e links de campanha',
  'campaigns.edit': 'Pausar, ativar e mudar orçamento de campanhas',
  reports: 'Gerar e baixar relatórios',
  settings: 'Integrações e perfil do dono',
  users: 'Usuários e permissões',
  backups: 'Backups, histórico e limpeza de dados'
};
const ROLES = {
  gerente: { label: 'Gerente', perms: Object.keys(PERMS).filter(p => !['users', 'backups'].includes(p)) },
  marketing: { label: 'Marketing', perms: ['stats', 'campaigns', 'campaigns.edit', 'reports', 'content'] },
  moderacao: { label: 'Moderação', perms: ['stats', 'community', 'community.answer'] },
  conteudo: { label: 'Conteúdo', perms: ['stats', 'content', 'content.publish', 'catalog'] },
  leitura: { label: 'Somente leitura', perms: ['stats', 'campaigns'] }
};

function box() {
  const db = store.db;
  if (!Array.isArray(db.admins)) db.admins = [];
  if (!Array.isArray(db.audit)) db.audit = [];
  return db;
}

// ---------- senhas ----------
function hashPass(pass, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(String(pass), salt, 64).toString('hex') };
}
function checkPass(pass, salt, hash) {
  const h = crypto.scryptSync(String(pass), salt, 64);
  const b = Buffer.from(String(hash), 'hex');
  return b.length === h.length && crypto.timingSafeEqual(h, b);
}
const same = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };

const OWNER = () => ({ id: 'owner', user: config.adminUser, name: (box().meta.owner && box().meta.owner.name) || 'Dono', owner: true, perms: Object.keys(PERMS), active: true });

// Confere usuário e senha. Retorna o usuário (sem hash) ou null
function verify(user, pass) {
  user = String(user || '').trim();
  if (config.adminPassword && same(user, config.adminUser) && same(pass, config.adminPassword)) return OWNER();
  const u = box().admins.find(a => a.user.toLowerCase() === user.toLowerCase() && a.active);
  if (!u || !checkPass(pass, u.salt, u.hash)) return null;
  u.lastLogin = Date.now(); store.save();
  return publicUser(u);
}
const publicUser = u => ({ id: u.id, user: u.user, name: u.name, perms: u.perms.slice(), active: u.active, owner: false, createdAt: u.createdAt, lastLogin: u.lastLogin || null });
function byId(id) {
  if (id === 'owner') return OWNER();
  const u = box().admins.find(a => a.id === id);
  return u ? publicUser(u) : null;
}
// Recarrega permissões a cada requisição (mudanças valem na hora; usuário desativado perde o acesso)
function current(id) { const u = byId(id); return u && u.active ? u : null; }
const can = (u, perm) => !!u && (u.owner || u.perms.includes(perm));

const USER_RE = /^[a-z0-9._-]{3,32}$/i;
function cleanPerms(list) { return [...new Set((Array.isArray(list) ? list : []).filter(p => PERMS[p]))]; }
function createUser({ user, name, pass, perms }) {
  user = String(user || '').trim();
  if (!USER_RE.test(user)) return { error: 'user' };
  if (user.toLowerCase() === String(config.adminUser).toLowerCase() || box().admins.some(a => a.user.toLowerCase() === user.toLowerCase())) return { error: 'exists' };
  if (String(pass || '').length < 10) return { error: 'pass' };
  const u = { id: crypto.randomBytes(5).toString('hex'), user, name: String(name || user).slice(0, 60), perms: cleanPerms(perms), active: true, createdAt: Date.now(), ...hashPass(pass) };
  box().admins.push(u); store.save();
  return { user: publicUser(u) };
}
function updateUser(id, { name, perms, active, pass }) {
  const u = box().admins.find(a => a.id === id);
  if (!u) return { error: 'not_found' };
  if (name !== undefined) u.name = String(name).slice(0, 60);
  if (perms !== undefined) u.perms = cleanPerms(perms);
  if (active !== undefined) u.active = !!active;
  if (pass !== undefined && pass !== '') { if (String(pass).length < 10) return { error: 'pass' }; Object.assign(u, hashPass(pass)); }
  store.save();
  return { user: publicUser(u) };
}
function removeUser(id) {
  const i = box().admins.findIndex(a => a.id === id);
  if (i < 0) return false;
  box().admins.splice(i, 1); store.save(); return true;
}
const listUsers = () => [OWNER(), ...box().admins.map(publicUser)];

// ---------- histórico ----------
const ipTag = ip => crypto.createHash('sha256').update('audit|' + config.sessionSecret + '|' + ip).digest('hex').slice(0, 8);
function log(u, action, target = '', detail = '', ip = '') {
  const db = box();
  db.audit.unshift({ t: Date.now(), by: u ? u.user : '?', name: u ? u.name : '', action, target: String(target).slice(0, 120), detail: String(detail).slice(0, 300), ip: ip ? ipTag(ip) : '' });
  if (db.audit.length > 3000) db.audit.length = 3000;
  store.save();
}
const history = (n = 300, filter = '') => box().audit.filter(e => !filter || e.action.startsWith(filter)).slice(0, n);

// ---------- backups ----------
const BACKUP_DIR = path.join(config.dataDir, 'backups');
const KEEP = 14;
function backup(reason = 'auto') {
  store.flush();
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).replace(/[^0-9]/g, '').slice(0, 12);
  const name = `db-${stamp}-${reason === 'auto' ? 'auto' : 'manual'}.json`;
  fs.copyFileSync(path.join(config.dataDir, 'db.json'), path.join(BACKUP_DIR, name));
  // mantém só os mais recentes de cada tipo
  for (const kind of ['auto', 'manual']) {
    const files = listBackups().filter(b => b.kind === kind);
    files.slice(KEEP).forEach(b => { try { fs.unlinkSync(path.join(BACKUP_DIR, b.name)); } catch (_) {} });
  }
  return name;
}
function listBackups() {
  try {
    return fs.readdirSync(BACKUP_DIR).filter(f => /^db-\d{12}-(auto|manual)\.json$/.test(f))
      .map(f => { const st = fs.statSync(path.join(BACKUP_DIR, f)); return { name: f, kind: f.includes('-auto') ? 'auto' : 'manual', size: st.size, t: st.mtimeMs }; })
      .sort((a, b) => b.t - a.t);
  } catch (_) { return []; }
}
const backupFile = name => /^db-\d{12}-(auto|manual)\.json$/.test(name) && fs.existsSync(path.join(BACKUP_DIR, name)) ? path.join(BACKUP_DIR, name) : null;
// backup automático: um por dia
function dailyBackup() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()).replace(/-/g, '');
  if (!listBackups().some(b => b.kind === 'auto' && b.name.startsWith('db-' + today))) { try { backup('auto'); } catch (e) { console.error('backup:', e.message); } }
}

// ---------- perfil do dono (aparece nas respostas da comunidade) ----------
function owner() { const m = box().meta; return Object.assign({ name: 'Equipe Botânora', role: { pt: 'Autora dos guias', en: 'Guide author' }, photo: '' }, m.owner || {}); }
function setOwner({ name, rolePt, roleEn, photo }) {
  const m = box().meta, o = owner();
  if (name !== undefined) o.name = String(name).slice(0, 60) || o.name;
  if (rolePt !== undefined) o.role = Object.assign({}, o.role, { pt: String(rolePt).slice(0, 60) });
  if (roleEn !== undefined) o.role = Object.assign({}, o.role, { en: String(roleEn).slice(0, 60) });
  if (photo !== undefined) o.photo = String(photo);
  m.owner = o; store.save(); return o;
}

module.exports = { PERMS, ROLES, verify, current, can, listUsers, createUser, updateUser, removeUser, log, history, backup, listBackups, backupFile, dailyBackup, owner, setOwner, BACKUP_DIR };
