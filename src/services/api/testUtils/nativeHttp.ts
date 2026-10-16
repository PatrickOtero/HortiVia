// Install before importing Axios: adapter availability is detected at module load.
// Only the native transport is simulated; Axios and React Native FormData are real.
type Reply = {
  status?: number;
  body?: unknown;
  event?: 'error' | 'timeout' | 'abort';
};

export class MockXMLHttpRequest {
  static requests: MockXMLHttpRequest[] = [];
  static replies: Reply[] = [];

  headers: Record<string, string> = {};
  timeout = 0;
  status = 0;
  statusText = '';
  responseType = '';
  response: unknown;
  responseText = '';
  onload: (() => void) | null = null;
  onloadend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor() {
    MockXMLHttpRequest.requests.push(this);
  }

  open = jest.fn();
  abort = jest.fn();
  getAllResponseHeaders = () => 'Content-Type: application/json\r\n';
  setRequestHeader = (name: string, value: string) => {
    this.headers[name.toLowerCase()] = value;
  };

  send = jest.fn((_body?: unknown) => {
    const reply = MockXMLHttpRequest.replies.shift();
    if (!reply) {
      throw new Error('No simulated XHR response configured');
    }
    if (reply.event) {
      this[`on${reply.event}`]?.();
      return;
    }
    this.status = reply.status ?? 200;
    this.response = reply.body;
    this.responseText =
      typeof reply.body === 'string'
        ? reply.body
        : JSON.stringify(reply.body ?? null);
    this.onload?.();
    this.onloadend?.();
  });
}

const nativeFormData = jest.requireActual<{ default: typeof FormData }>(
  'react-native/Libraries/Network/FormData',
).default;
const globals = {
  XMLHttpRequest: MockXMLHttpRequest,
  FormData: nativeFormData,
  navigator: { product: 'ReactNative' },
};
const descriptors = Object.keys(globals).map(
  name => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
);

Object.entries(globals).forEach(([name, value]) => {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  });
});

beforeEach(() => {
  MockXMLHttpRequest.requests = [];
  MockXMLHttpRequest.replies = [];
});

afterAll(() => {
  descriptors.forEach(([name, descriptor]) => {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, name);
    }
  });
});
