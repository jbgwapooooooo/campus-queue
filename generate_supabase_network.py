import os

base_dir = r"c:\Users\L24Y09W20\Downloads\campus-queue-main\CampusQueueAndroid"

SUPABASE_URL = "https://toayrzzqhnspxhkaljwm.supabase.co/"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYXlyenpxaG5zcHhoa2FsandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjQyNzcsImV4cCI6MjA4Njc0MDI3N30.ge6vTfuhwr2zwDLPtff3slwygVFdhltWWOonqt-s9Do"

files = {
    "app/src/main/java/com/example/campusqueue/network/RetrofitClient.kt": f"""package com.example.campusqueue.network

import com.example.campusqueue.utils.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {{
    private const val BASE_URL = "{SUPABASE_URL}"
    private const val API_KEY = "{SUPABASE_KEY}"

    private val authInterceptor = Interceptor {{ chain ->
        val req = chain.request()
        val token = SessionManager.fetchToken()
        
        val builder = req.newBuilder()
            .addHeader("apikey", API_KEY)
        
        if (token != null) {{
            builder.addHeader("Authorization", "Bearer $token")
        }} else {{
            builder.addHeader("Authorization", "Bearer $API_KEY")
        }}

        chain.proceed(builder.build())
    }}

    private val client = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    val instance: ApiService by lazy {{
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }}
}}
""",
    "app/src/main/java/com/example/campusqueue/network/ApiService.kt": """package com.example.campusqueue.network

import com.example.campusqueue.network.models.*
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface ApiService {
    @POST("auth/v1/signup")
    fun register(@Body request: RegisterRequest): Call<SupabaseAuthResponse>

    @POST("auth/v1/token?grant_type=password")
    fun login(@Body request: LoginRequest): Call<SupabaseAuthResponse>

    @GET("auth/v1/user")
    fun getProfile(): Call<SupabaseUserResponse>

    @PUT("auth/v1/user")
    fun updateProfile(@Body request: UpdateProfileRequest): Call<SupabaseUserResponse>

    @PUT("auth/v1/user")
    fun changePassword(@Body request: ChangePasswordRequest): Call<SupabaseUserResponse>
    
    // We mock Dashboard stats by fetching Public services for example, or simply a GET to user
    @GET("auth/v1/user")
    fun getDashboard(): Call<SupabaseUserResponse>
}
""",
    "app/src/main/java/com/example/campusqueue/network/models/Models.kt": """package com.example.campusqueue.network.models
import com.google.gson.annotations.SerializedName

// Requests
data class RegisterRequest(val email: String, val password: String, val data: Map<String, String>? = null)
data class LoginRequest(val email: String, val password: String)
data class UpdateProfileRequest(val data: Map<String, String>)
data class ChangePasswordRequest(val password: String)

// Responses
data class SupabaseAuthResponse(
    @SerializedName("access_token") val access_token: String,
    @SerializedName("user") val user: SupabaseUser
)
data class SupabaseUserResponse(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("user_metadata") val user_metadata: Map<String, String>?
)
data class SupabaseUser(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String
)
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Retrofit Supabase Refactor completed.")
