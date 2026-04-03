import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { KNOWN_WORKFLOWS } from './dependencies';
import { LANGUAGE_PROFILES } from './profiles';

// biome-ignore lint/suspicious/noExplicitAny: mock functions need any for argument capture
type AnyFn = (...args: any[]) => any;

const mockText = mock<AnyFn>(() => Promise.resolve('myproject'));
const mockMultiselect = mock<AnyFn>(() => Promise.resolve(['implement']));
const mockIntro = mock<AnyFn>(() => {});
const mockCancel = mock<AnyFn>(() => {});
const mockIsCancel = mock<AnyFn>(() => false);

mock.module('@clack/prompts', () => ({
  text: mockText,
  multiselect: mockMultiselect,
  intro: mockIntro,
  cancel: mockCancel,
  isCancel: mockIsCancel,
}));

const { collectInteractiveOptions } = await import('./interactive');

describe('collectInteractiveOptions', () => {
  beforeEach(() => {
    mockText.mockReset();
    mockMultiselect.mockReset();
    mockIntro.mockReset();
    mockCancel.mockReset();
    mockIsCancel.mockReset();

    mockText.mockResolvedValue('myproject');
    mockMultiselect.mockResolvedValue(['implement']);
    mockIsCancel.mockReturnValue(false);
  });

  it('calls intro with setup message', async () => {
    await collectInteractiveOptions();

    expect(mockIntro).toHaveBeenCalledWith('agentic setup');
  });

  it('returns selected IDEs, namespace, workflows, and profiles', async () => {
    mockText.mockResolvedValue('myns');
    mockMultiselect
      .mockResolvedValueOnce(['claude', 'cursor'])
      .mockResolvedValueOnce(['implement', 'debug'])
      .mockResolvedValueOnce(['typescript']);

    const result = await collectInteractiveOptions();

    expect(result.ides).toEqual(['claude', 'cursor']);
    expect(result.namespace).toBe('myns');
    expect(result.workflows).toEqual(['implement', 'debug']);
    expect(result.profiles).toEqual(['typescript']);
  });

  it('returns undefined workflows when none selected', async () => {
    mockMultiselect
      .mockResolvedValueOnce(['claude'])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['typescript']);

    const result = await collectInteractiveOptions();

    expect(result.workflows).toBeUndefined();
  });

  it('returns undefined profiles when none selected', async () => {
    mockMultiselect
      .mockResolvedValueOnce(['claude'])
      .mockResolvedValueOnce(['implement'])
      .mockResolvedValueOnce([]);

    const result = await collectInteractiveOptions();

    expect(result.profiles).toBeUndefined();
  });

  it('passes defaults to IDE multiselect initialValues', async () => {
    await collectInteractiveOptions({ ides: ['claude', 'cursor'] });

    const firstMultiselect = mockMultiselect.mock.calls[0][0];
    expect(firstMultiselect.initialValues).toEqual(['claude', 'cursor']);
  });

  it('passes defaults to text defaultValue', async () => {
    await collectInteractiveOptions({ namespace: 'custom-ns' });

    const textCall = mockText.mock.calls[0][0];
    expect(textCall.defaultValue).toBe('custom-ns');
  });

  it('passes workflow defaults to multiselect initialValues', async () => {
    await collectInteractiveOptions({ workflows: ['implement', 'debug'] });

    const secondMultiselect = mockMultiselect.mock.calls[1][0];
    expect(secondMultiselect.initialValues).toEqual(['implement', 'debug']);
  });

  it('passes profile defaults to multiselect initialValues', async () => {
    await collectInteractiveOptions({ profiles: ['typescript'] });

    const thirdMultiselect = mockMultiselect.mock.calls[2][0];
    expect(thirdMultiselect.initialValues).toEqual(['typescript']);
  });

  it('provides all IDE choices via multiselect', async () => {
    await collectInteractiveOptions();

    const firstMultiselect = mockMultiselect.mock.calls[0][0];
    const values = firstMultiselect.options.map((o: { value: string }) => o.value);
    expect(values).toEqual(['claude', 'cursor', 'codex']);
  });

  it('provides all workflow choices', async () => {
    await collectInteractiveOptions();

    const secondMultiselect = mockMultiselect.mock.calls[1][0];
    const values = secondMultiselect.options.map((o: { value: string }) => o.value);
    expect(values).toEqual([...KNOWN_WORKFLOWS]);
  });

  it('provides all profile choices', async () => {
    await collectInteractiveOptions();

    const thirdMultiselect = mockMultiselect.mock.calls[2][0];
    const values = thirdMultiselect.options.map((o: { value: string }) => o.value);
    expect(values).toEqual(LANGUAGE_PROFILES.map((p) => p.name));
  });

  it('uses empty array as default IDE when no defaults provided', async () => {
    await collectInteractiveOptions();

    const firstMultiselect = mockMultiselect.mock.calls[0][0];
    expect(firstMultiselect.initialValues).toEqual([]);
  });

  it('uses "agentic" as default namespace when no defaults provided', async () => {
    await collectInteractiveOptions();

    const textCall = mockText.mock.calls[0][0];
    expect(textCall.defaultValue).toBe('agentic');
    expect(textCall.placeholder).toBe('agentic');
  });

  it('sets multiselect required to false for IDEs', async () => {
    await collectInteractiveOptions();

    const firstMultiselect = mockMultiselect.mock.calls[0][0];
    expect(firstMultiselect.required).toBe(false);
  });

  it('sets multiselect required to false for workflows', async () => {
    await collectInteractiveOptions();

    const secondMultiselect = mockMultiselect.mock.calls[1][0];
    expect(secondMultiselect.required).toBe(false);
  });

  it('sets multiselect required to false for profiles', async () => {
    await collectInteractiveOptions();

    const thirdMultiselect = mockMultiselect.mock.calls[2][0];
    expect(thirdMultiselect.required).toBe(false);
  });
});
