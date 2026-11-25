/**
 * Synthetic-only session-switch model for QA.
 * This is NOT the app auth implementation and never connects to Supabase/Firebase.
 */
class SessionSwitchModel {
  constructor() {
    this.userId = null;
    this.generation = 0;
    this.privateRows = [];
    this.listenerCount = 0;
  }

  login(userId) {
    if (!['fixture-user-a', 'fixture-user-b'].includes(userId)) {
      throw new Error('Only synthetic fixture identities are allowed');
    }
    this.generation += 1;
    this.userId = userId;
    this.privateRows = [];
    return this.snapshot();
  }

  logout() {
    this.generation += 1;
    this.userId = null;
    this.privateRows = [];
    this.listenerCount = 0;
    return this.snapshot();
  }

  snapshot() {
    return { userId: this.userId, generation: this.generation, rows: [...this.privateRows] };
  }

  async request(loader) {
    if (!this.userId) throw new Error('Anonymous protected request denied');
    const capturedUserId = this.userId;
    const capturedGeneration = this.generation;
    const rows = await loader(capturedUserId);
    if (this.userId !== capturedUserId || this.generation !== capturedGeneration) {
      return { accepted: false, rows: [] };
    }
    this.privateRows = rows.filter(row => row.userId === capturedUserId);
    return { accepted: true, rows: [...this.privateRows] };
  }

  restore(userId, valid = true) {
    if (!valid || !['fixture-user-a', 'fixture-user-b'].includes(userId)) {
      this.logout();
      return false;
    }
    this.login(userId);
    return true;
  }
}

module.exports = { SessionSwitchModel };
