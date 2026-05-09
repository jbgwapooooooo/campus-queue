package com.example.campusqueue.features.profile.update

import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.LoginRequest
import com.example.campusqueue.network.models.PublicUserUpdateRequest
import com.example.campusqueue.network.models.SupabaseAuthResponse
import com.example.campusqueue.network.models.SupabaseUserResponse
import com.example.campusqueue.network.models.UpdateProfileRequest
import com.example.campusqueue.utils.SessionManager
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class UpdateProfilePresenter(private var view: UpdateProfileContract.View?) : UpdateProfileContract.Presenter {

    override fun fetchProfile() {
        RetrofitClient.instance.getProfile().enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                if (response.isSuccessful) {
                    val user = response.body()
                    val name = user?.user_metadata?.get("full_name") ?: user?.user_metadata?.get("name") ?: ""
                    val email = user?.email ?: ""
                    val avatar = user?.user_metadata?.get("avatar_base64")
                    view?.onProfileLoaded(name, email, avatar)
                }
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {}
        })
    }

    override fun updateProfileInfo(name: String, email: String, currentPass: String, newPass: String, avatarBase64: String?) {
        val currentEmail = SessionManager.getEmail() ?: ""
        val emailChanged = email.isNotEmpty() && email != currentEmail
        val passwordChanged = newPass.isNotEmpty()
        val needsReauth = emailChanged || passwordChanged

        if (needsReauth && currentPass.isEmpty()) {
            view?.showError("Current password required to change email or password")
            return
        }

        view?.showLoading()

        if (needsReauth) {
            // Re-authenticate first, then update
            RetrofitClient.instance.login(LoginRequest(currentEmail, currentPass)).enqueue(object : Callback<SupabaseAuthResponse> {
                override fun onResponse(call: Call<SupabaseAuthResponse>, response: Response<SupabaseAuthResponse>) {
                    if (response.isSuccessful) {
                        performUpdate(name, if (emailChanged) email else null, if (passwordChanged) newPass else null, avatarBase64)
                    } else {
                        view?.hideLoading()
                        view?.showError("Current password is incorrect")
                    }
                }
                override fun onFailure(call: Call<SupabaseAuthResponse>, t: Throwable) {
                    view?.hideLoading()
                    view?.showError("Network Error during re-authentication")
                }
            })
        } else {
            performUpdate(name, if (emailChanged) email else null, if (passwordChanged) newPass else null, avatarBase64)
        }
    }

    private fun performUpdate(name: String, emailToSubmit: String?, newPassToSubmit: String?, avatarBase64: String?) {
        val metadataMap = mutableMapOf<String, String>()
        if (name.isNotEmpty()) metadataMap["full_name"] = name
        if (avatarBase64 != null) metadataMap["avatar_base64"] = avatarBase64

        val req = UpdateProfileRequest(
            data = if (metadataMap.isNotEmpty()) metadataMap else null,
            email = emailToSubmit,
            password = newPassToSubmit
        )

        RetrofitClient.instance.updateProfile(req).enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                if (response.isSuccessful) {
                    val userId = response.body()?.id
                    if (userId != null) {
                        val publicReq = PublicUserUpdateRequest(
                            full_name = name.ifEmpty { response.body()?.user_metadata?.get("full_name") ?: "" },
                            avatar_base64 = avatarBase64
                        )
                        RetrofitClient.instance.updatePublicUser("eq.$userId", publicReq).enqueue(object : Callback<Void> {
                            override fun onResponse(call: Call<Void>, res: Response<Void>) {
                                view?.hideLoading()
                                if (res.isSuccessful) view?.onProfileUpdated()
                                else view?.showError("Failed to sync public profile")
                            }
                            override fun onFailure(call: Call<Void>, t: Throwable) {
                                view?.hideLoading()
                                view?.showError("Network Error syncing profile")
                            }
                        })
                    } else {
                        view?.hideLoading()
                        view?.showError("Failed to retrieve user id")
                    }
                } else {
                    view?.hideLoading()
                    view?.showError("Failed to update profile")
                }
            }
            override fun onFailure(call: Call<SupabaseUserResponse>, t: Throwable) {
                view?.hideLoading()
                view?.showError("Network Error")
            }
        })
    }

    override fun onDestroy() { view = null }
}
