/**
 * Synthetic browser-session flow harness for FRIEND RIDE QA.
 * Mock-only: no real auth SDK, backend, tokens, network, or app login.
 */
const ALLOWED_IDS = new Set(['fixture-user-a', 'fixture-user-b']);

class SessionFlowHarness {
  constructor() {
    this.identity = null;
    this.role = null;
    this.approval = null;
    this.admin = false;
    this.privateNotifications = [];
    this.generation = 0;
    this.listeners = new Set();
  }

  _isFixture(id) { return ALLOWED_IDS.has(id); }
  _capture() { return { id: this.identity, generation: this.generation }; }
  _current(captured) {
    return this.identity === captured.id && this.generation === captured.generation;
  }

  async signIn(id, loaders = {}) {
    if (!this._isFixture(id)) throw new Error('Synthetic fixture identity required');
    this.generation++;
    this.identity = id;
    this.role = null;
    this.approval = null;
    this.admin = false;
    this.privateNotifications = [];
    const captured = this._capture();
    const profile = await (loaders.profile || (async () => ({ role: 'customer' })))(id);
    if (!this._current(captured)) return { accepted: false, reason: 'stale-profile' };
    const admin = await (loaders.adminMembership || (async () => false))(id);
    if (!this._current(captured)) return { accepted: false, reason: 'stale-admin' };
    if (!profile || !['customer', 'driver', 'partner', 'admin'].includes(profile.role)) {
      this.signOut();
      return { accepted: false, reason: 'invalid-role' };
    }
    if (profile.role === 'admin' && !admin) {
      this.signOut();
      return { accepted: false, reason: 'admin-membership-required' };
    }
    if (profile.role === 'driver' && !['approved', 'verified', 'active'].includes(profile.approval)) {
      this.signOut();
      return { accepted: false, reason: 'driver-approval-required' };
    }
    this.role = profile.role;
    this.approval = profile.approval || null;
    this.admin = !!admin;
    return { accepted: true, identity: id, role: this.role };
  }

  async loadNotifications(loader) {
    if (!this.identity) return { accepted: false, rows: [] };
    const captured = this._capture();
    const rows = await loader(captured.id);
    if (!this._current(captured)) return { accepted: false, rows: [] };
    const filtered = (rows || []).filter(row => row.userId === captured.id);
    this.privateNotifications = filtered;
    return { accepted: true, rows: [...filtered] };
  }

  restore(id, valid, loaders = {}) {
    if (!valid || !this._isFixture(id)) {
      this.signOut();
      return false;
    }
    // Restore runs through the same guarded profile/admin flow.
    return this.signIn(id, loaders);
  }

  signOut() {
    this.generation++;
    this.identity = null;
    this.role = null;
    this.approval = null;
    this.admin = false;
    this.privateNotifications = [];
    this.listeners.clear();
  }

  snapshot() {
    return {
      identity: this.identity, role: this.role, approval: this.approval,
      admin: this.admin, notifications: [...this.privateNotifications],
      generation: this.generation, listenerCount: this.listeners.size
    };
  }
}
module.exports = { SessionFlowHarness };
