import os

base_dir = r"c:\Users\L24Y09W20\Downloads\campus-queue-main\CampusQueueAndroid"

files = {
    "build.gradle": """// Top-level build file
buildscript {
    ext.kotlin_version = '1.8.0'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
""",
    "settings.gradle": """pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "CampusQueueAndroid"
include ':app'
""",
    "gradle.properties": """org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
""",
    "app/build.gradle": """plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    namespace 'com.example.campusqueue'
    compileSdk 33

    defaultConfig {
        applicationId "com.example.campusqueue"
        minSdk 24
        targetSdk 33
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.9.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.8.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    
    // Retrofit & Gson
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
}
""",
    "app/src/main/AndroidManifest.xml": """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.campusqueue">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CampusQueue"
        android:usesCleartextTraffic="true">
        
        <activity android:name=".ui.LoginActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity android:name=".ui.RegisterActivity" />
        <activity android:name=".ui.DashboardActivity" />
        <activity android:name=".ui.ProfileActivity" />
        <activity android:name=".ui.UpdateProfileActivity" />
        <activity android:name=".ui.ChangePasswordActivity" />
    </application>

</manifest>
""",
    "app/src/main/res/values/strings.xml": """<resources>
    <string name="app_name">CampusQueue</string>
</resources>
""",
    "app/src/main/res/values/themes.xml": """<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.CampusQueue" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="colorPrimary">@color/purple_500</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorSecondary">@color/teal_200</item>
        <item name="colorSecondaryVariant">@color/teal_700</item>
        <item name="colorOnSecondary">@color/black</item>
    </style>
</resources>
""",
    "app/src/main/res/values/colors.xml": """<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
</resources>
""",
    "app/src/main/java/com/example/campusqueue/network/RetrofitClient.kt": """package com.example.campusqueue.network

import com.example.campusqueue.utils.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // Replace with your actual backed URL, use 10.0.2.2 for Android emulator testing local nodejs
    private const val BASE_URL = "http://10.0.2.2:3000/api/"

    private val authInterceptor = Interceptor { chain ->
        val req = chain.request()
        val token = SessionManager.fetchToken()
        if (token != null) {
            val newReq = req.newBuilder().addHeader("Authorization", "Bearer $token").build()
            chain.proceed(newReq)
        } else {
            chain.proceed(req)
        }
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
""",
    "app/src/main/java/com/example/campusqueue/network/ApiService.kt": """package com.example.campusqueue.network

import com.example.campusqueue.network.models.*
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface ApiService {
    @POST("auth/register")
    fun register(@Body request: RegisterRequest): Call<GenericResponse>

    @POST("auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @GET("user/dashboard")
    fun getDashboard(): Call<DashboardResponse>

    @GET("user/profile")
    fun getProfile(): Call<ProfileResponse>

    @PUT("user/profile")
    fun updateProfile(@Body request: UpdateProfileRequest): Call<GenericResponse>

    @PUT("user/password")
    fun changePassword(@Body request: ChangePasswordRequest): Call<GenericResponse>
}
""",
    "app/src/main/java/com/example/campusqueue/utils/SessionManager.kt": """package com.example.campusqueue.utils

import android.content.Context
import android.content.SharedPreferences

object SessionManager {
    private const val PREF_NAME = "CampusQueueApp"
    private const val TOKEN = "token"
    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    fun saveToken(token: String) {
        prefs.edit().putString(TOKEN, token).apply()
    }

    fun fetchToken(): String? {
        return prefs.getString(TOKEN, null)
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
""",
    "app/src/main/java/com/example/campusqueue/network/models/Models.kt": """package com.example.campusqueue.network.models

data class RegisterRequest(val email: String, val password: String, val name: String)
data class LoginRequest(val email: String, val password: String)

data class LoginResponse(val token: String, val message: String)
data class GenericResponse(val message: String)

data class DashboardResponse(val stats: String, val message: String)
data class ProfileResponse(val name: String, val email: String)
data class UpdateProfileRequest(val name: String)
data class ChangePasswordRequest(val oldPassword: String, val newPassword: String)
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Scaffold completed.")
