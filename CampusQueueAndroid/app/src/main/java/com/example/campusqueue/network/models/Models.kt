package com.example.campusqueue.network.models
import com.google.gson.annotations.SerializedName

// Requests
data class RegisterRequest(val email: String, val password: String, val data: Map<String, String>? = null)
data class LoginRequest(val email: String, val password: String)
data class UpdateProfileRequest(
    val data: Map<String, String>? = null,
    val email: String? = null,
    val password: String? = null
)
data class ChangePasswordRequest(val password: String)
data class PublicUserUpdateRequest(val full_name: String, val avatar_base64: String? = null)
data class QueueJoinRequest(val user_id: String, val service_id: Int, val position: Int, val status: String = "waiting")

// Responses
data class SupabaseAuthResponse(
    @SerializedName("access_token") val access_token: String,
    @SerializedName("user") val user: SupabaseUser
)
data class SupabaseUserResponse(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("created_at") val created_at: String?,
    @SerializedName("user_metadata") val user_metadata: Map<String, String>?
)
data class SupabaseUser(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("user_metadata") val user_metadata: Map<String, String>? = null
)

data class Service(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("icon") val icon: String?,
    @SerializedName("wait_time_min") val wait_time_min: Int,
    @SerializedName("queue_count") val queue_count: Int,
    @SerializedName("is_open") val is_open: Boolean,
    @SerializedName("accent_color") val accent_color: String?
)

data class QueueEntry(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val user_id: String,
    @SerializedName("service_id") val service_id: Int,
    @SerializedName("position") val position: Int,
    @SerializedName("status") val status: String,
    @SerializedName("services") val services: Service? = null // Using embed if we select "*, services(name)"
)
