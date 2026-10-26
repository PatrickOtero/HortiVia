package com.frutinavigator

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class HortiViaConfigModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = "HortiViaConfig"

  override fun getConstants(): MutableMap<String, Any> = mutableMapOf(
    "environment" to BuildConfig.HORTIVIA_API_ENVIRONMENT,
  )
}

class HortiViaConfigPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == "HortiViaConfig") HortiViaConfigModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(
      "HortiViaConfig" to ReactModuleInfo(
        "HortiViaConfig",
        HortiViaConfigModule::class.java.name,
        false,
        false,
        false,
        false,
      ),
    )
  }
}
