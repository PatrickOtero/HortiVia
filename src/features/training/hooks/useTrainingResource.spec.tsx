import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { useTrainingResource } from './useTrainingResource';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe('useTrainingResource request ownership and stale responses', () => {
  let renderer: Renderer.ReactTestRenderer;
  let resource: ReturnType<typeof useTrainingResource<string>>;
  function Probe({
    load,
    loadOnMount = true,
  }: {
    load: () => Promise<string>;
    loadOnMount?: boolean;
  }) {
    resource = useTrainingResource(load, { loadOnMount });
    return null;
  }
  afterEach(async () => {
    await act(async () => renderer.unmount());
  });

  it('loads once by default and supports an explicit focus-owned initial load', async () => {
    const load = jest.fn().mockResolvedValue('initial');
    await act(async () => {
      renderer = Renderer.create(<Probe load={load} />);
    });
    expect(load).toHaveBeenCalledTimes(1);
    expect(resource.data).toBe('initial');
    await act(async () => {
      renderer.unmount();
      renderer = Renderer.create(<Probe load={load} loadOnMount={false} />);
    });
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => {
      await resource.refresh();
    });
    expect(load).toHaveBeenCalledTimes(2);
    expect(resource.data).toBe('initial');
  });

  it('keeps the newest request loading when an older response finishes first', async () => {
    const old = deferred<string>(),
      next = deferred<string>();
    const load = jest
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(next.promise);
    await act(async () => {
      renderer = Renderer.create(<Probe load={load} />);
    });
    let refresh!: Promise<void>;
    await act(async () => {
      refresh = resource.refresh();
    });
    await act(async () => {
      old.resolve('obsolete');
    });
    expect(resource.isLoading).toBe(true);
    expect(resource.data).toBeNull();
    await act(async () => {
      next.resolve('current');
      await refresh;
    });
    expect(resource.data).toBe('current');
    expect(resource.isLoading).toBe(false);
  });

  it('does not turn an obsolete failure into an error after a successful refresh', async () => {
    const old = deferred<string>();
    const load = jest
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce('current');
    await act(async () => {
      renderer = Renderer.create(<Probe load={load} />);
    });
    await act(async () => {
      await resource.refresh();
    });
    await act(async () => {
      old.reject(new Error('obsolete network failure'));
    });
    expect(resource.data).toBe('current');
    expect(resource.error).toBe(false);
    expect(resource.isLoading).toBe(false);
  });

  it('invalidates pending data when the loader changes', async () => {
    const old = deferred<string>();
    const loadOld = jest.fn().mockReturnValue(old.promise),
      loadNew = jest.fn().mockResolvedValue('new product');
    await act(async () => {
      renderer = Renderer.create(<Probe load={loadOld} />);
    });
    await act(async () => {
      renderer.update(<Probe load={loadNew} />);
    });
    await act(async () => {
      old.resolve('old product');
    });
    expect(resource.data).toBe('new product');
    expect(loadNew).toHaveBeenCalledTimes(1);
  });
});
