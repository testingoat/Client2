package com.goatgoat.app

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "grocery_app"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Android 8 compatibility fixes
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    // IMPORTANT: prevent Fragment restoration for react-native-screens
    // See: https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
    // Passing null here ensures ScreenStackFragment is not recreated from a saved state,
    // which was causing: "Screen fragments should never be restored" crashes when
    // the app process was killed and the activity was re-created.
    super.onCreate(null)

    // Fix for Android 8 threading issues
    try {
      // Ensure proper initialization order
      Thread.sleep(100)
    } catch (e: InterruptedException) {
      Thread.currentThread().interrupt()
    }
  }
}
