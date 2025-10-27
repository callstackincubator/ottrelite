import { NitroModules } from 'react-native-nitro-modules';

import type {
  OttreliteOptions,
  ReactNativeOttrelite,
} from './specs/ReactNativeOttrelite.nitro';
import type { OttreliteBackend } from './types/OttreliteBackend';
import type { OttreliteBackendInfo } from './types/OttreliteBackendInfo';
import type { StackTraceEntry } from './types/StackTraceEntry';

const devBundleExtractFileUrlRegex =
  /(.*)https?:\/\/\S+:\d+\/([^/]+)\/+[^:]*(.*)/;

export class Ottrelite {
  private static wasInstallCalled: boolean = false;

  /**
   * Indicates whether Ottrelite is enabled or not.
   */
  private static enabled: boolean = false;

  static hybridObject: ReactNativeOttrelite;

  private static safelyIterateBackendsList(
    backends: OttreliteBackend[],
    callback: (backend: OttreliteBackend) => void
  ) {
    let i = 0;
    for (const backend of backends) {
      if (typeof backend.install === 'function') {
        callback(backend);
      } else {
        console.warn(
          `[Ottrelite] Backend at index ${i} does not have an install() method - ignoring.`
        );
      }
      i++;
    }
  }

  /**
   * Used to register the backends you want to use in your application.
   * You can pass an array of backend classes to this function, and it will initialize them, making all invocations to the core API be passed to the backends **that support them**.
   *
   * Not all backends support all API calls; sometimes the support level may depend on e.g. the minimum Android API level targeted by your application (which is the case for the ATrace
   * backend) - please consult the `README.md` files of the individual backends for detailed information.
   *
   * @param backends Array of backend classes to register; these classes are pure imports from the individual backend packages.
   * @param options Optional configuration.
   */
  static install(
    backends: OttreliteBackend[] = [],
    options: OttreliteOptions = { enabled: true }
  ) {
    if (this.wasInstallCalled) {
      throw new Error(
        "Ottrelite.install() has already been called. This method can only be called once in an app's lifetime."
      );
    }

    Ottrelite.hybridObject =
      NitroModules.createHybridObject<ReactNativeOttrelite>(
        'ReactNativeOttrelite'
      );

    Ottrelite._setEnabled(options.enabled || options.enabled === undefined);

    // @ts-ignore-next-line - this method must NOT be generated in C++ code by nitro codegen,
    // as it should accept the jsi::Runtime instance; thus, it's not typed on the HybridObject
    Ottrelite.hybridObject.install();

    Ottrelite.hybridObject.configure(options);

    Ottrelite.safelyIterateBackendsList(backends, (backend) =>
      backend.install()
    );

    console.log(
      `[Ottrelite] Installed Ottrelite with ${Ottrelite._listInstalledBackends().length} backend(s), with enabled-state: ${Ottrelite.isEnabled() ? 'enabled' : 'disabled'}.`
    );

    this.wasInstallCalled = true;
  }

  /**
   * Asserts that Ottrelite.install() has been called; throws an error if not.
   */
  protected static assertInstallCalled() {
    if (!Ottrelite.wasInstallCalled) {
      throw new Error(
        'Ottrelite.install() must be called before using any other Ottrelite methods.'
      );
    }
  }

  /**
   * Checks whether Ottrelite is enabled.
   * @returns true if Ottrelite is enabled, false otherwise.
   */
  static isEnabled(): boolean {
    return Ottrelite.enabled;
  }

  /**
   * Sets the enabled state of Ottrelite.
   * @param enabled whether to enable Ottrelite.
   */
  static setEnabled(enabled: boolean): void {
    Ottrelite.assertInstallCalled();

    Ottrelite._setEnabled(enabled);
  }

  protected static _setEnabled(enabled: boolean): void {
    Ottrelite.enabled = enabled;
    Ottrelite.hybridObject.setEnabled(enabled);
  }

  /**
   * Begins tracing a new event using the synchronous API.
   * Needs to have a matching invocation of endEvent() to close the event.
   *
   * @param eventName The name of the event to begin
   * @param additionalArgs Optional map of additional event metadata
   */
  static beginEvent(
    eventName: string,
    additionalArgs?: Record<string, string>
  ) {
    if (!Ottrelite.isEnabled()) return;

    Ottrelite.assertInstallCalled();

    Ottrelite.hybridObject.beginEvent(
      eventName,
      Ottrelite.getJsStackTrace(),
      additionalArgs
    );
  }

  /**
   * Ends tracing a previously started event in a given frame using the synchronous API.
   */
  static endEvent(additionalArgs?: Record<string, string>): void {
    if (!Ottrelite.isEnabled()) return;

    Ottrelite.assertInstallCalled();

    Ottrelite.hybridObject.endEvent(additionalArgs);
  }

  /**
   * Begins tracing a new event using the asynchronous API
   * (allowing multiple events with the same name simultaneously).
   *
   * @param eventName The name of the event to begin
   * @param additionalArgs Optional map of additional event metadata
   *
   * @return Token assigned to this trace entry, required to end this event
   */
  static beginAsyncEvent(
    eventName: string,
    additionalArgs?: Record<string, string>
  ): number {
    if (!Ottrelite.isEnabled()) return -1;

    Ottrelite.assertInstallCalled();

    return Ottrelite.hybridObject.beginAsyncEvent(
      eventName,
      Ottrelite.getJsStackTrace(),
      additionalArgs
    );
  }

  /**
   * Ends tracing a previously started event in a given frame using the asynchronous API.
   *
   * @param eventName The name of the event to begin
   * @param token Token returned by beginAsyncEvent
   * @param additionalArgs Optional map of additional event metadata
   */
  static endAsyncEvent(
    eventName: string,
    token: number,
    additionalArgs?: Record<string, string>
  ): void {
    if (!Ottrelite.isEnabled()) return;

    Ottrelite.assertInstallCalled();

    Ottrelite.hybridObject.endAsyncEvent(eventName, token, additionalArgs);
  }

  /**
   * Registers a counter event with a given value.
   *
   * @param eventName The name of the event
   * @param value The numerical value of the counter event
   */
  static counterEvent(eventName: string, value: number): void {
    if (!Ottrelite.isEnabled()) return;

    Ottrelite.assertInstallCalled();

    Ottrelite.hybridObject.counterEvent(eventName, value);
  }

  /**
   * Returns detailed information about the currently-installed backends.
   *
   * @return List of details of installed backends
   */
  static listInstalledBackends(): OttreliteBackendInfo[] {
    Ottrelite.assertInstallCalled();

    return Ottrelite._listInstalledBackends();
  }

  protected static _listInstalledBackends(): OttreliteBackendInfo[] {
    return Ottrelite.hybridObject.listInstalledBackends();
  }

  private static getJsStackTrace(): StackTraceEntry[] {
    return (
      new Error().stack
        ?.split(/\r?\n/)
        .slice(3) // skip both the error construction, this method call & the invocation to Ottrelite
        .map((entry) => entry.trim().replace(/^\s+at\s+/, ''))
        .map((entry) => {
          // if applicable, strip the querystring from the URL
          const urlMatches = devBundleExtractFileUrlRegex.exec(entry);
          if (urlMatches && urlMatches.length >= 3) {
            entry = `${urlMatches[1]}${urlMatches[2]}${urlMatches[3]}`;
          }

          // strip the trailing ), if present
          if (entry.endsWith(')')) {
            entry = entry.slice(0, -1).trim();
          }

          const matches = /at (.+) \(?(.+):(\d+):(\d+)\)?/gm.exec(entry);

          if (!matches || matches.length < 4) {
            return null;
          }

          const [_, functionName, file, lineStr, columnStr] = matches;
          const line = parseInt(lineStr!, 10);
          const column = parseInt(columnStr!, 10);

          return { functionName, file, line, column } as StackTraceEntry;
        })
        .filter((entry) => entry !== null) ?? []
    );
  }
}

export default Ottrelite;
