import '@testing-library/jest-dom';

// Mock XMLHttpRequest
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  response: '',
  responseText: '',
  onload: null as any,
  onerror: null as any,
  upload: {
    onprogress: null as any,
  },
};

// @ts-ignore
window.XMLHttpRequest = jest.fn(() => mockXHR);

// Mock FormData
const mockFormData = {
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  forEach: jest.fn(),
  entries: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  [Symbol.iterator]: jest.fn(),
};

// @ts-ignore
window.FormData = jest.fn(() => mockFormData);

// Mock File
const mockFile = {
  arrayBuffer: jest.fn(),
  slice: jest.fn(),
  stream: jest.fn(),
  text: jest.fn(),
  lastModified: Date.now(),
  name: '',
  webkitRelativePath: '',
  size: 0,
  type: '',
};

// @ts-ignore
window.File = jest.fn((bits: any[], name: string, options = {}) => ({
  ...mockFile,
  name,
  size: bits.length,
  type: options.type || '',
}));

// Mock DragEvent
const mockDragEvent = {
  dataTransfer: {
    files: [] as File[],
    items: [] as DataTransferItem[],
    types: [] as string[],
    clearData: jest.fn(),
    getData: jest.fn(),
    setData: jest.fn(),
    setDragImage: jest.fn(),
  },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
};

// @ts-ignore
window.DragEvent = jest.fn((type: string) => ({
  ...new Event(type),
  ...mockDragEvent,
}));

// Export mocks for use in tests
export const mocks = {
  xhr: mockXHR,
  formData: mockFormData,
  file: mockFile,
  dragEvent: mockDragEvent,
};
