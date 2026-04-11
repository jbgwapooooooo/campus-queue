package com.example.campusqueue.utils

import android.content.Context
import android.content.SharedPreferences

object SessionManager {
    private const val PREF_NAME = "CampusQueueApp"
    private const val TOKEN = "token"
    private const val EMAIL = "email"
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

    fun saveEmail(email: String) {
        prefs.edit().putString(EMAIL, email).apply()
    }

    fun getEmail(): String? {
        return prefs.getString(EMAIL, null)
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
