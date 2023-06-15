import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import forage from './utils/forage'
import { uuid, sendMessage } from './utils'
import api from "./utils/api";
import autoSync from './utils/autoSync';


let persistedCount = 0;
function storePersisted() {
  persistedCount++;
  if (persistedCount >= 4) {
    autoSync();
  }
}
class LoadingStore {
  constructor() {
    makeAutoObservable(this)
  };
  list = [];
  get loading() {
    return this.list.length > 0;
  }
  get getList() {
    return this.list;
  }
  add(task) {
    const id = Math.random().toString(16).slice(2);
    this.list.push({ task, id });
    return id;
  }
  remove(id) {
    this.list = this.list.filter((item) => item.id !== id);
  }
}
class CacheStore {
  constructor() {
    makeAutoObservable(this)
    makePersistable(this, {
      name: 'DeepL-Crack-PersistCache',
      properties: ['persistCache'],
      storage: forage,
      stringify: false
    })
      .finally(() => storePersisted('PersistCache'))
  };
  cache = new Map();
  persistCache = new Map();
  get(key, persist = false) {
    return persist ? this.persistCache.get(key) : this.cache.get(key);
  }
  set(key, value, persist = false) {
    if (persist) {
      this.persistCache.set(key, value);
    } else {
      this.cache.set(key, value);
    }
  }
}
class ConfigStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this)
    makePersistable(this, {
      name: 'DeepL-Crack-Config',
      properties: ['config'],
      storage: forage,
      stringify: false
    })
      .finally(() => storePersisted('Config'))
  };
  config = {
    announcements: []
  };
  get getAnnouncements() {
    return this.config.announcements
  }
  setAnnouncements(announcements) {
    this.config.announcements = announcements;
  }
}
class WindowsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this)
  };
  announcements = false
  documentsManager = false
  tokensAndCredentialsManager = false
  get getAnnouncements() {
    return this.announcements
  }
  get getDocumentsManager() {
    return this.documentsManager
  }
  get getTokensAndCredentialsManager() {
    return this.tokensAndCredentialsManager
  }
  toggle(name) {
    this[name] = !this[name];
  }
}
class DocumentsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'DeepL-Crack-Documents',
      properties: ['documents'],
      storage: forage,
      stringify: false,
    })
      .finally(() => storePersisted('Documents'))
  };
  documents = [];
  delete(name) {
    this.documents = this.documents.filter(doc => doc.name !== name);
  }
  clean() {
    this.documents = [];
  }
  get list() {
    return this.documents
  }
  add(document, specifiedName) {
    this.delete(document.name || specifiedName);
    const blob = new Blob([document], { type: document.type });
    this.documents.push({
      name: specifiedName || document.name,
      blob
    });
  }
  modify(name, blob) {
    this.documents = this.documents.map(doc => {
      if (doc.name === name) {
        return {
          ...doc,
          blob
        }
      }
      return doc;
    })
  }
}

class TokensAndCredentialsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'DeepL-Crack-TokensAndCredentials',
      properties: ['tokensAndCredentials', 'activeId', 'UUID'],
      storage: forage,
      stringify: false,
    })
      .finally(() => storePersisted('TokensAndCredentials'))
  };
  tokensAndCredentials = [];
  activeId = null;
  UUID = null;
  get getUUID() {
    if (!this.UUID) {
      this.UUID = uuid();
    }
    return this.UUID;
  }
  setUUID(uuid) {
    this.UUID = uuid;
  }
  setActiveId(id) {
    this.activeId = id;
  }
  get activeTokenOrCredential() {
    return this.tokensAndCredentials.find(t => t.id === this.activeId) || null;
  }
  delete(id) {
    this.tokensAndCredentials = this.tokensAndCredentials.filter(t => t.id !== id);
  }
  get list() {
    return this.tokensAndCredentials
  }
  clean() {
    this.tokensAndCredentials = this.tokensAndCredentials.filter(t => t.licensing === 'LOCAL');
  }
  add(token) {
    if (this.tokensAndCredentials.find(t => t.id === token.id)) {
      this.tokensAndCredentials = this.tokensAndCredentials.map(t => {
        if (t.id === token.id) {
          return token;
        }
        return t;
      })
    } else {
      this.tokensAndCredentials.push(token);
    }
  }
  async updateTokenQuota(id) {
    const token = this.tokensAndCredentials.find(t => t.id === id);
    if (!token) {
      return;
    }
    await sendMessage({
      method: 'setApiToken',
      params: {
        token: token.data.token,
      }
    });
    const response = await fetch('https://api-free.deepl.com/v2/usage');
    let { character_count = 0, character_limit = 0 } = await response.json();
    switch (response.status) {
      case 456:
        break;
      case 200:
        break;
      default:
        return;
    }
    await api.updateTokenQuota(id, character_count, character_limit);
    const updatedToken = {
      ...token,
      data: {
        ...token.data,
        character_count,
        character_limit
      }
    };
    add(updatedToken);
  }
}
class RootStore {
  constructor() {
    this.cacheStore = new CacheStore(this);
    this.windowsStore = new WindowsStore(this);
    this.loadingStore = new LoadingStore(this);
    this.configStore = new ConfigStore(this);
    this.documentsStore = new DocumentsStore(this);
    this.tokensAndCredentialsStore = new TokensAndCredentialsStore(this);
  }
}
const store = new RootStore();

export default store;