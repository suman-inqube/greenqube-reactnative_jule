// public class ConfigModule {
    
// }
package com.green_04_11;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.inqube.greenqube.BuildConfig;
public class ConfigModule extends ReactContextBaseJavaModule {

    public ConfigModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ConfigModule";
    }

    @ReactMethod
    public void getGradleValue(Promise promise) {
        try {
            promise.resolve(BuildConfig.baseUrl);
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }
}
