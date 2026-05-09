package com.example.campusqueue.network

import com.example.campusqueue.network.models.*
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.PATCH

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

    @PATCH("rest/v1/users")
    fun updatePublicUser(@retrofit2.http.Query("auth_id") authId: String, @Body request: PublicUserUpdateRequest): Call<Void>
    
    @GET("rest/v1/services")
    fun getServices(@retrofit2.http.Query("is_open") isOpen: String = "eq.true", @retrofit2.http.Query("order") order: String = "name"): Call<List<Service>>

    @GET("rest/v1/queue_entries?select=*,services(name)")
    fun getMyQueueEntry(
        @retrofit2.http.Query("user_id") userId: String,
        @retrofit2.http.Query("status") status: String = "in.(waiting,called)"
    ): Call<List<QueueEntry>>

    @POST("rest/v1/queue_entries")
    fun joinQueue(@Body request: QueueJoinRequest): Call<Void>

    @GET("rest/v1/queue_entries?select=id")
    fun getUserQueues(@retrofit2.http.Query("user_id") userId: String): Call<List<Map<String, String>>>
    
    // Admin endpoints
    @GET("rest/v1/queue_entries?select=*,services(id,name,icon,wait_time_min,queue_count,is_open,accent_color),users(full_name,email)&status=eq.waiting&order=joined_at.asc")
    fun getAllQueueEntries(): Call<List<QueueEntry>>

    @PATCH("rest/v1/queue_entries")
    fun updateQueueStatus(
        @retrofit2.http.Query("id") idQuery: String, // Expects "eq.$id"
        @Body request: QueueStatusUpdateRequest
    ): Call<Void>

    // We mock Dashboard stats by fetching Public services for example, or simply a GET to user
    @GET("auth/v1/user")
    fun getDashboard(): Call<SupabaseUserResponse>
}
