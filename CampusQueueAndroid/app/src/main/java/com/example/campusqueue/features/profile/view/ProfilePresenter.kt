package com.example.campusqueue.features.profile.view

import com.example.campusqueue.network.RetrofitClient
import com.example.campusqueue.network.models.SupabaseUserResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfilePresenter(private var view: ProfileContract.View?) : ProfileContract.Presenter {
    override fun fetchProfile() {
        view?.showLoading()
        RetrofitClient.instance.getProfile().enqueue(object : Callback<SupabaseUserResponse> {
            override fun onResponse(call: Call<SupabaseUserResponse>, response: Response<SupabaseUserResponse>) {
                if (response.isSuccessful) {
                    val user = response.body()
                    val rawName = user?.user_metadata?.get("full_name") ?: user?.user_metadata?.get("name")
                    val name = rawName ?: "Student"
                    val email = user?.email ?: ""
                    val avatar = user?.user_metadata?.get("avatar_base64")
                    val dateStr = user?.created_at ?: "Unknown"
                    val memberSince = if (dateStr.length >= 10) dateStr.substring(0, 10) else dateStr
                    
                    if (user != null) {
                        RetrofitClient.instance.getUserQueues("eq.${user.id}").enqueue(object : Callback<List<Map<String, String>>> {
                            override fun onResponse(call: Call<List<Map<String, String>>>, queueRes: Response<List<Map<String, String>>>) {
                                view?.hideLoading()
                                val totalQueues = if (queueRes.isSuccessful) queueRes.body()?.size?.toString() ?: "0" else "0"
                                view?.onProfileLoaded(name, email, memberSince, totalQueues, avatar)
                            }
                            override fun onFailure(call: Call<List<Map<String, String>>>, t: Throwable) {
                                view?.hideLoading()
                                view?.onProfileLoaded(name, email, memberSince, "0", avatar)
                            }
                        })
                    } else {
                        view?.hideLoading()
                        view?.showError("User not found")
                    }
                } else {
                    view?.hideLoading()
                    view?.showError("Failed to fetch profile")
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
