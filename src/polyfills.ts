// Polyfills for Node.js modules in browser environment
(window as any).global = globalThis;
(window as any).process = {
  env: {},
  nextTick: (fn: Function) => setTimeout(fn, 0),
  platform: 'browser',
  version: 'v16.0.0',
  versions: { node: '16.0.0' },
  cwd: () => '/',
  exit: () => {},
  argv: [],
  binding: () => ({}),
};

// Create comprehensive module mocks
const mocks: { [key: string]: any } = {
  'fs': {
    readFileSync: () => '',
    writeFileSync: () => {},
    existsSync: () => false,
    promises: {
      readFile: () => Promise.resolve(''),
      writeFile: () => Promise.resolve(),
    }
  },
  'path': {
    join: (...args: string[]) => args.join('/'),
    resolve: (...args: string[]) => args.join('/'),
    dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
    basename: (path: string) => path.split('/').pop() || '',
    extname: (path: string) => {
      const parts = path.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    }
  },
  'os': {
    platform: () => 'browser',
    arch: () => 'x64',
    cpus: () => [{}],
    totalmem: () => 8000000000,
    freemem: () => 4000000000,
    availableParallelism: () => navigator.hardwareConcurrency || 4
  },
  'crypto': {
    createHash: () => ({ update: () => ({}), digest: () => 'hash' }),
    randomBytes: (size: number) => new Uint8Array(size)
  },
  'util': {
    promisify: (fn: Function) => fn,
    inspect: (obj: any) => JSON.stringify(obj),
    format: (...args: any[]) => args.join(' ')
  },
  'events': {
    EventEmitter: class EventEmitter {
      on() { return this; }
      emit() { return false; }
      off() { return this; }
      removeAllListeners() { return this; }
    }
  },
  'stream': {
    Readable: class Readable {},
    Writable: class Writable {},
    Transform: class Transform {}
  },
  'child_process': {
    exec: () => {},
    spawn: () => ({}),
    execSync: () => ''
  },
  'sharp': {
    // Mock sharp with basic functionality
    default: function(input?: any) {
      return {
        resize: () => ({}),
        toBuffer: () => Promise.resolve(new Uint8Array()),
        png: () => ({}),
        jpeg: () => ({}),
        webp: () => ({})
      };
    }
  },
  'detect-libc': {
    family: 'glibc',
    version: '2.31',
    isNonGlibcLinux: false
  }
};

// Add node: prefixed modules
const nodeModules: { [key: string]: any } = {
  'node:fs': mocks['fs'],
  'node:path': mocks['path'],
  'node:os': mocks['os'],
  'node:crypto': mocks['crypto'],
  'node:util': mocks['util'],
  'node:events': mocks['events'],
  'node:stream': mocks['stream'],
  'node:child_process': mocks['child_process']
};

// Mock Node.js require function
(window as any).require = (id: string) => {
  return mocks[id] || nodeModules[id] || {};
};

// Buffer polyfill
if (!(window as any).Buffer) {
  (window as any).Buffer = {
    from: (data: any) => new Uint8Array(typeof data === 'string' ? [...data].map(c => c.charCodeAt(0)) : data),
    alloc: (size: number) => new Uint8Array(size),
    isBuffer: (obj: any) => obj instanceof Uint8Array
  };
}

// Comprehensive module resolution override
// Store original import function if it exists
const originalImport = (window as any).import;

// Create a module registry for our mocked modules
const moduleRegistry = new Map();

// Register our mock modules
moduleRegistry.set('sharp', {
  default: function sharp(input?: any) {
    return {
      resize: () => ({}),
      toBuffer: () => Promise.resolve(new Uint8Array()),
      png: () => ({}),
      jpeg: () => ({}),
      webp: () => ({})
    };
  }
});

moduleRegistry.set('detect-libc', {
  default: {
    family: 'glibc',
    version: '2.31',
    isNonGlibcLinux: false
  },
  family: 'glibc',
  version: '2.31',
  isNonGlibcLinux: false
});

// Register all other Node.js modules
Object.keys(mocks).forEach(key => {
  if (!moduleRegistry.has(key)) {
    moduleRegistry.set(key, { default: mocks[key], ...mocks[key] });
  }
});

Object.keys(nodeModules).forEach(key => {
  if (!moduleRegistry.has(key)) {
    moduleRegistry.set(key, { default: nodeModules[key], ...nodeModules[key] });
  }
});

// Create a custom import function
async function customImport(specifier: string): Promise<any> {
  // Check if we have a mock for this module
  if (moduleRegistry.has(specifier)) {
    return Promise.resolve(moduleRegistry.get(specifier));
  }
  
  // For other modules, fall back to original behavior or throw appropriate error
  if (originalImport) {
    try {
      return await originalImport(specifier);
    } catch (e) {
      console.warn(`Failed to import ${specifier}, returning empty module:`, e);
      return { default: {} };
    }
  }
  
  // If no original import, return empty module
  console.warn(`Module ${specifier} not found, returning empty module`);
  return { default: {} };
}

// Override window import
(window as any).import = customImport;

// Override dynamic imports in SystemJS if present
if ((window as any).System && (window as any).System.import) {
  const originalSystemImport = (window as any).System.import;
  (window as any).System.import = function(specifier: string) {
    if (mocks[specifier] || nodeModules[specifier]) {
      return Promise.resolve({ default: mocks[specifier] || nodeModules[specifier] });
    }
    return originalSystemImport.call(this, specifier);
  };
}
