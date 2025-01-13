import '@testing-library/jest-dom';

// Mock XMLHttpRequest for file upload tests
class MockXMLHttpRequest {
  constructor() {
    this.upload = {
      onprogress: null,
    };
    this.onload = null;
    this.onerror = null;
    this.status = 200;
    this.responseText = '';
  }

  open() {}
  send() {
    if (this.upload.onprogress) {
      this.upload.onprogress({
        lengthComputable: true,
        loaded: 50,
        total: 100,
      });
    }
    if (this.onload) {
      this.onload();
    }
  }
}

global.XMLHttpRequest = MockXMLHttpRequest;

// Mock FormData
global.FormData = class {
  constructor() {
    this.data = new Map();
  }
  append(key, value) {
    this.data.set(key, value);
  }
  get(key) {
    return this.data.get(key);
  }
};

// Mock File API
global.File = class {
  constructor(bits, name, options = {}) {
    this.name = name;
    this.size = bits.length;
    this.type = options.type || '';
  }
};

// Mock drag and drop events
global.DragEvent = class extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.dataTransfer = {
      files: [],
      items: [],
      types: [],
    };
  }
};
