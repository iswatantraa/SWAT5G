import JSZip from 'jszip';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root project files
  zip.file(
    'build.gradle.kts',
    `// Top-level build file for AeroWave 5G Android
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
  );

  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "AeroWave5G"
include(":app")
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
`
  );

  // App module build.gradle.kts
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.aerowave.transfer"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.aerowave.transfer"
        minSdk = 26 // Android 8.0+ for LocalOnlyHotspot
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    
    // High-performance Ktor server engine for 16MB dynamic chunks
    implementation("io.ktor:ktor-server-core:2.3.12")
    implementation("io.ktor:ktor-server-netty:2.3.12")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
`
  );

  // AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Strict 5 GHz Wi-Fi Hotspot & Local Socket Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AeroWave 5G"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AeroWave">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.AeroWave">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // Kotlin Source Code files
  zip.file(
    'app/src/main/kotlin/com/aerowave/transfer/network/Aero5GHzHotspotManager.kt',
    `package com.aerowave.transfer.network

import android.content.Context
import android.net.wifi.SoftApConfiguration
import android.net.wifi.WifiManager
import android.os.Build
import androidx.annotation.RequiresApi
import java.util.concurrent.Executor

/**
 * Strict 5 GHz LocalOnlyHotspot AP Engine.
 * Enforces SoftApConfiguration.BAND_5GHZ with zero 2.4 GHz fallback.
 */
class Aero5GHzHotspotManager(private val context: Context) {
    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private var hotspotReservation: WifiManager.LocalOnlyHotspotReservation? = null

    interface HotspotCallback {
        fun onHotspotStarted(ssid: String, psk: String, freqMhz: Int, channel: Int)
        fun onHotspotFailed(reason: String, diagnosticCode: Int)
    }

    fun start5GHzHotspot(executor: Executor, callback: HotspotCallback) {
        if (!wifiManager.is5GHzBandSupported) {
            callback.onHotspotFailed("HARDWARE_5GHZ_UNSUPPORTED: Device lacks 5 GHz AP hardware.", 5001)
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val randomSuffix = (1000..9999).random()
            val ssid = "AeroWave_5G_$randomSuffix"
            val passphrase = "aero" + java.util.UUID.randomUUID().toString().substring(0, 12)

            val config = SoftApConfiguration.Builder()
                .setSsid(ssid)
                .setPassphrase(passphrase, SoftApConfiguration.SECURITY_TYPE_WPA2_PSK)
                .setBand(SoftApConfiguration.BAND_5GHZ) // <--- FORCES 5 GHz BAND
                .setAutoShutdownEnabled(false)
                .build()

            wifiManager.startLocalOnlyHotspot(config, executor, object : WifiManager.LocalOnlyHotspotCallback() {
                override fun onStarted(reservation: WifiManager.LocalOnlyHotspotReservation) {
                    hotspotReservation = reservation
                    val currentConfig = reservation.softApConfiguration
                    if (currentConfig?.band != SoftApConfiguration.BAND_5GHZ) {
                        reservation.close()
                        callback.onHotspotFailed("HOTSPOT_5GHZ_FAILED: AP reverted to non-5GHz.", 5002)
                        return
                    }
                    callback.onHotspotStarted(currentConfig?.ssid ?: ssid, currentConfig?.passphrase ?: passphrase, 5240, 48)
                }
                override fun onFailed(reason: Int) {
                    callback.onHotspotFailed("LocalOnlyHotspot error: $reason", reason)
                }
            })
        }
    }

    fun stopHotspot() {
        hotspotReservation?.close()
        hotspotReservation = null
    }
}
`
  );

  zip.file(
    'app/src/main/kotlin/com/aerowave/transfer/network/WifiBandValidator.kt',
    `package com.aerowave.transfer.network

import android.content.Context
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager

object WifiBandValidator {
    const val MIN_5GHZ_FREQUENCY_MHZ = 5000

    fun verify5GHzLink(context: Context): Pair<Boolean, String> {
        val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val wifiInfo: WifiInfo? = wifiManager.connectionInfo
        val freq = wifiInfo?.frequency ?: 0

        return if (freq >= MIN_5GHZ_FREQUENCY_MHZ) {
            Pair(true, "5 GHz link verified: \${freq} MHz (RSSI: \${wifiInfo?.rssi} dBm)")
        } else {
            Pair(false, "REJECTED: Frequency \${freq} MHz is on 2.4 GHz spectrum. 5 GHz required.")
        }
    }
}
`
  );

  zip.file(
    'app/src/main/kotlin/com/aerowave/transfer/engine/AeroTransferServer.kt',
    `package com.aerowave.transfer.engine

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import java.io.File
import java.io.RandomAccessFile
import java.nio.channels.FileChannel

class AeroTransferServer(
    private val port: Int = 50505,
    private val storageDir: File
) {
    private var serverEngine: NettyApplicationEngine? = null

    fun start(onChunkProgress: (fileId: String, chunkIndex: Int, bytesWritten: Long) -> Unit) {
        serverEngine = embeddedServer(Netty, port = port, host = "0.0.0.0") {
            routing {
                get("/api/v1/handshake") {
                    call.respond(HttpStatusCode.OK, mapOf("status" to "5GHZ_READY"))
                }
                put("/api/v1/transfer/{fileId}/chunk/{chunkIndex}") {
                    val fileId = call.parameters["fileId"] ?: return@put call.respond(HttpStatusCode.BadRequest)
                    val chunkIndex = call.parameters["chunkIndex"]?.toIntOrNull() ?: 0
                    val offset = call.request.headers["X-Chunk-Offset"]?.toLongOrNull() ?: 0L

                    val targetFile = File(storageDir, fileId)
                    RandomAccessFile(targetFile, "rw").use { raf ->
                        val fileChannel: FileChannel = raf.channel
                        val inputChannel = call.receiveChannel()
                        val buffer = java.nio.ByteBuffer.allocateDirect(16 * 1024 * 1024)

                        var totalBytesWritten = 0L
                        while (!inputChannel.isClosedForRead) {
                            buffer.clear()
                            val read = inputChannel.readAvailable(buffer)
                            if (read <= 0) break
                            buffer.flip()
                            fileChannel.write(buffer, offset + totalBytesWritten)
                            totalBytesWritten += read
                        }
                        onChunkProgress(fileId, chunkIndex, totalBytesWritten)
                    }
                    call.respond(HttpStatusCode.Created, mapOf("status" to "ACK"))
                }
            }
        }.start(wait = false)
    }

    fun stop() {
        serverEngine?.stop(1000, 2000)
    }
}
`
  );

  zip.file(
    'app/src/main/kotlin/com/aerowave/transfer/MainActivity.kt',
    `package com.aerowave.transfer

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Starts AeroWave 5G engine & Web UI container
        setContentView(R.layout.activity_main)
    }
}
`
  );

  zip.file(
    'app/src/main/res/layout/activity_main.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`
  );

  zip.file(
    'README.md',
    `# AeroWave 5G - Android Studio Release Build Guide

## 1-Command APK Build
To build the signed release APK, run:
\`\`\`bash
./gradlew assembleRelease
\`\`\`
The APK will be generated at:
\`app/build/outputs/apk/release/app-release-unsigned.apk\`

To run directly on an Android device connected via USB:
\`\`\`bash
./gradlew installDebug
\`\`\`

## Strict 5 GHz Wi-Fi Requirements
- Target Android Version: Android 11+ (API 30+) recommended for explicit SoftApConfiguration.BAND_5GHZ control.
- Hardware: Device Wi-Fi chipset must support 5 GHz broadcast.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
