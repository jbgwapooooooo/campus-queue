package com.example.campusqueue.utils

import android.content.Context
import android.widget.Toast
import org.json.JSONObject
import retrofit2.Response

object ApiErrorHandler {
    fun <T> handleError(context: Context, response: Response<T>) {
        try {
            val errorBody = response.errorBody()?.string()
            val errorMessage = if (errorBody != null) {
                JSONObject(errorBody).getString("message")
            } else {
                "Unknown error occurred"
            }
            
            val displayMessage = when(response.code()) {
                400 -> "Bad Request: $errorMessage"
                401 -> "Unauthorized: $errorMessage"
                500 -> "Server Error: $errorMessage"
                else -> errorMessage
            }
            Toast.makeText(context, displayMessage, Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Error: ${response.code()}", Toast.LENGTH_LONG).show()
        }
    }
    
    fun handleNetworkError(context: Context, t: Throwable) {
        Toast.makeText(context, "Network Error: Please check your internet connection.", Toast.LENGTH_LONG).show()
    }
}
