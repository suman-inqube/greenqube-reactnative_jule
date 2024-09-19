package com.inqube.greenqube;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import android.os.Bundle;
public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "green_04_11";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  //   @Override
  // protected ReactActivityDelegate createReactActivityDelegate() {
  //   return new DefaultReactActivityDelegate(
  //       this,
  //       getMainComponentName(),
  //       // If you opted-in for the New Architecture, we enable the Fabric Renderer.
  //       DefaultNewArchitectureEntryPoint.getFabricEnabled());
  // }
    public DefaultReactActivityDelegate activityDelegate;
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    System.out.println("FirebaseCrashlytics createReactActivityDelegate");
    try{
    activityDelegate =  new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }catch(Exception e){
//        throw new RuntimeException("Crash"+e.getCause().fillInStackTrace());
        System.out.println("FirebaseCrashlytics ");
        FirebaseCrashlytics.getInstance().recordException(e.getCause().fillInStackTrace());
    }
        return activityDelegate;
  }
//    @Override
//    protected void onCreate(Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//
//        // Forcing a test crash
//       FirebaseCrashlytics.getInstance().log("MainActivity onCreate");
//       throw new RuntimeException("Test Crash"); // Force a crash
//    }
}
