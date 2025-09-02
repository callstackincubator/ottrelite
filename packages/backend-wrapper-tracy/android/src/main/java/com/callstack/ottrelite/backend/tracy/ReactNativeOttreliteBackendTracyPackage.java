package com.callstack.ottrelite.backend.tracy;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.margelo.nitro.ottrelite.backend.tracy.ReactNativeOttrelite_BackendTracyOnLoad;

import java.util.HashMap;

public class ReactNativeOttreliteBackendTracyPackage extends TurboReactPackage {
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
    ReactNativeOttrelite_BackendTracyOnLoad.initializeNative();
  }
}
