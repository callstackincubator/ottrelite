package com.callstack.ottrelite.backend.platform;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.margelo.nitro.ottrelite.backend.platform.ReactNativeOttrelite_BackendPlatformOnLoad;

import java.util.HashMap;

public class ReactNativeOttreliteBackendPlatformPackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
    return null;
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
        return new HashMap<>();
    };
  }

  static {
    ReactNativeOttrelite_BackendPlatformOnLoad.initializeNative();
  }
}
