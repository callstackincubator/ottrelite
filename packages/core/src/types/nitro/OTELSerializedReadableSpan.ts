import type {
  AttributeValue,
  HrTime,
  Link,
  SpanContext,
  SpanKind,
  SpanStatus,
} from '@opentelemetry/api';
import type { InstrumentationScope } from '@opentelemetry/core';
import { type Resource } from '@opentelemetry/resources';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ReadableSpan used only in docstrings
import type { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';

/**
 * FIXME: this is because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue
 *
 * Wrapper required as Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
 */
// @ts-expect-error -- fix for Nitro
interface NitroFixedResource extends Resource {
  /**
   * @returns the Resource's attributes.
   */
  // Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
  readonly attributes?: Record<string, AttributeValue>;

  /**
   * Do not call this method - it is hidden here just to make sure that Nitro does not get into an inifinite recursion parsing this
   * @internal
   * @deprecated
   */
  merge: () => void;
}

/**
 * FIXME: this is because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue
 */
// @ts-expect-error -- fix for Nitro
export interface SpanContextWithSerializedTraceState extends SpanContext {
  traceState?: string;
}

/**
 * FIXME: this is because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue
 *
 * Wrapper required as Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
 */
// @ts-expect-error -- fix for Nitro
interface NitroFixedLink extends Link {
  /** The {@link SpanContext} of a linked span. */
  context: SpanContextWithSerializedTraceState;

  /** A set of SpanAttributes on the link. */
  // Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
  attributes?: Record<string, AttributeValue>;
}

/**
 * Wrapper required as Nitro cannot handle {[key:T]: R} types, which result in "Error: Empty structs are not supported in Nitrogen! Add at least one property to Attributes."
 */
interface NitroFixedTimedEvent extends TimedEvent {
  /** The attributes of the event. */
  attributes?: Record<string, AttributeValue>;
}

/**
 * Wrapper for @see {@link ReadableSpan} that takes into account the fact that the some props may be undefined (wrong OTEL typings), fixing Nitro Modules converter error in runtime in such case
 * FIXME: some props adjusted because of a bug in Nitro Modules that fails to compile TS types which recursively reference themselves; this may be dropped when Nitro fixes this issue
 */
export type SerializedReadableSpan = {
  readonly name: string;
  readonly kind: SpanKind;
  readonly spanContext: SpanContextWithSerializedTraceState;
  readonly parentSpanContext?: SpanContextWithSerializedTraceState;
  readonly startTime: HrTime;
  readonly endTime: HrTime;
  readonly status: SpanStatus;
  readonly attributes: Record<string, AttributeValue>;
  readonly links: NitroFixedLink[];
  readonly events: NitroFixedTimedEvent[];
  readonly duration?: HrTime; // <- modified
  readonly ended?: boolean; // <- modified
  readonly resource: NitroFixedResource;
  readonly instrumentationScope: InstrumentationScope;
  readonly droppedAttributesCount?: number; // <- modified
  readonly droppedEventsCount?: number; // <- modified
  readonly droppedLinksCount?: number; // <- modified
};
