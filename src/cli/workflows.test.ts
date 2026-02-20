import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { parseSettingsArgs } from './commands/settings';
import { parseWorkflowsOption } from './index';

describe('parseWorkflowsOption', () => {
  it('returns undefined when no --workflows flag', () => {
    expect(parseWorkflowsOption(['init', '--ide', 'claude'])).toBeUndefined();
  });

  it('returns undefined when -w flag missing', () => {
    expect(parseWorkflowsOption(['init'])).toBeUndefined();
  });

  it('parses --workflows with comma-separated values', () => {
    expect(parseWorkflowsOption(['init', '--workflows', 'product-spec,implement'])).toEqual([
      'product-spec',
      'implement',
    ]);
  });

  it('parses -w shorthand', () => {
    expect(parseWorkflowsOption(['init', '-w', 'debug'])).toEqual(['debug']);
  });

  it('parses -w with multiple values', () => {
    expect(parseWorkflowsOption(['-w', 'product-spec,debug,implement'])).toEqual([
      'product-spec',
      'debug',
      'implement',
    ]);
  });

  it('trims whitespace around workflow names', () => {
    expect(parseWorkflowsOption(['-w', ' product-spec , implement '])).toEqual([
      'product-spec',
      'implement',
    ]);
  });

  it('filters empty strings from splitting', () => {
    expect(parseWorkflowsOption(['-w', 'product-spec,,implement,'])).toEqual([
      'product-spec',
      'implement',
    ]);
  });

  it('returns undefined when --workflows has no value', () => {
    expect(parseWorkflowsOption(['init', '--workflows'])).toBeUndefined();
  });

  it('returns undefined when -w has no value', () => {
    expect(parseWorkflowsOption(['init', '-w'])).toBeUndefined();
  });

  it('works with --workflows at any position in args', () => {
    expect(
      parseWorkflowsOption(['--ide', 'claude', '--workflows', 'debug', '--output', 'out']),
    ).toEqual(['debug']);
  });

  it('prefers --workflows over -w when both present', () => {
    // --workflows is checked first, so it wins
    const result = parseWorkflowsOption(['--workflows', 'implement', '-w', 'debug']);
    expect(result).toEqual(['implement']);
  });
});

describe('parseSettingsArgs --workflows', () => {
  let exitSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('parses --workflows flag', () => {
    const options = parseSettingsArgs(['--workflows', 'product-spec,implement']);
    expect(options.workflows).toEqual(['product-spec', 'implement']);
  });

  it('parses -w shorthand', () => {
    const options = parseSettingsArgs(['-w', 'debug']);
    expect(options.workflows).toEqual(['debug']);
  });

  it('returns no workflows when flag absent', () => {
    const options = parseSettingsArgs(['--ide', 'claude']);
    expect(options.workflows).toBeUndefined();
  });

  it('trims whitespace and filters empties', () => {
    const options = parseSettingsArgs(['-w', ' implement , ,debug ']);
    expect(options.workflows).toEqual(['implement', 'debug']);
  });

  it('parses -w alongside other options', () => {
    const options = parseSettingsArgs([
      '--ide',
      'claude',
      '-w',
      'product-spec',
      '--output',
      'custom_out',
    ]);

    expect(options.workflows).toEqual(['product-spec']);
    expect(options.ide).toBe('claude');
    expect(options.outputFolder).toBe('custom_out');
  });
});
