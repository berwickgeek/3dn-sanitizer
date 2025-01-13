import '@testing-library/jest-dom';

// Mock XMLHttpRequest for file upload tests
class MockXMLHttpRequest {
  public upload = {
    onprogress: null,
  };
  public onload = null;
  public onerror = null;
  public status = 200;
  public responseText = '';

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

global.XMLHttpRequest = MockXMLHttpRequest as any;

// Mock FormData
global.FormData = class {
  private data = new Map();
  append(key: string, value: any) {
    this.data.set(key, value);
  }
  get(key: string) {
    return this.data.get(key);
  }
};

// Mock File API
global.File = class {
  name: string;
  size: number;
  type: string;

  constructor(bits: any[], name: string, options = {}) {
    this.name = name;
    this.size = bits.length;
    this.type = options.type || '';
  }
};

// Mock drag and drop events
const createDragEvent = (type: string) => {
  return {
    dataTransfer: {
      files: [],
      items: [],
      types: [],
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };
};

global.DragEvent = class extends Event {
  dataTransfer: any;

  constructor(type: string, options = {}) {
    super(type, options);
    this.dataTransfer = {
      files: [],
      items: [],
      types: [],
    };
  }
};
